import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => 
  (req: Request, res: Response, next: NextFunction) => {
    
    // Validate only the body for now
    const payload = req.body || {};
    const { error } = schema.validate(payload, { 
      abortEarly: false, // Show all errors, not just the first one
      stripUnknown: true // Remove fields that are not in the schema
    });
    

    if (error) {
      const errorMessages : any = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message.replace(/"/g, '') // Clean up Joi's quotes
      }));

      return res.validationError({ 
        message: errorMessages[0]?.message || "Validation Error", 
        data: errorMessages 
      });
    }

    next();
  };