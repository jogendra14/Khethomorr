import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { getProducts } from "../../../api/productApi.js";

const TrendingProducts = () => {

  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);

   useEffect(() => {
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
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

        <button className="hidden md:block border border-black px-6 py-3 rounded-xl hover:bg-black hover:text-white transition">
          View All
        </button>

      </div>

      {/*<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">*/}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2  w-full">
        {products.map((item) => (
          <div key={item._id} className=" flex shrink-0 w-45 sm:w-50 md:w-55 lg:w-60">
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
