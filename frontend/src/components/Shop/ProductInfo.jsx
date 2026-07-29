import { useState } from "react";
import { FiHeart, FiDroplet, FiWind, FiBox, FiTruck, FiRefreshCw } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

export default function ProductInfo({ product }) {
  const [selectedColor, setSelectedColor] = useState("#556B2F");
  const [selectedSize, setSelectedSize] = useState("S");

  const colors = ["#556B2F", "#1E3A8A", "#F5F5DC", "#111827"];

  const sizes = ["S", "M", "L", "XL", "XXL"];

  return (
    <div className="">
      {/* Badge */}
      <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-sm font-medium">New Arrival</span>

      {/* Title */}
      <h1 className="text-3xl font-bold mt-2">{product.name}</h1>

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

      <h2 className="text-2xl font-bold mt-3.5">₹{product.price}</h2>
          
      <p className="mt-2 text-gray-600">
          Brand : 
          <span className="font-semibold">{product.brand}</span>
      </p>

      {/* Description */}

      <p className="text-gray-500 mt-3">
        {product.description}
      </p>

      {/* Colors */}

      <div className="mt-4">
        <h3 className="font-semibold mb-3">Color :</h3>

        <div className="flex gap-4">
          {colors.map((color, index) => (
            <button
              key={index}
              onClick={() => setSelectedColor(color)}
              className={`w-10 h-10 rounded-full border-4 transition ${selectedColor === color ? "border-black scale-110" : "border-gray-200"}`}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      {/* Sizes */}

      <div className="mt-6">
        <div className="flex justify-between">
          <h3 className="font-semibold">Size</h3>

          <button className="text-sm text-gray-500 hover:text-black">Size Guide</button>
        </div>

        <div className="flex gap-3 mt-3 flex-wrap">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-10 h-10 rounded-lg border font-semibold transition ${
                selectedSize === size ? "bg-green-700 text-white border-green-700" : "bg-white hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}

      <div className="flex gap-4 mt-7">
        <button className="flex-1 bg-[#4F6B35] hover:bg-[#3f562b] text-white py-3 rounded-xl font-semibold transition">Add To Cart</button>

        <button className="w-16 rounded-xl border flex justify-center items-center hover:bg-gray-100">
          <FiHeart size={22} />
        </button>
      </div>

      {/* Features */}

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="border rounded-xl p-2 flex flex-col items-center gap-2">
          <FiDroplet size={18} />
          <p className="text-sm text-center">Water Resistant</p>
        </div>

        <div className="border rounded-xl p-2 flex flex-col items-center gap-2">
          <FiWind size={18} />
          <p className="text-sm text-center">Breathable</p>
        </div>

        <div className="border rounded-xl p-2 flex flex-col items-center gap-2">
          <FiBox size={22} />
          <p className="text-sm text-center">Lightweight</p>
        </div>
      </div>

      {/* Shipping */}

      <div className="grid sm:grid-cols-2 gap-5 mt-4">
        <div className="border rounded-xl p-3">
          <div className="flex gap-3">
            <FiTruck size={18} />

            <div>
              <h4 className="font-semibold">Delivery</h4>

              <p className="text-gray-500 text-sm ">2-4 Working Days</p>
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-3">
          <div className="flex gap-3">
            <FiRefreshCw size={18} />

            <div>
              <h4 className="font-semibold">Easy Returns</h4>

              <p className="text-gray-500 text-sm">30 Days Return Policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
