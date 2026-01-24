import { Express } from "express-serve-static-core";

declare global {
  namespace Express {
    interface Response {
      success(data?: any): void;
      failure(data?: any): void;
      internalServerError(data?: any): void;
      badRequest(data?: any): void;
      recordNotFound(data?: any): void;
      validationError(data?: any): void;
      unAuthorized(data?: any): void;
      serverError(data?: any): void;
      notFound(data?: any): void;
    }
  }
}