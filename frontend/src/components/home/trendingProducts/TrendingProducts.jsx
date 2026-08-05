import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { getProduct } from "../../../api/productApi.js";
import { useNavigate } from "react-router-dom";
import '../../../index.css';
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";


const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // ✅ getProduct() ab products array return karega
        const productsData = await getProduct();
        
        // ✅ Check if productsData is array
        if (!Array.isArray(productsData)) {
          console.error("Expected array but got:", productsData);
          setProducts([]);
          setError(true);
          return;
        }

        // Sort by createdAt (latest first)
        const sortedProducts = [...productsData].sort((a, b) => {
          const dateA = a.createdAt || a.updatedAt || 0;
          const dateB = b.createdAt || b.updatedAt || 0;
          return new Date(dateB) - new Date(dateA);
        });

        // Top 8 products
        setProducts(sortedProducts.slice(0, 8));
        
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Loading state
  if (loading) {
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

      <div className="border relative py-6 px-4 flex overflow-x-auto hide-scrollbar gap-4 md:gap-5">
        <BsArrowLeftCircleFill size={30} className="absolute top-1/2 left-4 "/>
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

        {error && (
          <p className="w-full text-center text-red-500 col-span-full">
            Products are unavailable right now. Please try again shortly.
          </p>
        )}
        <BsArrowRightCircleFill size={30} className="absolute top-1/2 right-4 "/>

      </div>
    </section>
  );
};

export default TrendingProducts;