import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    payment: "cod",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Order Placed Successfully!");

    // Baad me backend API call yaha hogi

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 px-5">
        {/* Shipping Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6">Checkout</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 outline-none"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 outline-none"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              required
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 outline-none"
            />

            <textarea
              name="address"
              placeholder="Address"
              required
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 outline-none"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                required
                value={form.city}
                onChange={handleChange}
                className="border rounded-lg p-3 outline-none"
              />

              <input
                type="text"
                name="state"
                placeholder="State"
                required
                value={form.state}
                onChange={handleChange}
                className="border rounded-lg p-3 outline-none"
              />
            </div>

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              required
              value={form.pincode}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 outline-none"
            />

            <div>
              <h3 className="font-semibold mb-2">Payment Method</h3>

              <label className="flex items-center gap-2">
                <input type="radio" name="payment" value="cod" checked={form.payment === "cod"} onChange={handleChange} />
                Cash on Delivery
              </label>

              <label className="flex items-center gap-2 mt-2">
                <input type="radio" name="payment" value="online" checked={form.payment === "online"} onChange={handleChange} />
                Online Payment
              </label>
            </div>

            <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition">Place Order</button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg p-8 h-fit">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹0</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <hr />

            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>₹0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
