import Navbar from "../components/home/navbar/Navbar";
import ProductGallery from "../components/Shop/productGallery/ProductGallery";
import ProductInfo from "../components/Shop/ProductInfo";
import ReviewSection from "../components/Shop/ReviewSection";
import RelatedProducts from "../components/Shop/RelatedProducts";
import SimilarProduct from "../components/Shop/SimilarProducts.jsx";
import Footer from "../components/home/footer/Footer";

import { useParams } from "react-router-dom";
import { useProduct } from "../hooks"; // ✅ React Query hook import

export default function ProductDetails() {
  const { id } = useParams();
  
  // ✅ React Query se product fetch karo
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);

  // ✅ Loading State
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen">
          <div className="max-w-7xl mx-auto px-3 py-20">
            <div className="grid lg:grid-cols-2 gap-10">
              {/* Skeleton for Gallery */}
              <div className="animate-pulse">
                <div className="bg-gray-200 h-96 rounded-lg"></div>
                <div className="flex gap-2 mt-4">
                  <div className="bg-gray-200 h-20 w-20 rounded"></div>
                  <div className="bg-gray-200 h-20 w-20 rounded"></div>
                  <div className="bg-gray-200 h-20 w-20 rounded"></div>
                </div>
              </div>
              
              {/* Skeleton for Info */}
              <div className="animate-pulse space-y-4">
                <div className="bg-gray-200 h-8 w-3/4 rounded"></div>
                <div className="bg-gray-200 h-6 w-1/2 rounded"></div>
                <div className="bg-gray-200 h-24 w-full rounded"></div>
                <div className="bg-gray-200 h-10 w-1/3 rounded"></div>
                <div className="bg-gray-200 h-12 w-full rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ✅ Error State
  if (isError) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen flex flex-col items-center justify-center py-20">
          <p className="text-red-500 text-xl mb-4">
            ⚠️ {error?.message || "Product not found!"}
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

  // ✅ Agar product nahi mila
  if (!product) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen flex items-center justify-center py-20">
          <p className="text-gray-500 text-xl">Product not found</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-3 py-5 text-sm text-gray-500">
          Home
          <span className="mx-2">/</span>
          {product?.category || "Products"}
          <span className="mx-2">/</span>
          <span className="text-black font-medium">{product?.name || "Product"}</span>
        </div>

        {/* Product */}
        <div className="max-w-7xl mx-auto px-3">
          <div className="grid lg:grid-cols-2 gap-10">
            <ProductGallery product={product} />
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Reviews */}
        <div className="max-w-7xl mx-auto px-3 mt-8 lg:mt-0">
          <ReviewSection product={product} />
        </div>

        {/* Similar or Related Products */}
        <div className="max-w-7xl mx-auto px-3">
          <SimilarProduct product={product} />
        </div>
        <div className="max-w-7xl mx-auto px-3">
          <RelatedProducts product={product} />
        </div>
      </div>
      <Footer />
    </>
  );
}