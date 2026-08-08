import { useState, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts.js"; // ✅ hooks/index.js se import
import ShowProduct from "../components/Shop/ShowProduct.jsx";
import Navbar from "../components/home/navbar/Navbar.jsx";
import Category from "../components/Shop/category/Category.jsx";
import Footer from "../components/home/footer/Footer.jsx";
import "../index.css";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

// ✅ BRAND SCROLL SECTION COMPONENT (Optimized)
const BrandScrollSection = ({ brand, products }) => {
  const scrollRef = useRef(null);

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  }, []);

  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  }, []);

  // ✅ Memoized product list
  const productList = useMemo(() => 
    products.map((product) => (
      <div key={product._id} className="min-w-44 max-w-50 lg:max-w-60 shrink-0">
        <ShowProduct product={product} />
      </div>
    )),
    [products]
  );

  return (
    <div className="bg-white mt-4 rounded-xl w-full">
      <div className="flex justify-between items-center pr-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {brand}
          <span className="text-sm font-normal text-gray-500 ml-3">
            ({products.length} products)
          </span>
        </h2>
        <Link 
          to={`/brand/${brand}`} 
          className="font-bold text-md lg:text-lg hover:text-red-600 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="relative px-2 mt-8">
        {/* LEFT ARROW */}
        <button
          onClick={scrollLeft}
          className="absolute top-1/2 left-0 -translate-y-1/2 z-10 hidden md:flex items-center justify-center hover:scale-110 transition bg-white/80 rounded-full shadow-md p-1"
          aria-label="Scroll left"
        >
          <MdKeyboardArrowLeft size={30} className="text-gray-700 hover:text-black" />
        </button>

        {/* SCROLL CONTAINER */}
        <div
          ref={scrollRef}
          className="flex gap-2 md:gap-3 lg:gap-4 overflow-x-auto hide-scrollbar overflow-y-hidden pb-4 px-2 scroll-smooth"
        >
          {productList}
        </div>

        {/* RIGHT ARROW */}
        <button
          onClick={scrollRight}
          className="absolute top-1/2 right-0 -translate-y-1/2 z-10 hidden md:flex items-center justify-center hover:scale-110 transition bg-white/80 rounded-full shadow-md p-1"
          aria-label="Scroll right"
        >
          <MdKeyboardArrowRight size={30} className="text-gray-700 hover:text-black" />
        </button>
      </div>
    </div>
  );
};

// ============================
// MAIN COMPONENT - SHOP
// ============================
export default function Shop() {  // ✅ Name changed from Product to Shop
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all-fans");

  // ✅ Using custom hook
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    refetch,
  } = useProducts({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    subCategory: selectedSubCategory && !selectedSubCategory.startsWith("all-") 
      ? selectedSubCategory 
      : undefined,
  });

  // ✅ Memoized products
  const products = useMemo(
    () => data?.pages.flatMap((page) => page.products) || [],
    [data]
  );

  // ✅ Load more handler with optimization
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ✅ Group products by brand (memoized)
  const groupedProducts = useMemo(() => {
    const grouped = {};
    products.forEach((product) => {
      const brand = product.brand || "Unbranded";
      if (!grouped[brand]) {
        grouped[brand] = [];
      }
      grouped[brand].push(product);
    });
    return grouped;
  }, [products]);

  const brandNames = useMemo(() => Object.keys(groupedProducts), [groupedProducts]);

  const isSubCategorySelected = selectedSubCategory && !selectedSubCategory.startsWith("all-");

  // ✅ Loading State with Skeleton (Better UX)
  if (isLoading) {
    return (
      <>
        <Navbar />
        <Category
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubCategory={selectedSubCategory}
          setSelectedSubCategory={setSelectedSubCategory}
        />
        <div className="min-h-screen max-w-7xl m-2 mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="mt-1 h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ✅ Error State with Retry
  if (isError) {
    return (
      <>
        <Navbar />
        <Category
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubCategory={selectedSubCategory}
          setSelectedSubCategory={setSelectedSubCategory}
        />
        <div className="min-h-screen flex flex-col items-center justify-center py-20">
          <p className="text-red-500 text-xl mb-4">
            ⚠️ {error?.message || "Products are unavailable right now."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Try Again
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <Category
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubCategory={selectedSubCategory}
        setSelectedSubCategory={setSelectedSubCategory}
      />

      <div className="min-h-screen">
        <div className="max-w-7xl m-2 mx-auto flex gap-2 sm:gap-3 md:gap-5 lg:gap-6">
          {products.length > 0 ? (
            <div className="w-full">
              {isSubCategorySelected ? (
                /* ============================
                   BRAND SECTIONS
                ============================ */
                <div className="space-y-8 w-full">
                  {brandNames.map((brand) => (
                    <BrandScrollSection
                      key={brand}
                      brand={brand}
                      products={groupedProducts[brand]}
                    />
                  ))}
                </div>
              ) : (
                /* ============================
                   ALL PRODUCTS GRID
                ============================ */
                <div className="grid mt-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 w-full">
                  {products.map((product) => (
                    <ShowProduct key={product._id} product={product} />
                  ))}
                </div>
              )}

              {/* ============================
                  LOAD MORE BUTTON
              ============================ */}
              {hasNextPage && (
                <div className="flex justify-center py-10">
                  <button
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                    className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Loading more...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </button>
                </div>
              )}

              {/* ============================
                  ALL PRODUCTS LOADED
              ============================ */}
              {!hasNextPage && products.length > 0 && (
                <p className="text-center text-gray-500 py-8">
                  🎉 All products loaded ({products.length} total)
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10 w-full">
              🔍 No products found in this category.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}