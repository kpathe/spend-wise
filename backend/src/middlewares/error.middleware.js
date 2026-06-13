import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = 500;
  let message = "Internal Server Error";
  let payload = null;

  if (err instanceof ApiError) {
    status = err.statusCode || 500;
    message = err.message || message;
    payload = err.errors && err.errors.length ? { errors: err.errors } : null;
  } else if (err.name === "ValidationError") {
    status = 400;
    message = "Validation Error";
    payload = { errors: Object.values(err.errors).map((e) => e.message) };
  } else if (err.code === 11000) {
    status = 409;
    const fields = Object.keys(err.keyValue || {}).join(", ");
    message = `Duplicate value for: ${fields}`;
    payload = { keyValue: err.keyValue };
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    status = 401;
    message = err.message;
  } else if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    status = 400;
    message = "Invalid JSON payload";
  } else {
    message = err.message || message;
  }

  if (status >= 500) console.error(err);
  else console.warn(err.message || err);

  res.status(status).json(new ApiResponse(status, payload, message));
}

export { errorHandler };
