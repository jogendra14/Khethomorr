import { FaHeart, FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useContext, useMemo, useCallback, useState, useEffect } from "react";
import { CartContext } from "../../../context/CartContext";
import { WishlistContext } from "../../../context/WishlistContext";
import { getImageUrl } from "../../../utils/imageUtils";

const ProductCard = ({ product: productFromApi }) => {
  const { addToCart } = useContext(CartContext) || {};
  const { toggleWishlist, wishlistItems = [], wishlist = [] } = useContext(WishlistContext) || {};

  // ✅ Computed Product aligned with Product.js backend models
  const product = useMemo(() => {
    if (!productFromApi) return {};

    const rawPrice = Number(productFromApi.price) || 0;
    
    // MRP / Compare At Price checks
    const rawMRP = Number(
      productFromApi.compareAtPrice ??
      productFromApi.MRP ??
      productFromApi.oldPrice ??
      productFromApi.originalPrice
    ) || 0;

    // Selling / Current Price checks
    const rawSellingPrice = productFromApi.sellingPrice !== undefined && productFromApi.sellingPrice !== null
      ? Number(productFromApi.sellingPrice)
      : productFromApi.currentPrice !== undefined && productFromApi.currentPrice !== null
        ? Number(productFromApi.currentPrice)
        : productFromApi.discountPrice !== undefined && productFromApi.discountPrice !== null
          ? Number(productFromApi.discountPrice)
          : null;

    // Discount percentage checks (Supports object { type, value, isActive }, number, or virtual discountPercentage)
    let discountPercent = 0;
    if (typeof productFromApi.discount === "number") {
      discountPercent = productFromApi.discount;
    } else if (productFromApi.discount && typeof productFromApi.discount === "object") {
      if (productFromApi.discount.isActive !== false) {
        if (productFromApi.discount.type === "percentage") {
          discountPercent = Number(productFromApi.discount.value) || 0;
        } else if (productFromApi.discount.type === "fixed" && rawPrice > 0) {
          discountPercent = Math.round(((Number(productFromApi.discount.value) || 0) / rawPrice) * 100);
        }
      }
    } else if (productFromApi.discountPercentage) {
      discountPercent = Number(productFromApi.discountPercentage) || 0;
    }

    let sellingPrice = 0;
    let MRP = 0;

    if (rawSellingPrice !== null && rawMRP > 0) {
      sellingPrice = rawSellingPrice;
      MRP = rawMRP;
    } else if (rawMRP > rawPrice && rawPrice > 0) {
      sellingPrice = rawPrice;
      MRP = rawMRP;
    } else if (rawPrice > 0 && discountPercent > 0) {
      if (rawMRP > 0) {
        MRP = rawMRP;
        sellingPrice = rawPrice;
      } else {
        MRP = rawPrice;
        sellingPrice = Math.round(rawPrice * (1 - discountPercent / 100));
      }
    } else {
      sellingPrice = rawSellingPrice !== null ? rawSellingPrice : rawPrice;
      MRP = rawMRP > sellingPrice ? rawMRP : 0;
    }

    // Auto calculate discount percentage if MRP & sellingPrice present
    if (MRP > sellingPrice && sellingPrice > 0 && discountPercent === 0) {
      discountPercent = Math.round(((MRP - sellingPrice) / MRP) * 100);
    }

    // Stock check from quantity, stock, countInStock, or status
    const stockQty = productFromApi.quantity !== undefined
      ? Number(productFromApi.quantity)
      : productFromApi.stock !== undefined
        ? Number(productFromApi.stock)
        : productFromApi.countInStock !== undefined
          ? Number(productFromApi.countInStock)
          : null;

    const isOutOfStock = productFromApi.status === "outOfStock" || (stockQty !== null && stockQty <= 0);

    // Rating & Review Count
    const rating = Number(productFromApi.rating ?? productFromApi.averageRating) || 0;
    const reviewCount = Number(productFromApi.numReviews ?? productFromApi.totalReviews) || 0;

    // Category name
    const categoryName = typeof productFromApi.category === "object"
      ? productFromApi.category?.name
      : productFromApi.category;

    return {
      ...productFromApi,
      _id: productFromApi._id || productFromApi.id,
      name: productFromApi.name || "Product",
      sellingPrice,
      MRP,
      discountPercent,
      isOutOfStock,
      rating,
      reviewCount,
      brand: productFromApi.brand || "",
      categoryName: categoryName || "",
    };
  }, [productFromApi]);

  // ✅ Image resolution with dynamic error fallback handling
  const resolveImage = useCallback(() => {
    if (typeof getImageUrl === "function") {
      try {
        const url = getImageUrl(productFromApi);
        if (url) return url;
      } catch {
        // Fallback below
      }
    }
    if (Array.isArray(productFromApi?.images) && productFromApi.images.length > 0) {
      const first = productFromApi.images.find((img) => img?.isPrimary) || productFromApi.images[0];
      if (typeof first === "string") return first;
      if (first?.url) return first.url;
    }
    if (typeof productFromApi?.image === "string") return productFromApi.image;
    if (productFromApi?.image?.url) return productFromApi.image.url;
    if (productFromApi?.imageUrl) return productFromApi.imageUrl;
    return "/placeholder-image.jpg";
  }, [productFromApi]);

  const [imgSrc, setImgSrc] = useState(resolveImage);

  useEffect(() => {
    setImgSrc(resolveImage());
  }, [resolveImage]);

  const handleImageError = () => {
    setImgSrc("/placeholder-image.jpg");
  };

  // ✅ Wishlist state detection
  const isWishlisted = useMemo(() => {
    if (!product._id) return false;
    const list = Array.isArray(wishlistItems) && wishlistItems.length > 0
      ? wishlistItems
      : Array.isArray(wishlist)
        ? wishlist
        : [];
    return list.some((item) => (typeof item === "object" ? (item._id || item.id) === product._id : item === product._id));
  }, [wishlistItems, wishlist, product._id]);

  // ✅ Event Handlers
  const handleWishlistToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleWishlist) {
      toggleWishlist(product);
    }
  }, [product, toggleWishlist]);

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isOutOfStock) return;
    if (addToCart) {
      addToCart(product);
    }
  }, [product, addToCart]);

  // ✅ Rating stars render with full, half, and empty stars
  const renderStars = useMemo(() => {
    const ratingVal = Math.min(5, Math.max(0, product.rating));
    const fullStars = Math.floor(ratingVal);
    const hasHalfStar = ratingVal - fullStars >= 0.5;

    return (
      <div className="flex items-center gap-0.5 text-yellow-500" aria-label={`Rating: ${ratingVal} out of 5`}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <FaStar key={i} className="text-yellow-400" />;
          } else if (i === fullStars && hasHalfStar) {
            return <FaStarHalfAlt key={i} className="text-yellow-400" />;
          } else {
            return <FaRegStar key={i} className="text-gray-300" />;
          }
        })}
      </div>
    );
  }, [product.rating]);

  return (
    <div className="w-60 group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border border-gray-100 relative">
      {/* Image & Badges Container */}
      <Link to={product._id ? `/product/${product._id}` : "#"} className="block overflow-hidden relative">
        <div className="relative w-full h-44 bg-gray-50 flex items-center justify-center p-3 overflow-hidden">
          <img
            src={imgSrc}
            alt={product.name}
            onError={handleImageError}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Discount Badge */}
          {product.discountPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              -{product.discountPercent}% OFF
            </span>
          )}

          {/* Out of Stock Overlay Badge */}
          {product.isOutOfStock && (
            <span className="absolute bottom-2.5 left-2.5 bg-gray-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm">
              Out of Stock
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center transition-colors duration-200 ${
              isWishlisted ? "text-red-600" : "text-gray-400 hover:text-red-600 hover:bg-white"
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FaHeart className={isWishlisted ? "fill-current" : ""} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Brand / Category Subtitle */}
          {(product.brand || product.categoryName) && (
            <p className="text-[11px] font-semibold tracking-wide uppercase text-gray-400 mb-1 truncate">
              {product.brand || product.categoryName}
            </p>
          )}

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px] group-hover:text-red-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            {renderStars}
            <span className="text-xs text-gray-500 font-medium">
              ({product.rating > 0 ? product.rating.toFixed(1) : "0.0"})
            </span>
            {product.reviewCount > 0 && (
              <span className="text-[11px] text-gray-400">
                ({product.reviewCount})
              </span>
            )}
          </div>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mt-2 flex-wrap">
            <span className="text-lg font-bold text-red-600">
              ₹{product.sellingPrice?.toLocaleString("en-IN")}
            </span>

            {product.MRP > product.sellingPrice && (
              <span className="text-xs text-gray-400 line-through font-medium">
                ₹{product.MRP?.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add To Cart Button */}
      <div className="p-3 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={product.isOutOfStock}
          className={`w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-sm ${
            product.isOutOfStock
              ? "bg-gray-200 text-gray-500 cursor-not-allowed active:scale-100"
              : "bg-black text-white hover:bg-red-600 hover:shadow"
          }`}
        >
          <FaShoppingCart className="text-xs" />
          {product.isOutOfStock ? "Out of Stock" : "Add To Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;