import { FaHeart, FaStar } from "react-icons/fa";
import "../../index.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProduct } from "../../api/productApi";

export default function SimilarProducts({ product }) {
  const [allProducts, setAllProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);

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
  }, []);

  // Filter similar products based on category and subcategory
  const filterSimilarProducts = () => {
    if (!product || !allProducts.length) return;

    // FIX 1: Use "p" as the variable name inside the filter to avoid shadowing the outer "product"
    const filtered = allProducts.filter((p) => 
      p._id !== product._id && // Exclude current product
      p.category === product.category &&
      p.subCategory === product.subCategory
    );

    setSimilarProducts(filtered);
  };

  useEffect(() => {
    if (allProducts.length > 0 && product) {
      filterSimilarProducts();
    }
  }, [allProducts, product]);

  // If no similar products found, show a message
  if (similarProducts.length === 0) {
    return (
      <section className="mt-10">
        <div className="flex justify-between products-center mb-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold">Similar Products</h2>
            <p className="text-gray-500 text-sm lg:text-lg mt-1">No similar products found in this category.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      {/* Heading */}
      <div className="flex justify-between products-center mb-4">
        <div className="">
          <h2 className="text-2xl lg:text-3xl font-bold">Similar Products</h2>
          <p className="text-gray-500 text-sm lg:text-lg mt-1">Explore similar products selected for you.</p>
        </div>
        <Link className="hidden md:block text-lg font-semibold px-4 rounded-lg hover:text-red-800 transition duration-200">View All</Link>
      </div>

      {/* Cards */}
      <div className="flex gap-2 py-3 overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory">
        {/* FIX 2: Use product.id instead of index as the key */}
        {similarProducts.map((productItem) => (
          <div key={productItem._id} className="group bg-white shadow-lg hove:shadow-lg transition-transform duration-300">
            
            {/* Image */}
            <Link className=" snap-start">
              <div className="relative overflow-hidden">
                {/* FIX 3: Added a fallback in case images is null/undefined */}
                <img 
                  src={productItem.images?.[0] || "https://via.placeholder.com/300"} 
                  alt="ProductImage"
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                />

                <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-red-500 hover:text-white transition">
                  <FaHeart />
                </button>
              </div>
            </Link>

            {/* Content */}
            <div className="p-2">
              <h3 className="text-lg font-bold mt-0 line-clamp-1">{productItem.name}</h3>
              
              <div className="flex products-center gap-2">
                <FaStar className="text-yellow-400" />
                <span className="font-medium">{productItem.rating}</span>
              </div>

              <div className="flex justify-between products-center gap-14 mt-3">
                <span className="text-2xl font-bold text-green-700">₹{productItem.newPrice}</span>

                <Link className="bg-black text-white px-5 py-1.5 rounded-lg hover:bg-red-600 text-semibold transition">Buy</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}