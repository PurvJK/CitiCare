const GEMINI_API_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_MODEL_VISION = process.env.GEMINI_MODEL_VISION || GEMINI_MODEL;
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 8000);

function extractGeminiText(payload) {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((part) => (typeof part.text === 'string' ? part.text : ''))
    .join('')
    .trim();

  if (!text) {
    throw new Error(payload.error?.message || 'Gemini response did not include content');
  }

  return text;
}

async function callGemini(model, body) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const endpoint = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      const lowered = detail.toLowerCase();
      if (response.status === 429 || lowered.includes('resource_exhausted') || lowered.includes('quota')) {
        throw new Error('Gemini request failed: quota_exceeded');
      }
      if (response.status === 401 || response.status === 403 || lowered.includes('api key')) {
        throw new Error('Gemini request failed: auth_failed');
      }
      throw new Error(`Gemini request failed: status_${response.status} - ${detail}`);
    }

    const json = await response.json();
    return extractGeminiText(json);
  } finally {
    clearTimeout(timeout);
  }
}

export async function createGeminiTextCompletion(systemPrompt, userPrompt) {
  const content = await callGemini(GEMINI_MODEL, {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  return { content, model: GEMINI_MODEL };
}

export async function createGeminiVisionCompletion(input) {
  const content = await callGemini(GEMINI_MODEL_VISION, {
    systemInstruction: {
      parts: [{ text: input.systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          { text: `Context JSON: ${JSON.stringify(input.contextPayload)}` },
          {
            inline_data: {
              mime_type: input.mimeType,
              data: input.imageBuffer.toString('base64'),
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  return { content, model: GEMINI_MODEL_VISION };
}
