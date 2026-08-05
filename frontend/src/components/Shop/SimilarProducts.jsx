import { FaHeart, FaStar } from "react-icons/fa";
import "../../index.css";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useProducts } from "../../hooks"; // ✅ React Query hook

export default function SimilarProducts({ product }) {
  // ✅ React Query se products fetch karo
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts({
    limit: 20,
    sort: "createdAt",
    order: "desc",
  });

  // ✅ Products ko flat karo
  const allProducts = useMemo(
    () => data?.pages.flatMap((page) => page.products) || [],
    [data]
  );

  // ✅ Similar products filter karo (same category & subcategory)
  const similarProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];

    return allProducts.filter((p) => 
      p._id !== product._id && // Exclude current product
      p.category === product.category &&
      p.subCategory === product.subCategory
    );
  }, [allProducts, product]);

  // ✅ Loading State
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto mt-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold">Similar Products</h2>
            <p className="text-gray-500 text-sm lg:text-lg mt-1">Loading...</p>
          </div>
        </div>
        <div className="flex gap-2 py-3 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="min-w-50 bg-gray-200 animate-pulse rounded-lg h-72"></div>
          ))}
        </div>
      </section>
    );
  }

  // ✅ Error State
  if (isError) {
    return (
      <section className="max-w-7xl mx-auto mt-8 px-4">
        <div className="text-center py-8">
          <p className="text-red-500">⚠️ {error?.message || "Failed to load products"}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-1 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // ✅ If no similar products found
  if (similarProducts.length === 0) {
    return (
      <section className="max-w-7xl mx-auto mt-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold">Similar Products</h2>
            <p className="text-gray-500 text-sm lg:text-lg mt-1">
              No similar products found in this category.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto mt-8 px-4">
      {/* Heading */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold">Similar Products</h2>
          <p className="text-gray-500 text-sm lg:text-lg mt-1">
            Explore similar products selected for you.
          </p>
        </div>
        <Link 
          to="/shop" 
          className="hidden md:block text-lg font-semibold px-4 rounded-lg hover:text-red-800 transition duration-200"
        >
          View All
        </Link>
      </div>

      {/* Cards */}
      <div className="flex gap-2 py-3 overflow-x-auto hide-scrollbar scroll-smooth">
        {similarProducts.slice(0, 8).map((productItem) => (
          <div 
            key={productItem._id} 
            className="group rounded-sm bg-white shadow-md hover:shadow-lg transition-transform duration-300 min-w-50 max-w-55"
          >
            {/* Image */}
            <Link to={`/product/${productItem._id}`}>
              <div className="relative overflow-hidden w-full">
                <img 
                  src={productItem.images?.[0] || '/placeholder-image.jpg'} 
                  alt={productItem.name || 'Product'} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                
                {productItem.discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                    -{productItem.discount}% OFF
                  </span>
                )}

                <button 
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-red-500 hover:text-white transition"
                  aria-label="Add to wishlist"
                >
                  <FaHeart />
                </button>
              </div>
            </Link>

            {/* Content */}
            <div className="p-2">
              <h3 className="text-sm lg:text-base leading-5 font-semibold mt-0 line-clamp-2">
                {productItem.name}
              </h3>
              
              <div className="flex items-center gap-1 mt-1">
                <FaStar className="text-yellow-400" />
                <span className="text-sm">{productItem.rating || 0}</span>
                {productItem.reviews > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({productItem.reviews})
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div>
                  <span className="text-lg lg:text-xl font-bold text-green-700">
                    ₹{productItem.sellingPrice}
                  </span>
                  {productItem.MRP > productItem.sellingPrice && (
                    <span className="text-xs text-gray-400 line-through ml-2">
                      ₹{productItem.MRP}
                    </span>
                  )}
                </div>

                <Link
                  to={`/product/${productItem._id}`}
                  className="bg-black text-white px-3 py-1.5 rounded-lg hover:bg-red-600 text-sm font-semibold transition"
                >
                  Buy
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}