import Navbar from "../components/home/navbar/Navbar";
import ProductGallery from "../components/Shop/productGallery/ProductGallery";
import ProductInfo from "../components/Shop/ProductInfo";
import ReviewSection from "../components/Shop/ReviewSection";
import RelatedProducts from "../components/Shop/RelatedProducts";
import Footer from "../components/home/footer/Footer";
import { IoShieldCheckmarkOutline } from "react-icons/io5";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../api/productApi";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <h2 className="text-center py-20">Loading...</h2>;
  }
  

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-5 text-sm text-gray-500">
          Home
          <span className="mx-2">/</span>
          Jackets
          <span className="mx-2">/</span>
          <span className="text-black font-medium">Windbreaker Jacket</span>
        </div>

        {/* Product */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10">
            <ProductGallery product={product} />

            <ProductInfo product={product} />
          </div>
        </div>

        {/* Reviews */}
        <div className="max-w-7xl mx-auto px-6 mt-0">
          <ReviewSection />
        </div>

        {/* Related Products */}

        <div className="max-w-7xl mx-auto px-6 ">
          <RelatedProducts />
        </div>
      </div>
      <Footer />
    </>
  );
}
