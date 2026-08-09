/**
 * Request Validation Middleware
 * Validates request body, params, and query
 */

// Validate required fields
export const validateRequired = (...fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    fields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    next();
  };
};

// Validate email format
export const validateEmail = (req, res, next) => {
  const email = req.body.email;
  if (email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
  }
  next();
};

// Validate password strength
export const validatePassword = (req, res, next) => {
  const password = req.body.password || req.body.newPassword;
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
  }
  next();
};

// Validate MongoDB ObjectId
export const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  next();
};

// Validate pagination params
export const validatePagination = (req, res, next) => {
  let { page, limit } = req.query;
  
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  req.query.page = page;
  req.query.limit = limit;

  next();
};

// Validate price range
export const validatePriceRange = (req, res, next) => {
  const { minPrice, maxPrice } = req.query;
  
  if (minPrice && isNaN(minPrice)) {
    return res.status(400).json({
      success: false,
      message: 'minPrice must be a number'
    });
  }
  
  if (maxPrice && isNaN(maxPrice)) {
    return res.status(400).json({
      success: false,
      message: 'maxPrice must be a number'
    });
  }

  if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
    return res.status(400).json({
      success: false,
      message: 'minPrice cannot be greater than maxPrice'
    });
  }

  next();
};

// Sanitize input (basic)
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};