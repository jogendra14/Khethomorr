import { Link } from "react-router-dom";
import { useContext } from "react";
import { FiShoppingCart, FiTrash2 } from "react-icons/fi";
import Navbar from "../components/home/navbar/Navbar.jsx";
import { WishlistContext } from "../context/WishlistContext.jsx";
import { CartContext } from "../context/CartContext.jsx";

function Wishlist() {
  const { wishlist, removeFromWishlist, moveAllToCart } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const moveOneToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item._id);
  };

  return (
    <>
      <Navbar />
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 min-h-screen">
        <div className="flex justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Your Wishlist</h1>
            {wishlist.length > 0 && <p className="text-gray-500 mt-1">{wishlist.length} saved item{wishlist.length === 1 ? "" : "s"}</p>}
          </div>
          {wishlist.length > 0 && (
            <button onClick={() => moveAllToCart(addToCart)} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
              <FiShoppingCart size={18} /> Move All to Cart
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">♥</div>
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save products here to buy later.</p>
            <Link to="/shop" className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => (
              <article key={item._id} className="flex gap-4 rounded-xl border p-4">
                <Link to={`/product/${item._id}`} className="shrink-0">
                  <img src={item.images?.[0] || "/placeholder-image.jpg"} alt={item.name} className="h-24 w-24 rounded-lg object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${item._id}`} className="font-semibold hover:text-red-600 line-clamp-2">{item.name}</Link>
                  <p className="mt-1 text-sm text-gray-500">{item.brand || "Unbranded"}</p>
                  <p className="mt-2 font-bold text-red-600">₹{Number(item.sellingPrice || item.price || 0).toFixed(2)}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => moveOneToCart(item)} className="rounded border border-green-300 px-3 py-1.5 text-sm text-green-700 hover:bg-green-50">Add to Cart</button>
                    <button onClick={() => removeFromWishlist(item._id)} className="rounded border border-red-300 p-1.5 text-red-600 hover:bg-red-50" aria-label={`Remove ${item.name}`}><FiTrash2 /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Wishlist;
