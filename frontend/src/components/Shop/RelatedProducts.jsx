import { FaHeart, FaStar } from "react-icons/fa";
import "../../index.css";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useProducts } from "../../hooks"; // ✅ React Query hook

export default function RelatedProducts({ product: currentProduct }) {
  // ✅ React Query se products fetch karo
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts({
    limit: 8,
    sort: "createdAt",
    order: "desc",
  });

  // ✅ Products ko flat karo
  const allProducts = useMemo(
    () => data?.pages.flatMap((page) => page.products) || [],
    [data]
  );

  // ✅ Current product ko filter karo (takay same product na dikhe)
  const filteredProducts = useMemo(() => {
    if (!currentProduct?._id) return allProducts;
    return allProducts.filter((p) => p._id !== currentProduct._id);
  }, [allProducts, currentProduct]);

  // ✅ Loading State
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto mt-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold">You May Also Like</h2>
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

  // ✅ Agar products nahi hain
  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto mt-8 px-4">
      {/* Heading */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold">You May Also Like</h2>
          <p className="text-gray-500 text-sm lg:text-lg mt-1">Explore Best products.</p>
        </div>
        <Link 
          to="/shop" 
          className="hidden md:block font-semibold text-lg px-4 rounded-lg hover:text-red-800 transition duration-200"
        >
          View All
        </Link>
      </div>

      {/* Cards */}
      <div className="flex gap-2 py-3 overflow-x-auto hide-scrollbar scroll-smooth">
        {filteredProducts.slice(0, 8).map((product) => (
          <div 
            key={product._id} 
            className="group rounded-sm bg-white shadow-md hover:shadow-lg transition-transform duration-300 min-w-50 max-w-55"
          >
            {/* Image */}
            <Link to={`/product/${product._id}`}>
              <div className="relative overflow-hidden w-full">
                <img 
                  src={product.images?.[0] || '/placeholder-image.jpg'} 
                  alt={product.name || 'Product'} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />

                <button 
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-red-500 hover:text-white transition"
                  aria-label="Add to wishlist"
                >
                  <FaHeart />
                </button>

                {/* Discount Badge */}
                {product.discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    -{product.discount}% OFF
                  </span>
                )}
              </div>
            </Link>

            {/* Content */}
            <div className="p-2">
              <h3 className="text-sm md:text-base font-bold mt-0 line-clamp-1">
                {product.name}
              </h3>
              
              <div className="flex items-center gap-1 mt-1">
                <FaStar className="text-yellow-400" />
                <span className="text-sm">{product.rating || 0}</span>
                {product.reviews > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({product.reviews})
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div>
                  <span className="text-lg lg:text-xl font-bold text-green-700">
                    ₹{product.sellingPrice}
                  </span>
                  {product.MRP > product.sellingPrice && (
                    <span className="text-xs text-gray-400 line-through ml-2">
                      ₹{product.MRP}
                    </span>
                  )}
                </div>

                <Link
                  to={`/product/${product._id}`}
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