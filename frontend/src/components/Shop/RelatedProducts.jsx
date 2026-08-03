import { FaHeart, FaStar } from "react-icons/fa";
import "../../index.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProduct } from "../../api/productApi";

export default function RelatedProducts() {
  const [ allProducts, setAllProducts ] = useState([]);

   // Fetch all products
    const fetchProduct = async () => {
      try {
        const response = await getProduct();
  
        if (Array.isArray(response)) {
          setAllProducts(response);
        } else if (response && typeof response === "object") {
          setAllProducts([response]);
        } else {
          console.error("Unexpected API response format:", response);
          setAllProducts([]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setAllProducts([]);
      }
    };

    useEffect(() => {
      fetchProduct();
    },[]);

  return (
    <section className="max-w-7xl mx-auto mt-8">
      {/* Heading */}
      <div className="flex justify-between products-center  mb-4">
        <div className="">
          <h2 className="text-2xl lg:text-3xl font-bold">You May Also Like</h2>
          <p className="text-gray-500 text-sm lg:text-lg mt-1">Explore Best products.</p>
        </div>
        <Link className="hidden md:block font-semibold text-lg px-4 rounded-lg hover:text-red-800 transition duration-200">View All</Link>
      </div>

      {/* Cards */}
      <div className="flex gap-2 py-3 overflow-x-auto hide-scrollbar scroll-smooth ">
        {allProducts.map((product) => (
          <div key={product._id} className="group rounded-sm bg-white shadow-md hove:shadow-lg transition-transform duration-300">
            
            {/* Image */}
            <Link className="">
              <div className="relative overflow-hidden w-50">
              <img src={product.images?.[0]} 
                alt="productImage" 
                className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />

              <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-red-500 hover:text-white transition">
                <FaHeart />
              </button>
              </div>
            </Link>

            {/* Content */}

            <div className="p-2">
              <h3 className="text-lg font-bold mt-0 line-clamp-1">{product.name}</h3>
              
              <div className="flex gap-2 ">
                <FaStar className="self-center text-yellow-400" />
                <span className="self-center">{product.rating}</span>
              </div>

              <div className="flex justify-between mt-3">
                <span className="text-2xl self-end font-bold text-green-700">₹{product.newPrice}</span>

                <Link to="/checkout"
                className="bg-black text-white px-5 py-1.5 rounded-lg hover:bg-red-600 text-semibold transition">Buy</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
