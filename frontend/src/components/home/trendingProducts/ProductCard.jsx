import { FaHeart, FaStar, FaShoppingCart } from "react-icons/fa";
import {Link} from "react-router-dom"
import { useContext } from "react";
import { CartContext } from "../../../context/CartContext";

const ProductCard = ({ product: productFromApi }) => {
  const { addToCart } = useContext(CartContext);
  const discount = Number(productFromApi.discount) || 0;
  const originalPrice = discount > 0
    ? Math.round(Number(productFromApi.price) / (1 - discount / 100))
    : null;
  const product = {
    ...productFromApi,
    oldPrice: productFromApi.oldPrice ?? originalPrice,
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition duration-300">

      {/* Image */}
     <Link to={`/product/${product._id}`}>
      <div className="relative overflow-hidden">

        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-45 md:h-60 object-cover group-hover:scale-105 transition duration-500"
        />

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
            -{discount}%
          </span>
        )}

        <button className="absolute top-3 right-3 w-7 md:w-10 h-7 md:h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-600 hover:text-white transition">
          <FaHeart />
        </button>

      </div>

      {/* Content */}
      <div className="px-3 py-2 md:py-3.5">
        <h3 className="font-semibold text-sm md:text-lg min-h-10 max-h-12 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mt-1 text-yellow-500">
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />

          <span className="text-gray-500 text-sm ml-2">
            ({product.rating})
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">

          <span className="text-lg md:text-2xl font-bold text-red-600">
            ₹{product.price}
          </span>

          <span className="text-gray-400 text-md md:text-xl line-through">
            ₹{product.oldPrice}
          </span>

        </div>
      </div>
      </Link>
        
        <Link>
        <div className="px-2 pb-2">
          <button  onClick={() => addToCart(product)}
            className="border w-full bg-black hover:bg-red-600 text-white py-2 rounded-xl flex items-center justify-center gap-2 transition">
          <FaShoppingCart />
          Add To Cart
        </button>
        </div>
        </Link>

    </div>
  );
};

export default ProductCard;
