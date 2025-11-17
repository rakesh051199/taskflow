import { ValidationError } from '../utils/errors.js';

/**
 * Middleware wrapper for Zod schema validation
 * Validates request body, query, or params against a Zod schema
 */
export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      
      // Validate using Zod schema
      const result = schema.safeParse(data);

      if (!result.success) {
        const details = {};
        result.error.errors.forEach((error) => {
          const path = error.path.join('.');
          details[path] = error.message;
        });

        throw new ValidationError('Validation failed', details);
      }

      // Replace request data with validated and parsed data
      req[source] = result.data;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;

