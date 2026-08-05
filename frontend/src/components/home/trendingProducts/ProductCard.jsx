import { FaHeart, FaStar, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../../../context/CartContext";
import { WishlistContext } from "../../../context/WishlistContext";


const ProductCard = ({ product: productFromApi }) => {

  const { addToCart } = useContext(CartContext);
  const { toggleWishlist } = useContext(WishlistContext);

  // ProductCard.jsx mein price logic update:
  const discount = Number(productFromApi.discount) || 0;
  const newPrice = Number(productFromApi.newPrice) || Number(productFromApi.price); // prefer newPrice
  const oldPrice = productFromApi.oldPrice ? Number(productFromApi.oldPrice) : (discount > 0 ? Math.round(newPrice / (1 - discount / 100)) : newPrice);
  
  const product = {
    ...productFromApi,
    newPrice, 
    oldPrice,
  };

  return (
    
    <div className="w-60 group bg-white rounded-lg overflow-hidden shadow-xl hover:shadow-xl transition duration-300">
      {/* Image */}
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-40 md:h-46 lg:h-50 object-contain group-hover:scale-105 transition duration-500"
          />

          {discount > 0 && <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full">-{discount}% OFF</span>}
          <button
            onClick={(e) => {
              e.preventDefault(); // Link को ट्रिगर होने से रोकें
              e.stopPropagation(); // Event bubbling रोकें
              toggleWishlist(product);
            }}
            className="absolute top-2 right-2 md:top-3 md:right-3 w-7 md:w-10 h-7 md:h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-600 hover:text-white transition"
          >
            <FaHeart />
          </button>
        </div>

        {/* Content */}
        <div className="px-2 py-1">
          <h3 className="text-sm md:text-lg min-h-10 md:min-h-14 line-clamp-2">{product.name}</h3>

          <div className="flex items-center gap-1 mt-1 text-sm md:text-lg text-yellow-500">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />

            <span className="text-gray-500 text-sm ml-2">({product.rating})</span>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-lg md:text-2xl font-bold text-red-600">₹{product.sellingPrice}</span>

            <span className="text-gray-400 text-sm md:text-md line-through">₹{product.MRP}</span>
          </div>
        </div>
      </Link>
          <div className="px-2 pb-1.5 md:pb-2 ">
          <button
            onClick={ () => addToCart(product) }
            className="border w-full active:scale-95 transition-transform duration-150 bg-black text-sm md:text-base hover:bg-red-600 text-white py-2 rounded-sm flex items-center justify-center gap-2 "
          >
            <FaShoppingCart />
            Add To Cart
          </button>
        </div>
    </div>
  );
};

export default ProductCard;
