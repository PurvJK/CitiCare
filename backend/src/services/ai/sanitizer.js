const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_REGEX = /(?<!\d)(?:\+?\d[\d\s-]{7,}\d)(?!\d)/g;

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

export function sanitizeForAI(input) {
  let redactions = 0;
  let sanitized = input;

  sanitized = sanitized.replace(EMAIL_REGEX, () => {
    redactions += 1;
    return '[REDACTED_EMAIL]';
  });

  sanitized = sanitized.replace(PHONE_REGEX, () => {
    redactions += 1;
    return '[REDACTED_PHONE]';
  });

  return {
    sanitized: normalizeWhitespace(sanitized),
    redactions,
  };
}
