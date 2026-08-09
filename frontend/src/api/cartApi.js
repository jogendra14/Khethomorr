import API from './axios';

const cartApi = {
  // Get cart
  getCart: () =>
    API.get('/api/cart'),

  // Get cart summary
  getSummary: () =>
    API.get('/api/cart/summary'),

  // Add to cart
  addToCart: (data) =>
    API.post('/api/cart/items', data),

  // Update cart item
  updateItem: (itemId, quantity) =>
    API.patch(`/api/cart/items/${itemId}`, { quantity }),

  // Remove from cart
  removeItem: (itemId) =>
    API.delete(`/api/cart/items/${itemId}`),

  // Clear cart
  clearCart: () =>
    API.delete('/api/cart'),

  // Apply coupon
  applyCoupon: (code) =>
    API.post('/api/cart/coupon', { code }),

  // Remove coupon
  removeCoupon: () =>
    API.delete('/api/cart/coupon'),

  // Merge guest cart
  mergeCart: (sessionId) =>
    API.post('/api/cart/merge', { sessionId }),
};

export default cartApi;