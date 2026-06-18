const { body, param, validationResult } = require("express-validator");

/**
 * Centralized validation error handler
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

/**
 * Validate mobile number format
 * Accepts: 10-digit Indian numbers OR numbers with country code (e.g. 919876543210)
 */
const mobileRule = (field) =>
  body(field)
    .trim()
    .notEmpty().withMessage(`${field} is required`)
    .matches(/^(\+?91)?[6-9]\d{9}$|^\d{10,15}$/)
    .withMessage(`${field} must be a valid mobile number (10 digits or with country code)`);

// ─── Validators ───────────────────────────────────────────────────────────────

const validateSendSMS = [
  mobileRule("mobile"),
  body("message")
    .trim()
    .notEmpty().withMessage("message is required")
    .isLength({ min: 1, max: 160 }).withMessage("message must be between 1 and 160 characters"),
  body("msgType")
    .optional()
    .isIn(["TEXT", "FLASH", "UNICODE"]).withMessage("msgType must be TEXT, FLASH, or UNICODE"),
  body("templateId").optional().isString(),
  body("principalEntityId").optional().isString(),
  handleValidation,
];

const validateBulkSMS = [
  body("mobiles")
    .isArray({ min: 1, max: 500 }).withMessage("mobiles must be an array of 1–500 numbers"),
  body("mobiles.*")
    .trim()
    .matches(/^(\+?91)?[6-9]\d{9}$|^\d{10,15}$/)
    .withMessage("Each mobile must be a valid number"),
  body("message")
    .trim()
    .notEmpty().withMessage("message is required")
    .isLength({ min: 1, max: 160 }).withMessage("message must be between 1 and 160 characters"),
  body("msgType").optional().isIn(["TEXT", "FLASH", "UNICODE"]),
  handleValidation,
];

const validateSendOTP = [
  mobileRule("mobile"),
  body("otp")
    .trim()
    .notEmpty().withMessage("otp is required")
    .isLength({ min: 4, max: 8 }).withMessage("OTP must be 4–8 digits")
    .isNumeric().withMessage("OTP must be numeric"),
  body("templateId").optional().isString(),
  body("principalEntityId").optional().isString(),
  handleValidation,
];

const validateStatusCheck = [
  param("sendId").notEmpty().withMessage("sendId is required"),
  handleValidation,
];

module.exports = {
  validateSendSMS,
  validateBulkSMS,
  validateSendOTP,
  validateStatusCheck,
};
