// -------------------------------------------------
// utils/response.util.js
// Standardized JSON response helpers for all controllers
// -------------------------------------------------

/**
 * sendSuccess - Sends a uniform success response
 * @param {object} res     - Express response object
 * @param {number} status  - HTTP status code (e.g. 200, 201)
 * @param {string} message - Human-readable message
 * @param {*}      data    - Payload to include in response body
 */
const sendSuccess = (res, status, message, data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(status).json(response);
};

/**
 * sendError - Sends a uniform error response
 * @param {object} res     - Express response object
 * @param {number} status  - HTTP status code (e.g. 400, 404, 500)
 * @param {string} message - Error description
 */
const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };
