class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (error, req, res, next) => {
  error.message = error.message || "Internal server error";
  error.statusCode = error.statusCode || 500;

  if (error.name === "CateError") {
    const message = `Invalid: Resource not found: ${error.message}`;
    error = new ErrorHandler(message, 404);
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};

export default ErrorHandler;
