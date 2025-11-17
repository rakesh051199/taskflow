/**
 * API Response Formatter Utility
 * Standardizes API response format
 */

/**
 * Format successful response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    data,
  });
};

/**
 * Format paginated response
 * @param {Object} res - Express response object
 * @param {Array} items - Array of items
 * @param {Object} pagination - Pagination metadata
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendPaginated = (res, items, pagination, statusCode = 200) => {
  res.status(statusCode).json({
    data: items,
    pagination,
  });
};

export default {
  sendSuccess,
  sendPaginated,
};

