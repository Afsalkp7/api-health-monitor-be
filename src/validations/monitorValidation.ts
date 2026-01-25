import Joi from 'joi';

export const monitorSchema = Joi.object({
  friendlyName: Joi.string().min(2).required().messages({
    'string.min': 'Friendly Name must be at least 2 characters',
    'any.required': 'Friendly Name is required',
  }),

  url: Joi.string()
    .uri({ scheme: ['http', 'https'] }) // Enforces http:// or https://
    .required()
    .messages({
      'string.uri': 'URL must be a valid http or https link',
    }),

  method: Joi.string()
    .valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH')
    .default('GET'),

  headers: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().required(),
        value: Joi.string().required(),
      })
    )
    .default([]),

  body: Joi.any().default({}), // Allows any JSON structure

  // Only allow specific intervals (1m, 5m, 10m, 30m)
  frequency: Joi.number()
    .valid(60, 300, 600, 1800)
    .required()
    .messages({
      'any.only': 'Frequency must be 60, 300, 600, or 1800 seconds',
    }),

  timeout: Joi.number().min(1000).max(30000).default(5000),

  expectedCode: Joi.number().integer().min(100).max(599).default(200),
});

export const monitorUpdateSchema = Joi.object({
  friendlyName: Joi.string().min(2).messages({
    'string.min': 'Friendly Name must be at least 2 characters',
  }),

  url: Joi.string()
    .uri({ scheme: ['http', 'https'] }) // Enforces http:// or https://
    .messages({
      'string.uri': 'URL must be a valid http or https link',
    }),

  method: Joi.string()
    .valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH')
    .default('GET'),

  headers: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().required(),
        value: Joi.string().required(),
      })
    )
    .default([]),

  body: Joi.any().default({}), // Allows any JSON structure

  // Only allow specific intervals (1m, 5m, 10m, 30m)
  frequency: Joi.number()
    .valid(60, 300, 600, 1800)
    .messages({
      'any.only': 'Frequency must be 60, 300, 600, or 1800 seconds',
    }),

  timeout: Joi.number().min(1000).max(30000).default(5000),

  expectedCode: Joi.number().integer().min(100).max(599).default(200),
});