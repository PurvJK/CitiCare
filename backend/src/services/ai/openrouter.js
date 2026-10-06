const OPENROUTER_API_BASE = process.env.OPENROUTER_API_BASE || 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free';
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 8000);

function getOpenRouterApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }
  return apiKey;
}

function extractOpenRouterText(payload) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === 'string' && content.trim()) {
    return content.trim();
  }
  if (Array.isArray(content)) {
    const text = content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim();
    if (text) return text;
  }
  throw new Error(payload?.error?.message || 'OpenRouter response did not include content');
}

function normalizeOpenRouterError(response, detail) {
  const lowered = detail.toLowerCase();
  if (response.status === 429 || lowered.includes('rate limit') || lowered.includes('quota')) {
    return 'OpenRouter request failed: quota_exceeded';
  }
  if (response.status === 401 || response.status === 403 || lowered.includes('api key')) {
    return 'OpenRouter request failed: auth_failed';
  }
  if (lowered.includes('no endpoints found') || lowered.includes('image input')) {
    return 'OpenRouter request failed: image_model_unavailable';
  }
  return `OpenRouter request failed: status_${response.status} - ${detail}`;
}

async function callOpenRouter(body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(`${OPENROUTER_API_BASE.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getOpenRouterApiKey()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://127.0.0.1:5173',
        'X-Title': 'CitiCare',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(normalizeOpenRouterError(response, text));
    }

    const json = JSON.parse(text);
    return extractOpenRouterText(json);
  } finally {
    clearTimeout(timeout);
  }
}

export async function createOpenRouterTextCompletion(systemPrompt, userPrompt) {
  const content = await callOpenRouter({
    model: OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
  });

  return { content, model: OPENROUTER_MODEL };
}

export async function createOpenRouterVisionCompletion(input) {
  const dataUrl = `data:${input.mimeType};base64,${input.imageBuffer.toString('base64')}`;
  const content = await callOpenRouter({
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: 'system',
        content: input.systemPrompt,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: `Context JSON: ${JSON.stringify(input.contextPayload)}` },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    temperature: 0.2,
  });

  return { content, model: OPENROUTER_MODEL };
}
