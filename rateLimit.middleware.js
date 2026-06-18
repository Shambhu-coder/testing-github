const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

/**
 * Stricter limiter for SMS send endpoints (prevents abuse)
 */
const smsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // max 20 SMS sends per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many SMS requests. Limit: 20/minute per IP.",
  },
});

/**
 * OTP endpoint – very strict (prevents OTP flooding)
 */
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // max 5 OTPs per 5 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please wait 5 minutes before retrying.",
  },
});

module.exports = { apiLimiter, smsLimiter, otpLimiter };
