import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  
  // 1. Default to 500 Server Error if status code is missing
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // 2. Map Status Codes to your Custom Response Handler Methods
  if (res.badRequest && statusCode === 400) {
    return res.badRequest({ message });
  }

  if (res.unAuthorized && (statusCode === 401 || statusCode === 403)) {
    return res.unAuthorized({ message });
  }

  if (res.recordNotFound && statusCode === 404) {
    return res.recordNotFound({ message });
  }

  if (res.validationError && statusCode === 422) {
    return res.validationError({ message });
  }

  // 3. Fallback for generic 500 errors (Internal Server Error)
  if (res.internalServerError) {
    return res.internalServerError({ message });
  }

  // 4. Final Fallback (In case responseHandler failed to load)
  res.status(statusCode).json({
    status: false,
    code: statusCode,
    message: message,
    data: null
  });
};

export default errorHandler;