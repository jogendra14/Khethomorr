// backend/models/index.js
import User from './User.js';
import Product from './Product.js';
import Category from './Category.js';
import SubCategory from './SubCategory.js';
import Order from './Order.js';  // Agar hai to
import Review from './Review.js';  // Agar hai to

// Sab models ko export karo taaki sab jagah registered rahe
export {
  User,
  Product,
  Category,
  SubCategory,
  Order,
  Review
};

// Default export for convenience
export default {
  User,
  Product,
  Category,
  SubCategory,
  Order,
  Review
};