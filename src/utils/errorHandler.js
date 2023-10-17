const httpStatus = require("http-status");
const { db } = require("../models");

class ApiError extends Error {
  constructor(message, statusCode, stack = "") {
    super(message);
    this.statusCode = statusCode;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Default error status and message
  let status = err.statusCode;
  let message = err.message;

  if (!(err instanceof ApiError)) {
    const serverError = httpStatus.INTERNAL_SERVER_ERROR;
    status = status || serverError;
    message = message || httpStatus[serverError];
  }

  const errorRes = {
    success: false,
    status,
    message,
    stack: err.stack,
  };

  return res.status(status).json(errorRes);
};

module.exports = { errorHandler, ApiError };
