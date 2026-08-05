import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getProduct } from "../api/productApi.js";
import ShowProduct from "../components/Shop/ShowProduct.jsx";
import Navbar from "../components/home/navbar/Navbar.jsx";
import Category from "../components/Shop/category/Category.jsx";
import Footer from "../components/home/footer/Footer.jsx";
import "../index.css";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

// ✅ ALAG COMPONENT BANAYA TAAKI useRef SAFE RAHE
const BrandScrollSection = ({ brand, products }) => {
  // ✅ useRef ab component ke top level par hai, loop ke andar nahi
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white mt-4 rounded-xl w-full">
      <div className="flex justify-between items-center pr-8  px-4">
        <h2 className="text-2xl font-bold text-gray-800 ">
          {brand}
          <span className="text-sm font-normal text-gray-500 ml-3">
            ({products.length} products)
          </span>
        </h2>
        <Link className="font-bold text-md lg:text-lg hover:text-red-600">View All</Link>
      </div>

      <div className="relative px-2 mt-8">
        
        {/* LEFT ARROW */}
        <button 
          onClick={scrollLeft} 
          className="absolute top-1/2 left-0 -translate-y-1/2 z-10 hidden md:block hover:scale-110 transition bg-white/50 rounded-full shadow-md"
        >
          <MdKeyboardArrowLeft size={30} className="text-gray-700 hover:text-black" />
        </button>
      
        {/* SCROLL CONTAINER */}
        <div 
          ref={scrollRef}
          className="flex gap-2 md:gap-3 lg:gap-4 overflow-x-auto hide-scrollbar overflow-y-hidden pb-4 px-2 scroll-smooth"
        >
          {products.map((product) => (
            <div key={product._id} className="min-w-44 max-w-50 lg:max-w-60 shrink-0">
              <ShowProduct product={product} />
            </div>
          ))}
        </div>
        
        {/* RIGHT ARROW */}
        <button 
          onClick={scrollRight} 
          className="absolute top-1/2 right-0 -translate-y-1/2 z-10 hidden md:block hover:scale-110 transition bg-white/50 rounded-full shadow-md"
        >
          <MdKeyboardArrowRight size={30} className="text-gray-700 hover:text-black" />
        </button>
      </div>
    </div>
  );
};

// ✅ MAIN COMPONENT
export default function Product() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all-fans");

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

  // FILTER LOGIC
  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== "all" && product.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    if (selectedSubCategory && !selectedSubCategory.startsWith('all-')) {
      const productSub = product.subCategory?.toLowerCase();
      const selectedSub = selectedSubCategory.toLowerCase();

      if (productSub !== selectedSub) {
        return false;
      }
    }

    return true;
  });

  // Group products by brand
  const groupProductsByBrand = (products) => {
    const grouped = {};
    products.forEach(product => {
      const brand = product.brand || "Unbranded";
      if (!grouped[brand]) {
        grouped[brand] = [];
      }
      grouped[brand].push(product);
    });
    return grouped;
  };

  const groupedProducts = groupProductsByBrand(filteredProducts);
  const brandNames = Object.keys(groupedProducts);

  const isSubCategorySelected = selectedSubCategory && !selectedSubCategory.startsWith(`all-`);

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
      
          {filteredProducts.length > 0 ? (
            isSubCategorySelected ? (
              <div className="space-y-8 w-full"> 
                {/* ✅ LOOP KE ANDAR AB COMPONENT CALL HO RAHA HAI, HOOK NAHI */}
                {brandNames.map((brand) => (
                  <BrandScrollSection 
                    key={brand} 
                    brand={brand} 
                    products={groupedProducts[brand]} 
                  />
                ))}
              </div>
            ) : (
              // Show all products in a grid when "All" subcategory is selected
              <div className="grid mt-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 w-full">
                {filteredProducts.map((product) => (
                  <ShowProduct key={product._id} product={product} />
                ))}
              </div>
            )
          ) : (
            <p className="text-center text-gray-500 py-10 w-full">
              No products found in this category.
            </p>
          )}

          {error && (
            <p className="w-full text-center text-gray-500 mt-4">
              Products are unavailable right now. Please try again shortly.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}