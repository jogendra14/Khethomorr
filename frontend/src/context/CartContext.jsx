import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

export const CartContext = createContext();

export default function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  // ✅ Save cart in localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);

  // ✅ Add product to cart
  const addToCart = useCallback((product) => {
    if (!product || !product._id) {
      toast.error("Invalid product");
      return;
    }

    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);

      if (existingProduct) {
        toast.info(`${product.name} is already in cart`);
        return prevCart;
      }

      toast.success(`${product.name} added to cart! 🛒`);
      
      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
          price: product.sellingPrice || product.price || 0,
        },
      ];
    });
  }, []);

  // ✅ Increase quantity
  const increaseQuantity = useCallback((_id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === _id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }, []);

  // ✅ Decrease quantity
  const decreaseQuantity = useCallback((_id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === _id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  }, []);

  // ✅ Remove from cart with confirmation
  const removeFromCart = useCallback((_id) => {
    const itemToRemove = cart.find((item) => item._id === _id);
    
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item._id !== _id);
      if (itemToRemove) {
        toast.success(`${itemToRemove.name} removed from cart 🗑️`);
      }
      return newCart;
    });
  }, [cart]);

  // ✅ Clear entire cart
  const clearCart = useCallback(() => {
    setCart([]);
    toast.success("Cart cleared 🗑️");
  }, []);

  // ✅ Get total items count
  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // ✅ Get total price
  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.sellingPrice || item.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  // ✅ Get cart summary
  const cartSummary = useMemo(() => {
    return {
      totalItems,
      totalPrice,
      itemCount: cart.length,
    };
  }, [cart, totalItems, totalPrice]);

  // ✅ Check if product is in cart
  const isInCart = useCallback((productId) => {
    return cart.some((item) => item._id === productId);
  }, [cart]);

  // ✅ Get product quantity in cart
  const getQuantity = useCallback((productId) => {
    const item = cart.find((item) => item._id === productId);
    return item ? item.quantity : 0;
  }, [cart]);

  // ✅ Update product quantity
  const updateQuantity = useCallback((_id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(_id);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === _id
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  // ✅ Memoized context value
  const contextValue = useMemo(() => ({
    cart,
    setCart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    cartSummary,
    isInCart,
    getQuantity,
    updateQuantity,
  }), [
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    cartSummary,
    isInCart,
    getQuantity,
    updateQuantity,
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}