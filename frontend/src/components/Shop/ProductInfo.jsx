import { useContext, useState, useEffect } from "react";
import { FiHeart, FiTruck, FiRefreshCw } from "react-icons/fi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { GoCpu } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import { CartContext } from "../../context/CartContext";
import { Link } from "react-router-dom";

export default function ProductInfo({ product }) {
  const [selectedColor, setSelectedColor] = useState("#556B2F");
  const [selectedSize, setSelectedSize] = useState("S");
  const { addToCart } = useContext(CartContext);

  // Get colors from product data
  const colors = product?.colors || [];

   // Set default selected color when component mounts
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) {
      setSelectedColor(colors[0].code);
    }
  }, [colors, selectedColor]);

  const fanSize = ["600", "900", "1200", "1400"];

  // Get the selected color name and capitalize first letter
  const selectedColorObj = colors.find(c => c.code === selectedColor);
  const selectedColorName = selectedColorObj?.name || "";
  
  // Capitalize first letter of color name
  const capitalizedColorName = selectedColorName 
    ? selectedColorName.charAt(0).toUpperCase() + selectedColorName.slice(1)
    : "";

  // Updated product name with color in parentheses
  const displayName = capitalizedColorName 
    ? `${product.name} (${capitalizedColorName})` 
    : product.name;
    
  return (
    <div className="">
      {/* Badge */}
      <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-sm font-medium">New Arrival</span>

      {/* Title */}
      <h1 className="text-xl md:text-2xl font-bold mt-2 ">{displayName}</h1>

      <div className="flex items-center gap-2 mt-3">
      {/* Rating */}
        <div className="flex text-yellow-400">
          {[1, 2, 3, 4, 5].map((item) => (
            <FaStar key={item} />
          ))}
        </div>

        <span className="font-semibold">{product.rating}</span>
        <span className="text-gray-500">{product.numReviews} Reviews</span>
      </div>

      {/* Price */}
      <div className="mt-1 md:mt-2">
          <span className="text-blue-700 text-2xl md:text-3xl font-bold">₹{product.newPrice}</span>
          <span className="text-lg mx-1 md:text-xl text-gray-600">M.R.P.</span>
          <span className="line-through text-lg md:text-xl text-gray-500">{product.oldPrice}</span>
      </div>
          
      <p className="mt-2 text-gray-700">
          <span className="font-bold">Brand : {product.brand}</span>
      </p>

      {/* Description */}
      <p className="text-gray-500 mt-1">
        {product.description}
      </p>

       {/* Colors - Dynamically rendered */}
      {colors.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-3">Color :</h3>

          <div className="flex gap-4">
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedColor(color.code)}
                className={`w-10 h-10 rounded-full border-4 transition ${selectedColor === color.code ? "border-black scale-110" : "border-gray-200"}`}
                style={{ background: color.code }}
                title={color.name} // Shows color name on hover
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}

      <div className="mt-6">
        <div className="flex justify-between">
          <h3 className="font-semibold">Size</h3>

          <button className="text-sm text-gray-500 hover:text-black">Size Guide</button>
        </div>

        <div className="flex gap-2 md:gap-3 mt-3 flex-wrap">
          {fanSize.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-14 h-10 rounded-lg border font-semibold transition ${
                selectedSize === size ? "bg-green-700 text-white border-green-700" : "bg-white hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}

      <Link to="/checkout">
      <button 
        className="bg-blue-600 hover:bg-blue-700 font-bold text-white w-full p-3 mt-3 rounded-xl" >
          Buy Now  
      </button>
      </Link>

      <div className="flex gap-4 mt-2">
        <button onClick={ ()=> addToCart(product) } className="flex-1 bg-[#4F6B35] hover:bg-[#3f562b] text-white py-3 rounded-xl font-semibold transition">Add To Cart</button>

        <button className="w-16 rounded-xl border flex justify-center items-center hover:bg-gray-100">
          <FiHeart size={22} />
        </button>
      </div>

      {/* Features */}

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="border rounded-xl p-2 flex flex-col items-center gap-2">
          <IoShieldCheckmarkOutline size={22} />
          <p className="text-sm text-center">Anti-Dust</p>
        </div>

        <div className="border rounded-xl p-2 flex flex-col items-center gap-2">
          <MdOutlineEnergySavingsLeaf size={22} />
          <p className="text-sm text-center">Energy-Saving Motors</p>
        </div>

        <div className="border rounded-xl p-2 flex flex-col items-center gap-2">
          <GoCpu size={22} />
          <p className="text-sm text-center">Smart Controls</p>
        </div>
      </div>

      {/* Shipping */}

      <div className="grid sm:grid-cols-2 gap-5 mt-4">
        <div className="border rounded-xl p-3">
          <div className="flex gap-3">
            <FiTruck size={18} />

            <div>
              <h4 className="font-semibold">Delivery</h4>

              <p className="text-gray-500 text-sm ">1-2 Working Days</p>
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-3">
          <div className="flex gap-3">
            <FiRefreshCw size={18} />

            <div>
              <h4 className="font-semibold">Easy Returns</h4>

              <p className="text-gray-500 text-sm">7 Days Return Policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
