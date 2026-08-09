/**
 * Async Handler - Try-catch wrapper for async route handlers
 * Isse har controller me try-catch nahi likhna padega
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;