import { createContext, useState, useEffect } from "react";

export const WishlistContext = createContext();

export default function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(
    JSON.parse(localStorage.getItem("wishlist")) || []
  );

  // Save wishlist in localStorage
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Add to wishlist
  const addToWishlist = (product) => {
    const existingProduct = wishlist.find(
      (item) => item._id === product._id
    );

    if (existingProduct) return;

    setWishlist([...wishlist, product]);
  };

  // Remove from wishlist
  const removeFromWishlist = (_id) => {
    setWishlist(wishlist.filter((item) => item._id !== _id));
  };

  // Toggle wishlist
  const toggleWishlist = (product) => {
    const exists = wishlist.find((item) => item._id === product._id);

    if (exists) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}