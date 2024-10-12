class AppError extends Error {
  /**
   * Creates an instance of AppError.
   * @param {string} message - The error message.
   * @param {string} type - The type/category of the error.
   * @param {number} [statusCode=500] - HTTP status code.
   * @param {boolean} [isOperational=true] - Indicates if the error is operational.
   */
  constructor(message, type, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture the stack trace excluding the constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
