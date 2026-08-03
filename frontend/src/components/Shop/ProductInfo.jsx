// frontend/src/components/Shop/ProductInfo.jsx

import { useContext, useState, useEffect } from "react";
import { getProduct } from "../../api/productApi";
import { FiHeart, FiTruck, FiRefreshCw } from "react-icons/fi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { GoCpu } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";
import { Link } from "react-router-dom";

export default function ProductInfo({ product }) {
  const [allProducts, setAllProducts] = useState([]);
  const [colorVariants, setColorVariants] = useState([]);
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);

  console.log("color", product);
  // Fetch all products
  const fetchProduct = async () => {
    try {
      const response = await getProduct();

      if (Array.isArray(response)) {
        setAllProducts(response);
      } else if (response && typeof response === "object") {
        setAllProducts([response]);
      } else {
        console.error("Unexpected API response format:", response);
        setAllProducts([]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setAllProducts([]);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Filter products based on current product's properties
  useEffect(() => {
    if (!product || allProducts.length === 0) return;
    const filteredProducts = allProducts.filter((p) => {
      const categoryMatch = p.category?.toLowerCase() === product.category?.toLowerCase();
      const subCategoryMatch = p.subCategory && product.subCategory ? p.subCategory.toLowerCase() === product.subCategory.toLowerCase() : true; // If subcategory doesn't exist, skip this condition
      const brandMatch = p.brand?.toLowerCase() === product.brand?.toLowerCase();
      const nameMatch = p.name?.trim().toLowerCase() === product.name?.trim().toLowerCase();

      return categoryMatch && subCategoryMatch && brandMatch && nameMatch;
    });
    console.log("Filtered color variants - ", filteredProducts);

    // Set the filtered products as color variants
    setColorVariants(filteredProducts);
  }, [allProducts, product]);

  if (!product) {
    return <div>Loading product...</div>;
  }

  return (
    <div className="min-h-screen">
      <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-sm font-medium">New Arrival</span>
      <h1 className="text-xl md:text-2xl font-bold mt-2">{product.name}</h1>
      <h1 className="text-sm md:text-base  font-semibold mt-2">
        {capitalizeWords(product.brand)} {capitalizeWords(product.name)} | {capitalizeWords(product.subCategory)} fan | {product.fanSize}mm | {product.fanRpm}{" "}
        RPM | {product.fanWattage} Watt | {product.fanVoltage}volt | {capitalizeWords(product.warranty_guarantee)} {capitalizeWords(product.choose_W_G)} (
        {capitalizeWords(product.color)})
      </h1>
      <div className="flex items-center gap-2 mt-3">
        <div className="flex text-yellow-400">
          {[1, 2, 3, 4, 5].map((item) => (
            <FaStar key={item} />
          ))}
        </div>
        <span className="font-semibold">{product.rating}</span>
        <span className="text-gray-500">{product.numReviews} Reviews</span>
      </div>
      <div className="mt-1 md:mt-2">
        <span className="text-red-700 text-2xl md:text-3xl">-{product.discount}% </span>
        <span className="text-xl md:text-2xl font-semibold">₹{product.newPrice}</span>
        <span className="text-xs mx-1 md:text-sm text-gray-600">M.R.P.</span>
        <span className="line-through text-xs md:text-sm text-gray-500">{product.oldPrice}</span>
      </div>

      <p className="mt-2 text-gray-700">
        <span className="font-bold">Brand : {product.brand}</span>
      </p>
      <span className="text-gray-500 mt-1 line-clamp-3">{product.description}</span>

      {/* Color Section - Shows all matching products as color variants */}
      <h3 className="font-semibold mt-1">Color : {product.color}</h3>

      <div className="relative">
        {/* Mobile: Horizontal Scroll */}
        <div
          className="flex gap-4 overflow-x-auto p-4 scroll-smooth snap-x snap-mandatory 
                  sm:hidden [&::-webkit-scrollbar]:hidden"
        >
          {colorVariants.map((variant, index) => (
            <Link key={index} to={`/product/${variant._id}`} className="shrink-0 snap-start">
              <img src={variant.images?.[0]} className="w-25 h-25 object-cover rounded-lg shadow-md hover:scale-105 transition" alt={variant.name} />
            </Link>
          ))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
          {colorVariants.map((variant, index) => (
            <Link key={index} to={`/product/${variant._id}`}>
              <img src={variant.images?.[0]} className="w-full aspect-square object-cover rounded-lg shadow-md hover:scale-105 transition" alt={variant.name} />
            </Link>
          ))}
        </div>
      </div>

      <Link to="/checkout">
        <button className="bg-blue-600 hover:bg-blue-700 font-bold text-white w-full p-3 mt-3 rounded-xl">Buy Now</button>
      </Link>

      <div className="flex gap-4 mt-2">
        <button onClick={() => addToCart(product)} className="flex-1 bg-[#4F6B35] hover:bg-[#3f562b] text-white py-3 rounded-xl font-semibold transition">
          Add To Cart
        </button>
        <button onClick={() => addToWishlist(product)} className="w-16 rounded-xl border flex justify-center items-center hover:bg-gray-100">
          <FiHeart size={22} />
        </button>
      </div>

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

      <div className="grid sm:grid-cols-2 gap-5 mt-4">
        <div className="border rounded-xl p-3">
          <div className="flex gap-3">
            <FiTruck size={18} />
            <div>
              <h4 className="font-semibold">Delivery</h4>
              <p className="text-gray-500 text-sm">1-2 Working Days</p>
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

      {/* Main Table */}
      <h2 className="mt-4 pl-2 font-bold text-xl">Product Specification</h2>
      <div className="overflow-x-auto mt-2 border rounded-lg ">
        <table className="w-full text-sm">
          <tbody>
            {/* Row 1: Brand */}
            <tr className="border-b hover:bg-blue-50 transition duration-150">
              <td className="px-6 py-4 border-r font-bold text-gray-700 w-1/3 bg-gray-50">Brand</td>
              <td className="px-6 py-4 text-gray-900">{product.brand}</td>
            </tr>

            {/* Row 2: Colour */}
            <tr className="border-b  hover:bg-blue-50 transition duration-150">
              <td className="px-6 py-4 border-r font-bold text-gray-700 bg-gray-50">Colour</td>
              <td className="px-6 py-4 text-gray-900">{product.color}</td>
            </tr>

            {/* Row 3: Category */}
            <tr className="border-b hover:bg-blue-50 transition duration-150">
              <td className="px-6 py-4 border-r font-bold text-gray-700 bg-gray-50">Electric fan design</td>
              <td className="px-6 py-4 text-gray-500 italic">Ceiling Fan</td>
            </tr>

            {/* Row 4: Category */}
            <tr className="border-b hover:bg-blue-50 transition duration-150">
              <td className="px-6 py-4 border-r font-bold text-gray-700 bg-gray-50">Power Source</td>
              <td className="px-6 py-4 text-gray-900">Corded Electric</td>
            </tr>

            {/* Row 5: AirDelivery */}
            <tr className="border-b hover:bg-blue-50 transition duration-150">
              <td className="px-6 py-4 border-r font-bold text-gray-700 bg-gray-50">Air Delivery</td>
              <td className="px-6 py-4 text-gray-900">{product.airDelivery}</td>
            </tr>
            {/* Row 6: Fan RPM */}
            <tr className="border-b hover:bg-blue-50 transition duration-150">
              <td className="px-6 py-4 border-r font-bold text-gray-700 bg-gray-50">RPM</td>
              <td className="px-6 py-4 text-gray-900">{product.fanRpm}</td>
            </tr>
            {/* Row 7: Wattage */}
            <tr className="border-b hover:bg-blue-50 transition duration-150">
              <td className="px-6 py-4 border-r font-bold text-gray-700 bg-gray-50">Wattage</td>
              <td className="px-6 py-4 text-gray-900">{product.fanWattage}</td>
            </tr>

            {/* Row 8: Voltage */}
            <tr className="border-b hover:bg-blue-50 transition duration-150">
              <td className="px-6 py-4 border-r font-bold text-gray-700 bg-gray-50">Voltage</td>
              <td className="px-6 py-4 text-gray-900">{product.fanVoltage}</td>
            </tr>

            {/* Row 5: Item Weight */}
            <tr className="border-b hover:bg-blue-50 transition duration-150">
              <td className="px-6 py-4 border-r font-bold text-gray-700 bg-gray-50">Item Weight</td>
              <td className="px-6 py-4 text-lg text-green-700">{product.weight} Kg</td>
            </tr>

            {/* Row 6: warranty_guarantee */}
            <tr className="hover:bg-blue-50 transition duration-150">
              <td className="px-6 py-4 border-r font-bold text-gray-700 bg-gray-50">Warranty</td>
              <td className="px-6 py-4 text-gray-500 italic">{product.warranty_guarantee}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
