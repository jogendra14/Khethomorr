import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/home/navbar/Navbar";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/orderApi";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useContext(CartContext);
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    payment: "COD",
  });

  const cartItems = useMemo(
    () => cart.map((item) => ({
      productId: item._id,
      qty: item.quantity,
      price: Number(item.sellingPrice || item.price || 0),
      name: item.name,
    })),
    [cart],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in before placing an order");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    if (!cartItems.length) {
      toast.error("Your cart is empty");
      navigate("/shop");
      return;
    }

    try {
      setIsSubmitting(true);
      await createOrder({
        items: cartItems,
        paymentMethod: "COD",
        address: {
          fullName: form.name,
          street: form.address,
          city: form.city,
          postalCode: form.pincode,
          country: "India",
        },
      });
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart.length) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <button onClick={() => navigate("/shop")} className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800">
            Continue Shopping
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 px-5">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-sm text-gray-500 mb-6">Orders are currently placed with Cash on Delivery.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Full Name" required value={form.name} onChange={handleChange} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black" />
              <input type="email" name="email" placeholder="Email" required value={form.email} onChange={handleChange} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black" />
              <input type="tel" name="phone" placeholder="Phone Number" required value={form.phone} onChange={handleChange} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black" />
              <textarea name="address" placeholder="Address" required value={form.address} onChange={handleChange} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="city" placeholder="City" required value={form.city} onChange={handleChange} className="border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black" />
                <input type="text" name="state" placeholder="State" required value={form.state} onChange={handleChange} className="border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black" />
              </div>
              <input type="text" name="pincode" placeholder="Pincode" required value={form.pincode} onChange={handleChange} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black" />
              <label className="flex items-center gap-2">
                <input type="radio" name="payment" value="COD" checked readOnly />
                Cash on Delivery
              </label>
              <button disabled={isSubmitting} className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 transition">
                {isSubmitting ? "Placing Order..." : `Place COD Order · ₹${totalPrice.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 h-fit">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between gap-4 text-sm">
                  <span>{item.name} × {item.qty}</span>
                  <span>₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
