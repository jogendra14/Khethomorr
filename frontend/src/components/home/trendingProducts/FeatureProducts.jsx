import { useState, useRef, useMemo } from "react";
import { useFeaturedProducts, useProducts } from "../../../hooks/useProducts";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";
import '../../../index.css';
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";

const FeatureProducts = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // ✅ Fetch Featured Products from backend API
  const {
    data: featuredData,
    isLoading: isFeaturedLoading,
    isError: isFeaturedError,
    error: featuredError,
    refetch: refetchFeatured,
  } = useFeaturedProducts(10);

  // ✅ Fallback to general products if no featured products are found in DB
  const {
    data: generalData,
    isLoading: isGeneralLoading,
    isError: isGeneralError,
    refetch: refetchGeneral,
  } = useProducts({
    limit: 10,
    sort: "createdAt",
    order: "desc",
  });

  // ✅ Safely parse products array
  const products = useMemo(() => {
    // 1. Try featured products response
    let featuredList = [];
    if (featuredData) {
      if (Array.isArray(featuredData.data)) featuredList = featuredData.data;
      else if (Array.isArray(featuredData)) featuredList = featuredData;
    }

    if (featuredList.length > 0) {
      return featuredList;
    }

    // 2. Fallback to general products
    if (generalData) {
      if (Array.isArray(generalData.data)) return generalData.data;
      if (Array.isArray(generalData)) return generalData;
      if (generalData.pages) return generalData.pages.flatMap((page) => page.products || page.data || []);
    }

    return [];
  }, [featuredData, generalData]);

  const isLoading = isFeaturedLoading || isGeneralLoading;
  const isError = isFeaturedError && isGeneralError;

  // ✅ Scroll handlers
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

  // ✅ Loading Skeleton
  if (isLoading && products.length === 0) {
    return (
      <section className="max-w-7xl mx-auto w-full px-4 my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500 mt-1">Loading featured collection...</p>
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-60 h-72 bg-gray-200 animate-pulse rounded-lg shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  // ✅ Error State
  if (isError && products.length === 0) {
    return (
      <section className="max-w-7xl mx-auto w-full px-4 my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500 mt-1">Explore our handpicked collection</p>
          </div>
        </div>
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-red-500 text-lg mb-4">
            ⚠️ {featuredError?.message || "Featured products are unavailable right now."}
          </p>
          <button
            onClick={() => {
              refetchFeatured();
              refetchGeneral();
            }}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto w-full px-4 my-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Explore our specially featured & top-rated products
          </p>
        </div>

        <button 
          onClick={() => navigate('/shop')} 
          className="hidden md:block border border-gray-900 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-black hover:text-white transition-colors"
        >
          View All
        </button>
      </div>

      {/* Carousel Container */}
      <div className="relative py-2">
        {/* Left Arrow */}
        {products.length > 0 && (
          <button 
            onClick={scrollLeft} 
            className="absolute top-1/2 -left-4 -translate-y-1/2 z-10 hidden md:flex items-center justify-center bg-white/90 rounded-full shadow-lg hover:scale-110 transition cursor-pointer"
            aria-label="Scroll left"
          >
            <BsArrowLeftCircleFill size={32} className="text-gray-200 hover:text-gray-500" />
          </button>
        )}

        {/* Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-5 scroll-smooth py-2 px-1"
        >
          {products.length > 0 ? (
            products.map((item) => (
              <div key={item._id} className="shrink-0">
                <ProductCard product={item} />
              </div>
            ))
          ) : (
            <div className="w-full text-center text-gray-500 py-8 bg-gray-50 rounded-xl">
              No featured products available right now.
            </div>
          )}
        </div>

        {/* Right Arrow */}
        {products.length > 0 && (
          <button 
            onClick={scrollRight} 
            className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 hidden md:flex items-center justify-center bg-white/90 rounded-full shadow-lg  hover:scale-110 transition cursor-pointer"
            aria-label="Scroll right"
          >
            <BsArrowRightCircleFill size={32} className="text-gray-200 hover:text-gray-500" />
          </button>
        )}
      </div>
    </section>
  );
};

export default FeatureProducts;