const { ZodError } = require('zod');
const mongoose = require('mongoose');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

exports.notFound = (req, _res, next) => next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err instanceof ZodError) {
    status = 400;
    message = 'Validation failed';
    details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = 'An account with this email already exists';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Session expired. Please log in again';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    status = 401;
    message = 'Invalid authentication token';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'Image must be 5 MB or smaller';
  } else if (err.name === 'MulterError') {
    status = 400;
    message = 'Invalid file upload';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body too large';
  }

  if (status >= 500) {
    if (!env.isProd) console.error(err); // eslint-disable-line no-console
    if (env.isProd) message = 'Internal server error';
  }

  res.status(status).json({ success: false, message, ...(details ? { errors: details } : {}) });
};
