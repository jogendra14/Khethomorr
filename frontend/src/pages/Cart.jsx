import { Link } from "react-router-dom";
import Navbar from "../components/home/navbar/Navbar.jsx"
import { useContext } from "react";
import { CartContext } from "../context/CartContext.jsx";

function Cart() {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = useContext(CartContext);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <Navbar />

      <section className="px-8 py-16">
        <h1 className="text-4xl font-bold mb-10">Your Cart</h1>

        {cart.length === 0 ?
          <p className="text-xl">Your cart is empty</p>
        : <>
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center border-b py-6">
                <div>

                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />

                  <h2 className="text-xl font-semibold">{item.name}</h2>

                  <p className="mt-2">Price: ₹{item.price}</p>

                  <div className="flex items-center gap-4 mt-4">
                    <button onClick={() => decreaseQuantity(item._id)} className="border px-3 py-1 rounded">
                      -
                    </button>

                    <span className="font-bold">{item.quantity}</span>

                    <button onClick={() => increaseQuantity(item._id)} className="border px-3 py-1 rounded">
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold">₹{item.price * item.quantity}</p>

                  <button onClick={() => removeFromCart(item._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded mt-4" >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-10">
              <h2 className="text-3xl font-bold">Total: ₹{total}</h2>

              <button className="mt-6 bg-black text-white px-8 py-3 rounded-lg">
                <Link to="/checkout" className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-lg">
                  Checkout
                </Link>
              </button>
            </div>
          </>
        }
      </section>
    </>
  );
}

export default Cart;
