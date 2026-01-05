const Joi = require('joi');
const ApiResponse = require('../utils/ApiResponse');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json(
        ApiResponse.error('Validation failed', 'VALIDATION_ERROR', details, 400)
      );
    }

    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  auth: {
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    }),
    register: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
      position: Joi.string().max(100).optional(),
      department: Joi.string().max(100).optional()
    })
  },
  employee: {
    update: Joi.object({
      firstName: Joi.string().min(2).max(50).optional(),
      lastName: Joi.string().min(2).max(50).optional(),
      phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
      position: Joi.string().max(100).optional(),
      department: Joi.string().max(100).optional(),
      salary: Joi.number().positive().optional(),
      performance: Joi.number().min(0).max(100).optional()
    })
  },
  attendance: {
    mark: Joi.object({
      employee: Joi.string().hex().length(24).required(),
      date: Joi.date().iso().required(),
      status: Joi.string().valid('present', 'absent', 'on-leave', 'half-day').required(),
      checkIn: Joi.date().iso().optional(),
      checkOut: Joi.date().iso().optional(),
      notes: Joi.string().max(500).optional()
    })
  }
};

module.exports = { validate, schemas };