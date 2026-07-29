import { Heart, Star } from "lucide-react";

export default function ShowProduct({ product }) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-xl duration-300 overflow-hidden group">
      <div className="relative">
        <img src={product.images[0]} alt="" className="w-full object-cover" />

        <span className="absolute top-1 md:top-2 lg:top-3 left-1 md:left-2 lg:left-3 bg-red-500 text-white text-[9px] md:text-xs px-1.5 p-0.5 rounded-lg">{product.discount}% OFF</span>
        
        <button className="absolute hidden lg:block top-3 right-3 bg-white p-2 rounded-full shadow">
          <Heart size={18} />
        </button>
      </div>

      <div className=" m-1.5 overflow-hidden">
        <h2 className="text-sm sm:text-md md:text-lg line-clamp-1 md:line-clamp-2 ">{product.name}</h2>

        <div className="flex items-center gap-1 mt-0 sm:mt-1">
          <Star fill="gold" color="gold" size={15} />
          <span>{product.rating}</span>
        </div>

        <div className="mt-0 md:m-1.5">
          <span className="text-blue-700 text-md sm:text-lg md:text-xl font-bold">₹{product.price}</span>

          <span className="line-through mx-2 text-sm sm:text-md md:text-lg lg:text-xl text-gray-400">₹{product.oldPrice}</span>
        </div>

        <button className="w-full mt-1 border text-red-400  border-gray-600 hover:bg-blue-600 hover:text-white rounded-lg md:rounded-xl md:p-1.5">
          <span className="text-sm sm:text-md md:text-lg ">Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
