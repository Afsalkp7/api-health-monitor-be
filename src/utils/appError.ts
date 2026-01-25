class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message); // Call the parent constructor (Error)

    this.statusCode = statusCode;
    
    // If code is 4xx, status is 'fail'. If 5xx, status is 'error'.
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // TRUE means "We predicted this error might happen" (e.g. invalid email)
    // FALSE means "Something crashed/bug" (Programming error)
    this.isOperational = true;

    // Capture the stack trace (shows which line caused the error)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;