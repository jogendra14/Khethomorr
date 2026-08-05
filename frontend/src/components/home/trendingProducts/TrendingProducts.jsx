import { useState, useRef } from "react";
import { useProducts } from "../../../hooks/useProducts"; // ✅ React Query hook
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";
import '../../../index.css';
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";

const TrendingProducts = () => {
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  
  // ✅ Scroll container ke liye ref
  const scrollContainerRef = useRef(null);

  // ✅ React Query se products fetch karo
  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useProducts({
    limit: 8,
    sort: "createdAt",
    order: "desc",
  });

  // ✅ Products ko flat karo
  const products = data?.pages.flatMap((page) => page.products) || [];

  // ✅ Agar error ho toh state set karo
  if (isError && !error) {
    setError(true);
  }

  // ✅ Scroll karne ke functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // ✅ Loading state with skeleton
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto w-full px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Trending Products</h2>
            <p className="text-gray-500 mt-1">Loading...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </section>
    );
  }

  // ✅ Error State with Retry
  if (isError) {
    return (
      <section className="max-w-7xl mx-auto w-full px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Trending Products</h2>
            <p className="text-gray-500 mt-1">Explore our best-selling collection</p>
          </div>
        </div>
        <div className="text-center py-10">
          <p className="text-red-500 text-lg mb-4">
            ⚠️ {queryError?.message || "Products are unavailable right now."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto w-full px-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Trending Products</h2>
          <p className="text-gray-500 mt-1">Explore our best-selling collection</p>
        </div>

        <button 
          onClick={() => navigate('/shop')} 
          className="hidden md:block border border-black px-6 py-3 rounded-xl hover:bg-black hover:text-white transition"
        >
          View All
        </button>
      </div>

      {/* Container relative rahega, arrows iske andar absolute honge */}
      <div className="relative py-4 px-2">
        
        {/* Arrows - mobile par hidden, desktop par visible */}
        <button 
          onClick={scrollLeft} 
          className="absolute top-1/2 left-0 -translate-y-1/2 z-10 hidden md:block hover:scale-110 transition"
          aria-label="Scroll left"
        >
          <BsArrowLeftCircleFill size={30} className="text-gray-700 hover:text-black" />
        </button>

        {/* Scroll container ko ref assign kiya */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-5 scroll-smooth"
        >
          {products.length > 0 ? (
            products.map((item) => (
              <div key={item._id} className="shrink-0">
                <ProductCard product={item} />
              </div>
            ))
          ) : (
            <p className="w-full text-center text-gray-500 col-span-full">
              No products available right now.
            </p>
          )}
        </div>

        {/* Right Arrow - mobile par hidden, desktop par visible */}
        <button 
          onClick={scrollRight} 
          className="absolute top-1/2 right-0 -translate-y-1/2 z-10 hidden md:block hover:scale-110 transition"
          aria-label="Scroll right"
        >
          <BsArrowRightCircleFill size={30} className="text-gray-700 hover:text-black" />
        </button>

      </div>
    </section>
  );
};

export default TrendingProducts;