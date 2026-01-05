const ApiResponse = require('../utils/ApiResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return res.status(404).json(
      ApiResponse.error(message, 'RESOURCE_NOT_FOUND', null, 404)
    );
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    return res.status(400).json(
      ApiResponse.error(message, 'DUPLICATE_FIELD', null, 400)
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json(
      ApiResponse.error(message, 'VALIDATION_ERROR', null, 400)
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ApiResponse.error('Invalid token', 'INVALID_TOKEN', null, 401)
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      ApiResponse.error('Token expired', 'TOKEN_EXPIRED', null, 401)
    );
  }

  // Default error
  res.status(error.statusCode || 500).json(
    ApiResponse.error(
      error.message || 'Server Error',
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development' ? err.stack : null,
      error.statusCode || 500
    )
  );
};

const notFound = (req, res, next) => {
  res.status(404).json(
    ApiResponse.error(
      `Route ${req.originalUrl} not found`,
      'ROUTE_NOT_FOUND',
      null,
      404
    )
  );
};

module.exports = { errorHandler, notFound };