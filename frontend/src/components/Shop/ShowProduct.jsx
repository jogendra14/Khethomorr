import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { BsCartCheck } from "react-icons/bs";

export default function ShowProduct({ product }) {

  const { addToCart } = useContext(CartContext);

  return (
    <div className="bg-white rounded-sm shadow hover:shadow-xl duration-300 pb-1.5 overflow-hidden group">
      <Link to={`/product/${product._id}`}>
        <div className=" relative">
          <img src={product.images[0]} alt="" className="w-full h-45 md:h-50 lg:h-60 object-contain" />

          <button className="absolute top-2 md:top-3 right-2 md:right-3 bg-white p-1.5 md:p-2 rounded-full shadow">
            <Heart size={18} />
          </button>
        </div>

        <div className="mx-3 my-1">
          <h2 className="text-sm md:text-lg font-medium line-clamp-1 ">{product.name}</h2>

          <div className="flex items-center min-h-6 gap-1 mt-1 sm:mt-1">
            <Star fill="gold" color="gold" size={16} />
            <span>{product.rating}</span>
          </div>

          <div className="mt-1">
            <span className="text-lg md:text-xl font-bold">₹{product.sellingPrice}</span>
            <span className="ml-1.5 font-semibold line-through text-sm md:text-md text-gray-500">₹{product.MRP}</span>
            <span className=" font-bold text-red-600 text-xs md:text-base ml-1.5 ">
            ({product.discount}% OFF)
          </span>
          </div>
        </div>
      </Link>
        <div className="px-2 mt-2.5 md:pb-1">
          <button onClick = { () => addToCart(product) }
            className="w-full flex justify-center items-center gap-2 mt-1 border text-red-500 font-bold border-red-600 hover:bg-red-600 hover:text-white rounded-xs md:rounded-md py-1 md:py-1">
              <BsCartCheck/>
            <span className="text-sm sm:text-md md:text-lg ">
              Add to Cart</span>
          </button>
        </div>
    </div>
  );
}
