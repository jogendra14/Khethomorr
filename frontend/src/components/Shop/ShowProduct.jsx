import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { useContext, useCallback, useMemo } from "react";
import { CartContext } from "../../context/CartContext";
import { BsCartCheck } from "react-icons/bs";
import toast from "react-hot-toast";

export default function ShowProduct({ product }) {
  const { addToCart } = useContext(CartContext);

  // ✅ Memoized product data
  const productData = useMemo(() => {
    const discount = Number(product.discount) || 0;
    const sellingPrice = Number(product.sellingPrice) || 0;
    const MRP = Number(product.MRP) || 0;
    
    return {
      ...product,
      discount,
      sellingPrice,
      MRP,
      rating: Number(product.rating) || 0,
    };
  }, [product]);

  // ✅ Add to cart handler with feedback
  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      addToCart(productData);
      toast.success(`${productData.name} added to cart! 🛒`);
    } catch (error) {
      toast.error("Failed to add to cart ❌");
      console.error("Add to cart error:", error);
    }
  }, [productData, addToCart]);

  // ✅ Wishlist handler (placeholder - aap implement kar sakte ho)
  const handleWishlist = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success("Added to wishlist! ❤️");
    // TODO: Add wishlist logic
  }, []);

  // ✅ Check if product has valid image
  const productImage = useMemo(() => {
    return productData.images?.[0] || '/placeholder-image.jpg';
  }, [productData.images]);

  return (
    <div className="bg-white rounded-sm shadow hover:shadow-lg duration-300 pb-1.5 overflow-hidden group">
      <Link to={`/product/${productData._id}`}>
        <div className="relative">
          <img 
            src={productImage} 
            alt={productData.name || 'Product'} 
            className="w-full h-45 md:h-50 lg:h-60 object-contain"
            loading="lazy"
          />

          {/* Discount Badge */}
          {productData.discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {productData.discount}% OFF
            </span>
          )}

          <button 
            onClick={handleWishlist}
            className="absolute top-2 md:top-3 right-2 md:right-3 bg-white p-1.5 md:p-2 rounded-full shadow hover:bg-red-500 hover:text-white transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart size={18} />
          </button>
        </div>

        <div className="mx-3 my-1">
          <h2 className="text-sm md:text-base font-medium line-clamp-2 min-h-10">
            {productData.name}
          </h2>

          <div className="flex items-center min-h-6 gap-1 mt-1 sm:mt-1">
            <Star fill="gold" color="gold" size={16} />
            <span className="text-sm">{productData.rating}</span>
            {productData.reviews > 0 && (
              <span className="text-xs text-gray-400 ml-1">
                ({productData.reviews})
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center flex-wrap gap-1">
            <span className="text-lg md:text-xl font-bold text-red-600">
              ₹{productData.sellingPrice}
            </span>
            
            {productData.MRP > productData.sellingPrice && (
              <span className="font-semibold line-through text-sm md:text-md text-gray-400">
                ₹{productData.MRP}
              </span>
            )}
            
            {productData.discount > 0 && (
              <span className="font-bold text-green-600 text-sm md:text-[15px]">
                ({productData.discount}% OFF)
              </span>
            )}
          </div>
        </div>
      </Link>
      
      <div className="px-2 mt-2.5 md:pb-1">
        <button 
          onClick={handleAddToCart}
          className="w-full flex justify-center items-center gap-2 mt-1 border text-red-500 font-bold border-red-600 hover:bg-red-600 hover:text-white rounded-xs md:rounded-md py-1 md:py-1.5 transition-colors duration-200 active:scale-95"
        >
          <BsCartCheck size={18} />
          <span className="text-sm sm:text-md md:text-lg">
            Add to Cart
          </span>
        </button>
      </div>
    </div>
  );
}