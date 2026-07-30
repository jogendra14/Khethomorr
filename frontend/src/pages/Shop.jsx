import { useState, useEffect } from "react";
import { getProduct } from "../api/productApi.js";
import ShowProduct from "../components/Shop/ShowProduct.jsx";
import Navbar from "../components/home/navbar/Navbar.jsx";
import Category from "../components/Shop/category/Category.jsx";
//import SubCategory from "../components/Shop/subCategory/SubCategory.jsx";
import Footer from "../components/home/footer/Footer.jsx";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    const fetchProducts = async () => {
        try {
          const data = await getProduct();

          setProducts(data);
        } catch (error) {
          console.error("Error fetching products:", error);
          setError(true);
        }
      };
      fetchProducts();
    }, []);
    
  const [selectedCategory, setSelectedCategory] = useState(null);
  return (
    <>
      <Navbar />
      <Category selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-7xl m-2 mx-auto flex gap-2 sm:gap-3 md:gap-5 lg:gap-6">
          {/*<div>
            <SubCategory selectedCategory={selectedCategory} />
          </div>*/}

          <div className="grid grid-cols-2 p-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2 md:gap-3">
            {/* </div><div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-7"> */}
            {products.map((product) => (
              <ShowProduct key={product._id} product={product} />
            ))}
          </div>
          {error && (
            <p className="w-full text-center text-gray-500">
              Products are unavailable right now. Please try again shortly.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
