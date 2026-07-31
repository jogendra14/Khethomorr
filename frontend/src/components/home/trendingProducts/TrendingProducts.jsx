import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { getProduct } from "../../../api/productApi.js";
import { useNavigate } from "react-router-dom"; // Import for View All button
import '../../../index.css';

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);
   const navigate = useNavigate(); // For navigation

  useEffect(() => {
    const fetchProducts = async () => {
       try {
        const data = await getProduct();
        
        // 1. Created Date ke hisaab se sort karein (Latest sabse pehle)
        const sortedProducts = [...data].sort((a, b) => {
          return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt);
        });

        // 2. Sirf top 6 latest products dikhayein (taaki UI overcrowd na ho)
        setProducts(sortedProducts.slice(0, 8));         
      } 
      catch (error) {
        console.error("Error fetching products:", error);
        setError(true);
      }
    };
  fetchProducts();
  }, []);

  return (
    <section className="max-w-7xl mx-auto w-full px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Trending Products
          </h2>
          <p className="text-gray-500 mt-1">
            Explore our best-selling collection
          </p>
        </div>

         {/* View All button ko functional banaya hai */}
        <button 
          onClick={() => navigate('/shop')} 
          className="hidden md:block border border-black px-6 py-3 rounded-xl hover:bg-black hover:text-white transition"
        >
          View All
        </button>
      </div>

       {/* --- Grid Layout use kiya hai, flex overflow-x-auto se better hai --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((item) => (
          <div key={item._id} className="w-full">
            <ProductCard product={item} />
          </div>
        ))}

        {error && (
          <p className="w-full text-center text-gray-500">
            Products are unavailable right now. Please try again shortly.
          </p>
        )}
      </div>
    </section>
  );
};

export default TrendingProducts;
