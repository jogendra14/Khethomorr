import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { useCallback, useContext, useMemo } from "react";
import { BsCartCheck } from "react-icons/bs";
import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";

export default function ShowProduct({ product }) {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  const productData = useMemo(() => ({
    ...product,
    discount: Number(product.discount) || 0,
    sellingPrice: Number(product.sellingPrice) || 0,
    MRP: Number(product.MRP) || 0,
    rating: Number(product.rating) || 0,
  }), [product]);

  const handleAddToCart = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(productData);
  }, [addToCart, productData]);

  const handleWishlist = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(productData);
  }, [productData, toggleWishlist]);

  const wished = isInWishlist(productData._id);
  const productImage = productData.images?.[0] || "/placeholder-image.jpg";

  return (
    <div className="bg-white rounded-sm shadow hover:shadow-lg duration-300 pb-1.5 overflow-hidden group">
      <Link to={`/product/${productData._id}`}>
        <div className="relative">
          <img src={productImage} alt={productData.name || "Product"} className="w-full h-45 md:h-50 lg:h-60 object-contain" loading="lazy" />
          {productData.discount > 0 && <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">{productData.discount}% OFF</span>}
          <button onClick={handleWishlist} className={`absolute top-2 md:top-3 right-2 md:right-3 p-1.5 md:p-2 rounded-full shadow transition-colors ${wished ? "bg-red-500 text-white" : "bg-white hover:bg-red-500 hover:text-white"}`} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}>
            <Heart size={18} fill={wished ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mx-3 my-1">
          <h2 className="text-sm md:text-base font-medium line-clamp-2 min-h-10">{productData.name}</h2>
          <div className="flex items-center min-h-6 gap-1 mt-1">
            <Star fill="gold" color="gold" size={16} />
            <span className="text-sm">{productData.rating}</span>
            {productData.reviews > 0 && <span className="text-xs text-gray-400 ml-1">({productData.reviews})</span>}
          </div>
          <div className="mt-1 flex items-center flex-wrap gap-1">
            <span className="text-lg md:text-xl font-bold text-red-600">₹{productData.sellingPrice}</span>
            {productData.MRP > productData.sellingPrice && <span className="font-semibold line-through text-sm text-gray-400">₹{productData.MRP}</span>}
          </div>
        </div>
      </Link>
      <div className="px-2 mt-2.5 md:pb-1">
        <button onClick={handleAddToCart} className="w-full flex justify-center items-center gap-2 mt-1 border text-red-500 font-bold border-red-600 hover:bg-red-600 hover:text-white rounded-xs md:rounded-md py-1 md:py-1.5 transition-colors">
          <BsCartCheck size={18} /><span className="text-sm sm:text-md md:text-lg">Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
