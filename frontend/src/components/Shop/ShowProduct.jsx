import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";

export default function ShowProduct({ product }) {

  const { addToCart } = useContext(CartContext);

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-xl duration-300 pb-1.5 overflow-hidden group">
      <Link to={`/product/${product._id}`}>
        <div className=" relative">
          <img src={product.images[0]} alt="" className="w-full h-40 sm:h-50 md:h-60 object-cover" />

          <span className="absolute top-2 md:top-3 left-2 md:left-3 bg-red-500 text-white text-[10px] md:text-sm px-1.5 p-0.5 rounded-lg">
            {product.discount}% OFF
          </span>

          <button className="absolute top-2 md:top-3 right-2 md:right-3 bg-white p-1.5 md:p-2 rounded-full shadow">
            <Heart size={18} />
          </button>
        </div>

        <div className="mx-1.5 my-1">
          <h2 className="text-sm md:text-lg line-clamp-1 ">{product.name}</h2>

          <div className="flex items-center gap-1 mt-0 sm:mt-1">
            <Star fill="gold" color="gold" size={15} />
            <span>{product.rating}</span>
          </div>

          <div className="mt-0 md:m-1.5">
            <span className="text-blue-700 text-lg md:text-xl font-bold">₹{product.newPrice}</span>

            <span className="text-sm mx-1 md:text-md md:mx-2 text-gray-600">M.R.P.</span>

            <span className="line-through text-sm md:text-md text-gray-500">{product.oldPrice}</span>
          </div>
        </div>
      </Link>
        <div className="px-2 md:pb-1.5">
          <button onClick = { () => addToCart(product) }
            className="w-full mt-1 border text-red-400  border-gray-600 hover:bg-blue-600 hover:text-white rounded-lg md:rounded-xl md:p-1.5">
            <span className="text-sm sm:text-md md:text-lg ">Add to Cart</span>
          </button>
        </div>
    </div>
  );
}
