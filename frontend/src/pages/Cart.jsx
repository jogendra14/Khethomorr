import { Link } from "react-router-dom";
import Navbar from "../components/home/navbar/Navbar.jsx";
import { useContext, useMemo, useCallback } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { WishlistContext } from "../context/WishlistContext.jsx";
import { FiHeart, FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/imageUtils";

function Cart() {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);

  // ✅ Calculate total price with memoization
  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.sellingPrice || item.price || 0) * item.quantity, 0);
  }, [cart]);

  // ✅ Calculate total items
  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // ✅ Handle quantity increase with feedback
  const handleIncrease = useCallback((id) => {
    try {
      increaseQuantity(id);
    } catch (error) {
      toast.error("Failed to update quantity ❌");
      console.error("Increase quantity error:", error);
    }
  }, [increaseQuantity]);

  // ✅ Handle quantity decrease with feedback
  const handleDecrease = useCallback((id) => {
    try {
      decreaseQuantity(id);
    } catch (error) {
      toast.error("Failed to update quantity ❌");
      console.error("Decrease quantity error:", error);
    }
  }, [decreaseQuantity]);

  // ✅ Handle remove from cart with confirmation
  const handleRemove = useCallback((id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from cart?`)) {
      try {
        removeFromCart(id);
        toast.success(`${name} removed from cart 🗑️`);
      } catch (error) {
        toast.error("Failed to remove item ❌");
        console.error("Remove from cart error:", error);
      }
    }
  }, [removeFromCart]);

  // ✅ Handle move to wishlist
  const handleMoveToWishlist = useCallback((item) => {
    try {
      addToWishlist(item);
      removeFromCart(item._id);
      toast.success(`${item.name} moved to wishlist ❤️`);
    } catch (error) {
      toast.error("Failed to move to wishlist ❌");
      console.error("Move to wishlist error:", error);
    }
  }, [addToWishlist, removeFromCart]);

  // ✅ Get product image with fallback
  const getProductImage = useCallback((item) => {
    return item.images?.[0] || '/placeholder-image.jpg';
  }, []);

  // ✅ Get product price
  const getProductPrice = useCallback((item) => {
    return item.sellingPrice || item.price || 0;
  }, []);

  return (
    <>
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Your Cart</h1>
          {cart.length > 0 && (
            <span className="text-gray-500 text-sm md:text-base">
              {totalItems} item{totalItems > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any items yet.</p>
            <Link 
              to="/shop" 
              className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item) => {
                const price = getProductPrice(item);
                const itemTotal = price * item.quantity;

                return (
                  <div 
                    key={item._id} 
                    className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 py-6 gap-4"
                  >
                    <div className="flex gap-4 w-full md:w-auto">
                      {/* Product Image */}
                      <Link to={`/product/${item._id}`}>
                        <img
                          src={getProductImage(item)}
                          alt={item.name || 'Product'}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border"
                          loading="lazy"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1">
                        <Link to={`/product/${item._id}`}>
                          <h2 className="text-base md:text-xl font-semibold hover:text-blue-600 transition">
                            {item.name}
                          </h2>
                        </Link>
                        
                        <p className="text-sm text-gray-500 mt-1">
                          Brand: {item.brand || 'N/A'}
                        </p>

                        <p className="text-lg font-bold text-red-600 mt-1">
                          ₹{price}
                        </p>

                        {/* Quantity Controls - Mobile */}
                        <div className="flex items-center gap-3 mt-3 md:hidden">
                          <button
                            onClick={() => handleDecrease(item._id)}
                            className="border border-gray-300 rounded-lg p-2 hover:bg-gray-100 transition"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="font-bold text-lg min-w-7.5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrease(item._id)}
                            className="border border-gray-300 rounded-lg p-2 hover:bg-gray-100 transition"
                            aria-label="Increase quantity"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Desktop */}
                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                      {/* Quantity Controls - Desktop */}
                      <div className="hidden md:flex items-center gap-3">
                        <button
                          onClick={() => handleDecrease(item._id)}
                          className="border border-gray-300 rounded-lg p-2 hover:bg-gray-100 transition"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="font-bold text-lg min-w-7.5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrease(item._id)}
                          className="border border-gray-300 rounded-lg p-2 hover:bg-gray-100 transition"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>

                      {/* Item Total */}
                      <p className="text-lg md:text-xl font-bold">
                        ₹{itemTotal.toFixed(2)}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMoveToWishlist(item)}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition px-3 py-1.5 border border-gray-300 rounded-lg hover:border-red-600"
                          aria-label="Move to wishlist"
                        >
                          <FiHeart size={16} />
                          <span className="hidden sm:inline">Wishlist</span>
                        </button>
                        <button
                          onClick={() => handleRemove(item._id, item.name)}
                          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition px-3 py-1.5 border border-red-300 rounded-lg hover:border-red-700"
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={16} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="mt-10 border-t border-gray-200 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Total: ₹{total.toFixed(2)}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {totalItems} item{totalItems > 1 ? 's' : ''} in cart
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Link 
                    to="/shop" 
                    className="text-center border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    Continue Shopping
                  </Link>
                  <Link 
                    to="/checkout" 
                    className="text-center bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}

export default Cart;