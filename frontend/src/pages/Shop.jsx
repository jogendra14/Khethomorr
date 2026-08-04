import { useState, useEffect } from "react";
import {Link} from "react-router-dom"
import { getProduct } from "../api/productApi.js";
import ShowProduct from "../components/Shop/ShowProduct.jsx";
import Navbar from "../components/home/navbar/Navbar.jsx";
import Category from "../components/Shop/category/Category.jsx";
import Footer from "../components/home/footer/Footer.jsx";
import "../index.css"

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
              // 🔥 FIXED: Products grouped by brand with horizontal scroll
              <div className="space-y-8 w-full"> {/* Added w-full */}
                {brandNames.map((brand) => (
                  <div key={brand} className="bg-white mt-4 rounded-xl w-full"> {/* Added w-full */}

                  <div className="flex justify-between  pr-8">
                    {/* Brand Name Header */}
                    <h2 className="text-2xl font-bold text-gray-800 pb-3 mb-4">
                      {brand}
                      <span className="text-sm font-normal text-gray-500 ml-3">
                        ({groupedProducts[brand].length} products)
                      </span>
                    </h2>
                    <Link className="font-bold text-md lg:text-lg hover:text-red-600">View All</Link>
                    </div>
                    
                    {/* 🔥 FIXED: Products Grid for this brand */}
                    <div className="flex gap-2 md:gap-3 lg:gap-4 overflow-x-auto hide-scrollbar overflow-y-hidden pb-4 px-2">
                      {groupedProducts[brand].map((product) => (
                        // 🔥 FIXED: Removed shrink-0 and added proper sizing
                        <div key={product._id} className="min-w-50 max-w-62.5 shrink-0">
                          <ShowProduct product={product} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show all products in a grid when "All" subcategory is selected
              <div className="grid mt-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 w-full"> {/* Added w-full */}
                {filteredProducts.map((product) => (
                  <ShowProduct key={product._id} product={product} />
                ))}
              </div>
            )
          ) : (
            <p className="text-center text-gray-500 py-10 w-full"> {/* Added w-full */}
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