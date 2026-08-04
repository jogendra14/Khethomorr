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
  const [activeTab, setActiveTab] = useState('spec');

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

  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    if (!product || allProducts.length === 0) return;
    const filteredProducts = allProducts.filter((p) => {
      const categoryMatch = p.category?.toLowerCase() === product.category?.toLowerCase();
      const subCategoryMatch = p.subCategory && product.subCategory 
        ? p.subCategory.toLowerCase() === product.subCategory.toLowerCase() 
        : true;
      const brandMatch = p.brand?.toLowerCase() === product.brand?.toLowerCase();
      const nameMatch = p.name?.trim().toLowerCase() === product.name?.trim().toLowerCase();
      return categoryMatch && subCategoryMatch && brandMatch && nameMatch;
    });
    setColorVariants(filteredProducts);
  }, [allProducts, product]);


  // ----- DYNAMIC SPECIFICATION RENDERER -----
  const renderSpecifications = () => {
    if (!product) return null;

    // Case 1: Using specifications array
    let specs = [];
    if (product.specifications && Array.isArray(product.specifications)) {
      specs = product.specifications;
    }
    // Case 2: Using specificationMap
    else if (product.specificationMap && typeof product.specificationMap === 'object') {
      specs = Object.entries(product.specificationMap).map(([label, value]) => ({
        label,
        value
      }));
    }

    return (
      <div className="space-y-1 flex gap-4 text-sm text-gray-700">
        <div className="flex flex-col gap-2 min-w-30">
          {specs.map((spec, index) => (
            <span key={`label-${index}`} className="font-medium">
              {spec.label}:
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {specs.map((spec, index) => (
            <span key={`value-${index}`} className="text-gray-900">
              {spec.value}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // ----- DYNAMIC DESCRIPTION RENDERER -----
  const renderDescription = () => {
    if (!product) return null;
    
    const descriptionText = product.description || "No description available";
    const paragraphs = descriptionText.split('\n').filter(p => p.trim() !== '');
    
    return (
      <div className="space-y-2 text-sm text-gray-700">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, index) => (
            <p key={index}>{para}</p>
          ))
        ) : (
          <p>{descriptionText}</p>
        )}
      </div>
    );
  };

  // ----- DYNAMIC TABLE RENDERER -----
  const renderDetailedSpecTable = () => {
    if (!product) return null;

    let specs = [];
    if (product.specifications && Array.isArray(product.specifications)) {
      specs = product.specifications;
    } 
    else if (product.specificationMap && typeof product.specificationMap === 'object') 
    {
      specs = Object.entries(product.specificationMap).map(([label, value]) => ({
        label,
        value
      }));
    }

    // Also include base product fields that aren't in specifications
    const baseFields = [
      { label: "Brand", value: product.brand },
      { label: "Name", value: product.name },
      { label: "Colour", value: product.color },
      { label: "Include Components", value: product.includeComponents },
    ].filter(field => field.value);

    const allFields = [...baseFields, ...specs];
    
    return (
      <div className="overflow-x-auto mt-2 border rounded-lg">
        <table className="w-full text-sm">
          <tbody>
            {allFields.map((item, index) => (
              <tr 
                key={index} 
                className={index % 2 === 0 ? "border-b hover:bg-blue-50 transition duration-150" : "hover:bg-blue-50 transition duration-150"}
              >
                <td className="px-6 py-3 border-r font-bold text-gray-700 w-1/3 bg-gray-50">
                  {item.label}
                </td>
                <td className="px-6 py-3 text-gray-900">
                  {typeof item.value === 'object' ? JSON.stringify(item.value) : item.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!product) {
    return <div>Loading product...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Product Header */}
      <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-sm font-medium">New Arrival</span>
      <h1 className="text-xl md:text-2xl font-bold mt-2">{product.name}</h1>
      <h1 className="text-sm md:text-base font-semibold mt-2">
        {capitalizeWords(product.brand)} {capitalizeWords(product.name)} | {capitalizeWords(product.subCategory)} | {capitalizeWords(product.warranty_guarantee)} {capitalizeWords(product.choose_W_G)} (
        {capitalizeWords(product.color)})
      </h1>
      
      {/* Rating Section */}
      <div className="flex items-center gap-2 mt-3">
        <div className="flex text-yellow-400">
          {[1, 2, 3, 4, 5].map((item) => (
            <FaStar key={item} />
          ))}
        </div>
        <span className="font-semibold">{product.rating}</span>
        <span className="text-gray-500">{product.reviews} Reviews</span>
      </div>
      
      {/* Price Section */}
      <div className="mt-1 md:mt-2">
        <span className="text-red-700 text-3xl md:text-4xl">-{product.discount}% </span>
        <span className="text-2xl md:text-3xl font-semibold">₹{product.sellingPrice}</span>
        <span className="text-sm md:text-md ml-1.5 text-gray-700 font-semibold">M.R.P.</span>
        <span className="line-through text-md md:text-lg text-gray-500">{product.MRP}</span>
      </div>

      <p className="mt-2 text-gray-700">
        <span className="font-bold">Brand : {product.brand}</span>
      </p>
      <span className="text-gray-500 mt-1 line-clamp-3">{product.description}</span>

      {/* Color Section */}
      <h3 className="font-semibold mt-1">Color : {product.color}</h3>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto py-4 scroll-smooth snap-x snap-mandatory sm:hidden [&::-webkit-scrollbar]:hidden">
          {colorVariants.map((variant, index) => (
            <Link key={index} to={`/product/${variant._id}`} className="shrink-0 snap-start">
              <img src={variant.images?.[0]} className="w-25 h-25 object-cover rounded-lg shadow-md hover:scale-105 transition" alt={variant.name} />
            </Link>
          ))}
        </div>
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4">
          {colorVariants.map((variant, index) => (
            <Link key={index} to={`/product/${variant._id}`}>
              <img src={variant.images?.[0]} className="w-full aspect-square object-cover rounded-lg shadow-md hover:scale-105 transition" alt={variant.name} />
            </Link>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <Link to="/checkout">
        <button className="bg-blue-600 hover:bg-blue-700 font-bold text-white w-full p-3 mt-3 rounded-xl">Buy Now</button>
      </Link>

      <div className="flex gap-4 mt-2">
        <button onClick={() => addToCart(product)} className="flex-1 border active:scale-95 transition-transform duration-150 bg-white hover:bg-red-600 hover:text-white text-black py-3 rounded-xl font-semibold">
          Add To Cart
        </button>
        <button onClick={() => addToWishlist(product)} className="w-16 rounded-xl border flex justify-center items-center hover:bg-gray-100">
          <FiHeart size={22} />
        </button>
      </div>

      {/* Features Grid */}
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

      {/* --- Tabs --- */}
      <div className="flex border-b border-gray-200 bg-gray-50/60 mt-4">
        <button
          onClick={() => setActiveTab('spec')}
          className={`flex-1 py-4 px-6 text-center font-medium text-base transition-all duration-200 border-b-2 ${
            activeTab === 'spec'
              ? 'border-blue-600 text-blue-700 bg-white/80'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          Product Specification
        </button>

        <button
          onClick={() => setActiveTab('desc')}
          className={`flex-1 py-4 px-6 text-center font-medium text-base transition-all duration-200 border-b-2 ${
            activeTab === 'desc'
              ? 'border-blue-600 text-blue-700 bg-white/80'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          Description
        </button>
      </div>

      {/* --- Dynamic Content Panel --- */}
      <div className="p-2 bg-white">
        <div className="bg-gray-50/70 rounded-xl p-5 border border-gray-100/80">
          {activeTab === 'spec' ? renderSpecifications() : renderDescription()}
        </div>

        <div className="mt-4 text-xs text-gray-400 flex justify-end items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${activeTab === 'spec' ? 'bg-blue-500' : 'bg-emerald-400'}`}></span>
          <span>showing: {activeTab === 'spec' ? 'specifications' : 'description'}</span>
        </div>
      </div>

      {/* --- Detailed Specifications Table --- */}
      <h2 className="mt-4 pl-2 font-bold text-xl">Detailed Product Specifications</h2>
      {renderDetailedSpecTable()}
    </div>
  );
}