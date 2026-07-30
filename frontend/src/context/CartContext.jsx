import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);

  // Save cart in localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add product to cart
  const addToCart = (product) => {

    const existingProduct = cart.find((item) => item._id === product._id);

    if (existingProduct) {
      return;
    }

    setCart([
      ...cart,

      {
        ...product,
        quantity: 1,
      },
    ]);
  };

  // Increase quantity
  const increaseQuantity = (_id) => {
    setCart(
      cart.map((item) =>
        item._id === _id ?
          {
            ...item,
            quantity: item.quantity + 1,
          }
        : item,
      ),
    );
  };

  // Decrease quantity
  const decreaseQuantity = (_id) => {
    setCart(
      cart.map((item) =>
        item._id === _id && item.quantity > 1 ?
          {
            ...item,
            quantity: item.quantity - 1,
          }
        : item,
      ),
    );
  };

  const removeFromCart = (_id) => {
    setCart(cart.filter((item) => item._id !== _id));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
