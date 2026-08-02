// frontend/src/components/Shop/ProductInfo.jsx

import { useContext, useState, useEffect } from "react";
import { getProduct } from "../../api/productApi";
import { FiHeart, FiTruck, FiRefreshCw } from "react-icons/fi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { GoCpu } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import { CartContext } from "../../context/CartContext";
import { Link } from "react-router-dom";

export default function ProductInfo({ product }) {
  const [allProducts, setAllProducts] = useState([]);
  const [colorVariants, setColorVariants] = useState([]);
  const { addToCart } = useContext(CartContext);

  console.log("color",product);
  // Fetch all products
  const fetchProduct = async () => {
    try {
      const response = await getProduct();

      if (Array.isArray(response)) {
        setAllProducts(response);
      } 
      else if (response && typeof response === "object") {
        setAllProducts([response]);
      } 
      else {
        console.error("Unexpected API response format:", response);
        setAllProducts([]);
      }
    } 
    catch (error) {
      console.error("Error fetching product:", error);
      setAllProducts([]);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
      <h1 className="text-xl md:text-2xl font-bold mt-2">{capitalizeWords(product.brand)} {capitalizeWords(product.name)} |  {capitalizeWords(product.subCategory)} fan | {product.fanSize}mm | {product.fanWattage} Watt | {product.fanVoltage}volt | {capitalizeWords(product.warranty_guarantee)} ({capitalizeWords(product.color)})</h1>
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
        <span className="text-blue-700 text-2xl md:text-3xl font-bold">₹{product.newPrice}</span>
        <span className="text-lg mx-1 md:text-xl text-gray-600">M.R.P.</span>
        <span className="line-through text-lg md:text-xl text-gray-500">{product.oldPrice}</span>
      </div>

      <p className="mt-2 text-gray-700">
        <span className="font-bold">Brand : {product.brand}</span>
      </p>
      <span className="text-gray-500 mt-1 line-clamp-3">{product.description}</span>
         
      {/* Color Section - Shows all matching products as color variants */}
      <h3 className="font-semibold mt-1" >Color : {product.color}</h3>

        <div className="flex gap-2 md:gap-3.5 border-2 rounded-xl border-gray-300 p-1 md:p-2.5 mt-2 flex-wrap">
          {colorVariants.length > 0 ? 
          (
            colorVariants.map((variant, index) => (  
               <Link 
                key={index} 
                to={`/product/${variant._id}`}  // Navigate to product detail page with variant ID
                className="cursor-pointer rounded-lg block"
              >
                <img 
                  src={variant.images?.[0]} 
                  className="w-22 h-23 md:w-30 md:h-30 transition duration-500 ease-in-out hover:scale-105 object-cover rounded-xl"
                  alt={variant.name || "Product variant"}
                />  
              </Link>  
            ))
          ) : (
            <p className="text-gray-500 text-sm">No other color variants available</p>
          )}
        </div>
      

      <Link to="/checkout">
        <button className="bg-blue-600 hover:bg-blue-700 font-bold text-white w-full p-3 mt-3 rounded-xl">Buy Now</button>
      </Link>

      <div className="flex gap-4 mt-2">
        <button onClick={() => addToCart(product)} className="flex-1 bg-[#4F6B35] hover:bg-[#3f562b] text-white py-3 rounded-xl font-semibold transition">
          Add To Cart
        </button>
        <button className="w-16 rounded-xl border flex justify-center items-center hover:bg-gray-100">
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

              {/* Row 2: Product Name */}
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

              {/* Row 4: Category */}
              <tr className="border-b hover:bg-blue-50 transition duration-150">
                <td className="px-6 py-4 border-r font-bold text-gray-700 bg-gray-50">Wattage</td>
                <td className="px-6 py-4 text-gray-900">{product.fanWattage}</td>
              </tr>

              {/* Row 4: Subcategory */}
              <tr className="border-b hover:bg-blue-50 transition duration-150">
                <td className="px-6 py-4 border-r font-bold text-gray-700 bg-gray-50">Voltage</td>
                <td className="px-6 py-4 text-gray-900">{product.fanVoltage}</td>
              </tr>

              {/* Row 5: Price */}
              <tr className="border-b hover:bg-blue-50 transition duration-150">
                <td className="px-6 py-4 border-r font-bold text-gray-700 bg-gray-50">Item Weight</td>
                <td className="px-6 py-4 text-lg text-green-700">{product.weight} Kg</td>
              </tr>

              {/* Row 6: Color */}
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
