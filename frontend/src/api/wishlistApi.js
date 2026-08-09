import API from './axios';

const wishlistApi = {
  // Get wishlists
  getWishlists: () =>
    API.get('/api/wishlist'),

  // Get default wishlist
  getDefaultWishlist: () =>
    API.get('/api/wishlist/default'),

  // Create wishlist
  createWishlist: (data) =>
    API.post('/api/wishlist', data),

  // Add to wishlist
  addToWishlist: (data) =>
    API.post('/api/wishlist/items', data),

  // Remove from wishlist
  removeFromWishlist: (productId, wishlistId) =>
    API.delete(`/api/wishlist/items/${productId}`, { params: { wishlistId } }),

  // Move to cart
  moveToCart: (productId, wishlistId) =>
    API.post(`/api/wishlist/move-to-cart/${productId}`, { wishlistId }),

  // Update wishlist
  updateWishlist: (id, data) =>
    API.put(`/api/wishlist/${id}`, data),

  // Delete wishlist
  deleteWishlist: (id) =>
    API.delete(`/api/wishlist/${id}`),

  // Share wishlist
  shareWishlist: (id, data) =>
    API.post(`/api/wishlist/${id}/share`, data),
};

export default wishlistApi;