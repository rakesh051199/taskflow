/**
 * Pagination utility functions
 */

/**
 * Parse pagination parameters from query string
 * @param {Object} query - Express query object
 * @returns {Object} Pagination options
 */
export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 50));

  return { page, limit };
};

/**
 * Calculate pagination metadata
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export const getPaginationMetadata = (total, page, limit) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

export default {
  parsePagination,
  getPaginationMetadata,
};

