import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for sensitive authentication routes (login/register).
 * Prevents brute-force credential stuffing attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Rate limiter for AI analysis endpoints.
 * Protects third-party API quotas (OpenRouter / Gemini) from quota exhaustion / cost spikes.
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 photo analysis calls per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI request limit reached. Please wait a few minutes before submitting more images.',
  },
});

/**
 * General API rate limiter to protect against denial-of-service (DoS).
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please try again later.',
  },
});
