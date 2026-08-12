import { useContext, useState, useMemo, useCallback } from "react";
import { useProducts } from "../../hooks/useProducts"; // ✅ React Query hook
import { FiHeart, FiTruck, FiRefreshCw } from "react-icons/fi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { GoCpu } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function ProductInfo({ product }) {
  const [activeTab, setActiveTab] = useState('spec');
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);

  // ✅ React Query - Fetch all products for color variants
  const { data, isLoading } = useProducts({
    limit: 100,
    sort: "createdAt",
    order: "desc",
  });

  // ✅ Memoized all products
  const allProducts = useMemo(
    () => data?.pages?.flatMap((page) => page.products) || [],
    [data]
  );

  // ✅ Memoized color variants
  const colorVariants = useMemo(() => {
    if (!product || allProducts.length === 0) return [];

    return allProducts.filter((p) => {
      const categoryMatch = p.category?.toLowerCase() === product.category?.toLowerCase();
      const subCategoryMatch = p.subCategory && product.subCategory 
        ? p.subCategory.toLowerCase() === product.subCategory.toLowerCase() 
        : true;
      const brandMatch = p.brand?.toLowerCase() === product.brand?.toLowerCase();
      const nameMatch = p.name?.trim().toLowerCase() === product.name?.trim().toLowerCase();
      return categoryMatch && subCategoryMatch && brandMatch && nameMatch;
    });
  }, [allProducts, product]);

  // ✅ Utility functions
  const capitalizeWords = useCallback((str) => {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  const formatSpecificationLabel = useCallback((label) => {
    if (!label) return "";
    return label
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (char) => char.toUpperCase());
  }, []);

  // ✅ Add to cart handler
  const handleAddToCart = useCallback(() => {
    try {
      addToCart(product);
      toast.success(`${product.name} added to cart! 🛒`);
    } catch (error) {
      toast.error("Failed to add to cart ❌");
      console.error("Add to cart error:", error);
    }
  }, [product, addToCart]);

  // ✅ Add to wishlist handler
  const handleAddToWishlist = useCallback(() => {
    try {
      addToWishlist(product);
      toast.success(`${product.name} added to wishlist! ❤️`);
    } catch (error) {
      toast.error("Failed to add to wishlist ❌");
      console.error("Add to wishlist error:", error);
    }
  }, [product, addToWishlist]);

  // ✅ Render Specifications
  const renderSpecifications = useCallback(() => {
    if (!product) return null;

    let specs = [];

    if (
      product.specifications &&
      typeof product.specifications === "object" &&
      !Array.isArray(product.specifications)
    ) {
      specs = Object.entries(product.specifications).map(([label, value]) => ({
        label,
        value,
      }));
    } else if (Array.isArray(product.specifications)) {
      specs = product.specifications;
    } else if (
      product.specificationMap &&
      typeof product.specificationMap === "object"
    ) {
      specs = Object.entries(product.specificationMap).map(([label, value]) => ({
        label,
        value,
      }));
    }
    
    if (specs.length === 0) return null;

    return (
      <div className="overflow-x-auto mx-2 pb-1.5 bg-gray-50">
        <table className="w-full text-sm rounded-lg">
          <tbody>
            {specs.map((spec, index) => (
              <tr key={index}>
                <td className="px-4 py-1 font-semibold text-gray-700 bg-gray-50 w-1/3">
                  {formatSpecificationLabel(spec.label)}
                </td>
                <td className="px-4 bg-gray-50 text-gray-900">
                  {Array.isArray(spec.value)
                    ? spec.value.join(", ")
                    : typeof spec.value === "object"
                    ? JSON.stringify(spec.value)
                    : spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [product, formatSpecificationLabel]);

  // ✅ Render Description
  const renderDescription = useCallback(() => {
    if (!product) return null;
    
    const descriptionText = product.description || "No description available";
    const paragraphs = descriptionText.split('\n').filter(p => p.trim() !== '');
    
    return (
      <div className="space-y-2 text-sm text-gray-700 p-4">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, index) => (
            <p key={index}>{para}</p>
          ))
        ) : (
          <p>{descriptionText}</p>
        )}
      </div>
    );
  }, [product]);

  // ✅ Render Detailed Spec Table
  const renderDetailedSpecTable = useCallback(() => {
    if (!product) return null;

    let specs = [];
    if (product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0) {
      specs = product.specifications;
    } else if (product.specificationMap && typeof product.specificationMap === 'object' && Object.keys(product.specificationMap).length > 0) {
      specs = Object.entries(product.specificationMap).map(([label, value]) => ({
        label,
        value
      }));
    }

    const baseFields = [
      { label: "Brand", value: product.brand },
      { label: "Name", value: product.name },
      { label: "Colour", value: product.color },
      { label: "Warranty", value: product.warranty_guarantee },
      { label: "Warranty Type", value: product.choose_W_G },
      { label: "Include Components", value: product.includeComponents },
    ].filter(field => field.value && field.value !== '' && field.value !== null && field.value !== undefined);
    
    const allFields = [...baseFields, ...specs];
    
    if (allFields.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No detailed specifications available for this product.
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto pt-2 mx-2 bg-gray-50">
        <table className="w-full text-sm">
          <tbody>
            {allFields.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-1 font-medium text-gray-900 w-1/3 bg-gray-50">
                  {item.label}
                </td>
                <td className="px-4 text-gray-900">
                  {typeof item.value === 'object' ? JSON.stringify(item.value) : item.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [product]);

  if (!product) {
    return <div className="text-center py-10">Loading product...</div>;
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
        <span className="font-semibold">{product.rating || 0}</span>
        <span className="text-gray-500">{product.reviews || 0} Reviews</span>
      </div>
      
      {/* Price Section */}
      <div className="mt-1 md:mt-2">
        {product.discount > 0 && (
          <span className="text-red-700 text-3xl md:text-4xl">-{product.discount}% </span>
        )}
        <span className="text-2xl md:text-3xl font-semibold">₹{product.sellingPrice}</span>
        <span className="text-sm md:text-md ml-1.5 text-gray-700 font-semibold">M.R.P.</span>
        <span className="line-through text-md md:text-lg text-gray-500">₹{product.MRP}</span>
      </div>

      <p className="mt-2 text-gray-700">
        <span className="font-bold">Brand : {product.brand}</span>
      </p>
      
      {/* Color Section */}
      {colorVariants.length > 0 && (
        <>
          <h3 className="font-semibold mt-1">Color : {product.color}</h3>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto py-4 scroll-smooth snap-x snap-mandatory sm:hidden [&::-webkit-scrollbar]:hidden">
              {colorVariants.map((variant, index) => (
                <Link key={index} to={`/product/${variant._id}`} className="shrink-0 snap-start">
                  <img 
                    src={variant.images?.[0] || '/placeholder-image.jpg'} 
                    className="w-25 h-25 object-cover rounded-lg shadow-md hover:scale-105 transition" 
                    alt={variant.name} 
                    loading="lazy"
                  />
                </Link>
              ))}
            </div>
            <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4">
              {colorVariants.map((variant, index) => (
                <Link key={index} to={`/product/${variant._id}`}>
                  <img 
                    src={variant.images?.[0] || '/placeholder-image.jpg'} 
                    className="w-full aspect-square object-cover rounded-lg shadow-md hover:scale-105 transition" 
                    alt={variant.name}
                    loading="lazy"
                  />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <Link to="/checkout">
        <button className="bg-blue-600 hover:bg-blue-700 font-bold text-white w-full p-3 mt-3 rounded-xl transition">
          Buy Now
        </button>
      </Link>

      <div className="flex gap-4 mt-2">
        <button 
          onClick={handleAddToCart} 
          className="flex-1 border active:scale-95 transition-transform duration-150 bg-white hover:bg-red-600 hover:text-white text-black py-3 rounded-xl font-semibold"
        >
          Add To Cart
        </button>
        <button 
          onClick={handleAddToWishlist} 
          className="w-16 rounded-xl border flex justify-center items-center hover:bg-gray-100 transition"
        >
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
              ? 'border-red-600 text-red-700 bg-white/80'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          Product Specification
        </button>

        <button
          onClick={() => setActiveTab('desc')}
          className={`flex-1 py-4 px-6 text-center font-medium text-base transition-all duration-200 border-b-2 ${
            activeTab === 'desc'
              ? 'border-red-600 text-red-700 bg-white/80'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          Description
        </button>
      </div>

      {/* --- Dynamic Content Panel --- */}
      <div className="p-1 bg-white">
        {activeTab === 'spec' ? (
          <>
            {renderDetailedSpecTable()}
            {renderSpecifications()}
          </>
        ) : (
          renderDescription()
        )}
      </div>
    </div>
  );
}