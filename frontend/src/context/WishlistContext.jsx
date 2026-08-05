import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

export const WishlistContext = createContext();

export default function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem("wishlist");
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error("Error loading wishlist from localStorage:", error);
      return [];
    }
  });

  // ✅ Save wishlist in localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    } catch (error) {
      console.error("Error saving wishlist to localStorage:", error);
    }
  }, [wishlist]);

  // ✅ Add to wishlist
  const addToWishlist = useCallback((product) => {
    if (!product || !product._id) {
      toast.error("Invalid product");
      return;
    }

    setWishlist((prevWishlist) => {
      const existingProduct = prevWishlist.find(
        (item) => item._id === product._id
      );

      if (existingProduct) {
        toast.info(`${product.name} is already in wishlist ❤️`);
        return prevWishlist;
      }

      toast.success(`${product.name} added to wishlist! ❤️`);
      return [...prevWishlist, product];
    });
  }, []);

  // ✅ Remove from wishlist
  const removeFromWishlist = useCallback((_id) => {
    setWishlist((prevWishlist) => {
      const itemToRemove = prevWishlist.find((item) => item._id === _id);
      const newWishlist = prevWishlist.filter((item) => item._id !== _id);
      
      if (itemToRemove) {
        toast.success(`${itemToRemove.name} removed from wishlist`);
      }
      return newWishlist;
    });
  }, []);

  // ✅ Toggle wishlist
  const toggleWishlist = useCallback((product) => {
    if (!product || !product._id) {
      toast.error("Invalid product");
      return;
    }

    setWishlist((prevWishlist) => {
      const exists = prevWishlist.find((item) => item._id === product._id);

      if (exists) {
        toast.success(`${product.name} removed from wishlist`);
        return prevWishlist.filter((item) => item._id !== product._id);
      } else {
        toast.success(`${product.name} added to wishlist! ❤️`);
        return [...prevWishlist, product];
      }
    });
  }, []);

  // ✅ Clear entire wishlist
  const clearWishlist = useCallback(() => {
    setWishlist([]);
    toast.success("Wishlist cleared 🗑️");
  }, []);

  // ✅ Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlist.some((item) => item._id === productId);
  }, [wishlist]);

  // ✅ Get wishlist count
  const wishlistCount = useMemo(() => {
    return wishlist.length;
  }, [wishlist]);

  // ✅ Move item from wishlist to cart
  const moveToCart = useCallback((productId, addToCart) => {
    setWishlist((prevWishlist) => {
      const itemToMove = prevWishlist.find((item) => item._id === productId);
      
      if (itemToMove && addToCart) {
        addToCart(itemToMove);
        toast.success(`${itemToMove.name} moved to cart! 🛒`);
        return prevWishlist.filter((item) => item._id !== productId);
      }
      
      return prevWishlist;
    });
  }, []);

  // ✅ Move all items from wishlist to cart
  const moveAllToCart = useCallback((addToCart) => {
    if (wishlist.length === 0) {
      toast.error("Wishlist is empty ❌");
      return;
    }

    wishlist.forEach(item => {
      if (addToCart) {
        addToCart(item);
      }
    });
    
    setWishlist([]);
    toast.success(`All ${wishlist.length} items moved to cart! 🛒`);
  }, [wishlist]);

  // ✅ Memoized context value
  const contextValue = useMemo(() => ({
    wishlist,
    setWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    wishlistCount,
    moveToCart,
    moveAllToCart,
  }), [
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    wishlistCount,
    moveToCart,
    moveAllToCart,
  ]);

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}