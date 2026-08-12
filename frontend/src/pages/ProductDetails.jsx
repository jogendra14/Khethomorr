import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/home/navbar/Navbar";
import ProductGallery from "../components/Shop/productGallery/ProductGallery";
import ProductInfo from "../components/Shop/ProductInfo";
import ReviewSection from "../components/Shop/ReviewSection";
import RelatedProducts from "../components/Shop/RelatedProducts";
import SimilarProducts from "../components/Shop/SimilarProducts";
import Footer from "../components/home/footer/Footer";
import { useProduct } from "../hooks/useProducts"; // ✅ Single product hook

export default function ProductDetails() {
  const { id } = useParams();

  // ✅ Auto scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // ✅ Fetch single product details using useProduct(id)
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);

  // Category name calculation for Breadcrumb
  const categoryName = typeof product?.category === "object"
    ? product.category?.name
    : product?.category || "Products";

  // ✅ Loading State (Skeleton Loader)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8 w-full grow">
          {/* Breadcrumb Skeleton */}
          <div className="h-5 w-64 bg-gray-200 animate-pulse rounded mb-6"></div>

          {/* Grid Skeleton */}
          <div className="grid lg:grid-cols-2 gap-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {/* Gallery Skeleton */}
            <div className="space-y-4">
              <div className="bg-gray-200 animate-pulse h-96 w-full rounded-2xl"></div>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-200 animate-pulse h-20 w-20 rounded-xl"></div>
                ))}
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="space-y-5">
              <div className="bg-gray-200 animate-pulse h-8 w-3/4 rounded-lg"></div>
              <div className="bg-gray-200 animate-pulse h-5 w-1/3 rounded-md"></div>
              <div className="bg-gray-200 animate-pulse h-10 w-1/2 rounded-lg"></div>
              <div className="bg-gray-200 animate-pulse h-28 w-full rounded-xl"></div>
              <div className="flex gap-4 pt-4">
                <div className="bg-gray-200 animate-pulse h-12 w-1/2 rounded-xl"></div>
                <div className="bg-gray-200 animate-pulse h-12 w-1/2 rounded-xl"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ✅ Error State
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-20 text-center grow flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 max-w-md w-full">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Product</h2>
            <p className="text-gray-500 mb-6">{error?.message || "Product details could not be retrieved."}</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-black text-white font-semibold rounded-xl hover:bg-red-600 transition-colors shadow-md active:scale-95"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ✅ Product Not Found State
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-20 text-center grow flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 max-w-md w-full">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-500 mb-6">The product you are looking for does not exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="grow">
        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3 text-xs md:text-sm text-gray-500 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <span>Home</span>
            <span>/</span>
            <span className="capitalize">{categoryName}</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold truncate">{product.name}</span>
          </div>
        </div>

        {/* Product Core Details (Gallery + Info) */}
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <ProductGallery product={product} />
              <ProductInfo product={product} />
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
            <ReviewSection product={product} />
          </div>
        </div>

        {/* Subcategory Based: Similar Products */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <SimilarProducts product={product} />
        </div>

        {/* Category Based: Related Products */}
        <div className="max-w-7xl mx-auto px-4 py-6 pb-12">
          <RelatedProducts product={product} />
        </div>
      </main>

      <Footer />
    </div>
  );
}