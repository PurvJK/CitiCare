import { sanitizeForAI } from './sanitizer.js';
import { createGeminiVisionCompletion } from './gemini.js';

const CATEGORY_VALUES = ['roads', 'water', 'electricity', 'garbage', 'sewage', 'street_lights', 'parks', 'other'];

function clampConfidence(value) {
  if (Number.isNaN(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

function detectCategoryFromText(value) {
  const text = value.toLowerCase();
  if (!text.trim()) return null;
  if (/\b(pothole|road|street|asphalt|traffic)\b/.test(text)) return 'roads';
  if (/\b(water|leak|pipeline|tap|supply)\b/.test(text)) return 'water';
  if (/\b(garbage|trash|waste|dump)\b/.test(text)) return 'garbage';
  if (/\b(sewage|drain|drainage|sewer)\b/.test(text)) return 'sewage';
  if (/\b(street light|streetlight|lamp post|lamp|dark)\b/.test(text)) return 'street_lights';
  if (/\b(electric|power|voltage|wire|transformer)\b/.test(text)) return 'electricity';
  if (/\b(park|garden|tree|playground)\b/.test(text)) return 'parks';
  return null;
}

function fallbackImageSuggestion(input, redactions, reason) {
  const textBlob = [input.title || '', input.description || '', input.address || ''].join(' ');
  const likelyCategory = detectCategoryFromText(textBlob);
  const fallbackDepartment = likelyCategory
    ? input.departments.find((dept) => (dept.category || '').toLowerCase() === likelyCategory)
    : null;

  return {
    suggested_title: input.title?.trim() || 'Civic issue reported from uploaded photo',
    suggested_description:
      input.description?.trim() ||
      'Issue detected from uploaded image. Please add exact location details, problem duration, and impact for faster resolution.',
    category_hint: likelyCategory,
    department_id: fallbackDepartment?.id ?? null,
    department_name: fallbackDepartment?.name ?? null,
    suggestions: [
      'Add the nearest landmark and lane/house number if available.',
      'Mention when the issue started and whether it is worsening.',
      'Describe safety impact (traffic, water logging, night visibility, etc.).',
    ],
    confidence: 0.45,
    source: 'fallback',
    fallback_reason: reason,
    model: null,
    redactions,
  };
}

function normalizeFallbackReasonFromError(error) {
  const message = String(error?.message || '').toLowerCase();

  if (!message) return 'request_failed';
  if (message.includes('429') || message.includes('resource_exhausted') || message.includes('quota')) return 'quota_exceeded';
  if (message.includes('abort') || message.includes('timeout')) return 'provider_timeout';
  if (message.includes('401') || message.includes('403') || message.includes('api key')) return 'provider_auth_failed';
  return 'provider_request_failed';
}

function bestDepartmentMatch(name, departments, categoryHint) {
  if (!departments.length) return null;

  const normalizedName = (name || '').trim().toLowerCase();
  if (normalizedName) {
    const exact = departments.find((dept) => dept.name.trim().toLowerCase() === normalizedName);
    if (exact) return exact;

    const contains = departments.find((dept) => dept.name.trim().toLowerCase().includes(normalizedName) || normalizedName.includes(dept.name.trim().toLowerCase()));
    if (contains) return contains;
  }

  if (categoryHint) {
    const byCategory = departments.find((dept) => (dept.category || '').toLowerCase() === categoryHint.toLowerCase());
    if (byCategory) return byCategory;
  }

  return departments[0] ?? null;
}

function parseModelJson(raw) {
  const parsed = JSON.parse(raw);

  const category = typeof parsed.category_hint === 'string' ? parsed.category_hint.trim() : '';
  const normalizedCategory = CATEGORY_VALUES.includes(category) ? category : 'other';

  return {
    suggested_title:
      typeof parsed.suggested_title === 'string' && parsed.suggested_title.trim().length > 0
        ? parsed.suggested_title.trim()
        : 'Civic issue detected from photo',
    suggested_description:
      typeof parsed.suggested_description === 'string' && parsed.suggested_description.trim().length > 0
        ? parsed.suggested_description.trim()
        : 'Issue detected from uploaded image. Please verify details before submitting.',
    category_hint: normalizedCategory,
    department_name: typeof parsed.department_name === 'string' ? parsed.department_name.trim() : null,
    suggestions: Array.isArray(parsed.suggestions)
      ? parsed.suggestions.filter((item) => typeof item === 'string').slice(0, 3)
      : [],
    confidence: clampConfidence(typeof parsed.confidence === 'number' ? parsed.confidence : 0.5),
  };
}

export async function generateImageSuggestions(input) {
  const safeTitle = sanitizeForAI(input.title || '');
  const safeDescription = sanitizeForAI(input.description || '');
  const safeAddress = sanitizeForAI(input.address || '');
  const redactions = safeTitle.redactions + safeDescription.redactions + safeAddress.redactions;

  if (process.env.AI_FEATURE_IMAGE_HELPER === 'false') {
    return fallbackImageSuggestion(input, redactions, 'feature_disabled');
  }

  if (!process.env.GEMINI_API_KEY) {
    return fallbackImageSuggestion(input, redactions, 'missing_api_key');
  }

  const availableDepartments = input.departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    category: dept.category || null,
  }));

  try {
    const systemPrompt = [
      'You assist citizens filing municipal complaints from images.',
      'Return strict JSON with keys: suggested_title, suggested_description, category_hint, department_name, suggestions, confidence.',
      'category_hint must be one of: roads, water, electricity, garbage, sewage, street_lights, parks, other.',
      'suggestions should be short and actionable (max 3).',
      'confidence is a number between 0 and 1.',
      'Never include personal data in outputs.',
    ].join(' ');

    const contextPayload = {
      title: safeTitle.sanitized || null,
      description: safeDescription.sanitized || null,
      address: safeAddress.sanitized || null,
      available_departments: availableDepartments,
    };

    const completion = await createGeminiVisionCompletion({
      systemPrompt,
      contextPayload,
      imageBuffer: input.imageBuffer,
      mimeType: input.mimeType,
    });
    const content = completion.content;
    const modelUsed = completion.model;

    if (!content) {
      return fallbackImageSuggestion(input, redactions, 'empty_provider_response');
    }

    const parsed = parseModelJson(content);
    const matchedDepartment = bestDepartmentMatch(parsed.department_name, input.departments, parsed.category_hint);

    return {
      suggested_title: parsed.suggested_title,
      suggested_description: parsed.suggested_description,
      category_hint: parsed.category_hint,
      department_id: matchedDepartment?.id ?? null,
      department_name: matchedDepartment?.name ?? parsed.department_name,
      suggestions: parsed.suggestions,
      confidence: parsed.confidence,
      source: 'ai',
      model: modelUsed,
      redactions,
    };
  } catch (error) {
    return fallbackImageSuggestion(input, redactions, normalizeFallbackReasonFromError(error));
  }
}
