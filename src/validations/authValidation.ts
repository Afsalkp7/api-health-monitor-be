import Joi from "joi";

// Registration validation
export const registerSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters long",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().required().lowercase().trim().messages({
    "string.email": "Invalid email address format",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
});

// Verify otp validation
export const otpVerifySchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    "string.email": "Invalid email address format",
    "any.required": "Email is required",
  }),

  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required": "OTP is required",
    }),
});

// Re send otp validation
export const otpResendSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    "string.email": "Invalid email address format",
    "any.required": "Email is required",
  }),
});

// Login validation
export const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    "string.email": "Invalid email address format",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
});

// Reset password validation
export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    "string.email": "Invalid email address format",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required": "OTP is required",
    }),
});
