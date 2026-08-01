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
    <div className="">
      <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-sm font-medium">New Arrival</span>
      <h1 className="text-xl md:text-2xl font-bold mt-2">{product.name}</h1>
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
      <p className="text-gray-500 mt-1">{product.description}</p>

      {/* Color Section - Shows all matching products as color variants */}
      <h3 className="font-semibold mt-1" >Color : {product.color}</h3>

        <div className="flex gap-1.5 md:gap-3.5 mt-2 flex-wrap 2">
          {colorVariants.length > 0 ? 
          (
            colorVariants.map((variant, index) => (          
              <div key={index} className="cursor-pointer rounded-lg " >
                <img 
                  src={variant.images?.[0]} 
                  className="w-23 h-23 transition duration-500 ease-in-out hover:scale-105  object-cover rounded"
                />  
              </div>   
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
    </div>
  );
}
