import { FaHeart, FaStar, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useContext, useMemo, useCallback } from "react";
import { CartContext } from "../../../context/CartContext";
import { WishlistContext } from "../../../context/WishlistContext";

const ProductCard = ({ product: productFromApi }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist } = useContext(WishlistContext);

  // ✅ Memoized product with computed prices
  const product = useMemo(() => {
    const discount = Number(productFromApi.discount) || 0;
    const newPrice = Number(productFromApi.sellingPrice) || Number(productFromApi.price);
    const oldPrice = productFromApi.MRP 
      ? Number(productFromApi.MRP) 
      : (discount > 0 ? Math.round(newPrice / (1 - discount / 100)) : newPrice);
    
    return {
      ...productFromApi,
      newPrice,
      oldPrice,
      discount,
    };
  }, [productFromApi]);

  // ✅ Memoized handlers
  const handleWishlistToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  }, [product, toggleWishlist]);

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  }, [product, addToCart]);

  // ✅ Rating stars render
  const renderStars = useMemo(() => {
    const rating = Number(product.rating) || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    return (
      <>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <FaStar key={i} className="text-yellow-500" />;
          } else if (i === fullStars && hasHalfStar) {
            return <FaStar key={i} className="text-yellow-500" />; // Half star ke liye separate component use kar sakte ho
          } else {
            return <FaStar key={i} className="text-gray-300" />;
          }
        })}
      </>
    );
  }, [product.rating]);

  return (
    <div className="w-60 group bg-white rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition duration-300">
      {/* Image */}
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.images?.[0] || '/placeholder-image.jpg'}
            alt={product.name || 'Product'}
            className="w-full h-40 md:h-46 lg:h-50 object-contain group-hover:scale-105 transition duration-500"
            loading="lazy"
          />

          {product.discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
              -{product.discount}% OFF
            </span>
          )}
          
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 md:top-3 md:right-3 w-7 md:w-10 h-7 md:h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-600 hover:text-white transition"
            aria-label="Add to wishlist"
          >
            <FaHeart />
          </button>
        </div>

        {/* Content */}
        <div className="px-2 py-1">
          <h3 className="text-sm md:text-lg min-h-10 md:min-h-14 line-clamp-2 font-medium">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mt-1 text-sm md:text-lg">
            {renderStars}
            <span className="text-gray-500 text-sm ml-2">
              ({product.rating || 0})
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-lg md:text-2xl font-bold text-red-600">
              ₹{product.sellingPrice}
            </span>

            {product.MRP && Number(product.MRP) > Number(product.sellingPrice) && (
              <span className="text-gray-400 text-sm md:text-md line-through">
                ₹{product.MRP}
              </span>
            )}
          </div>
        </div>
      </Link>
      
      <div className="px-2 pb-1.5 md:pb-2">
        <button
          onClick={handleAddToCart}
          className="border w-full active:scale-95 transition-transform duration-150 bg-black text-sm md:text-base hover:bg-red-600 text-white py-2 rounded-sm flex items-center justify-center gap-2"
        >
          <FaShoppingCart />
          Add To Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;