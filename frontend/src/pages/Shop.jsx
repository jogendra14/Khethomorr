import { useState, useEffect } from "react";
import { getProduct } from "../api/productApi.js";
import ShowProduct from "../components/Shop/ShowProduct.jsx";
import Navbar from "../components/home/navbar/Navbar.jsx";
import Category from "../components/Shop/category/Category.jsx";
import Footer from "../components/home/footer/Footer.jsx";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all"); // 🔥 "all" default
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

  // FILTER LOGIC - Filter by category and sub-category
  const filteredProducts = products.filter((product) => {
    // 1. Main category filter (Convert both to lowercase for case-insensitive matching)
    if (selectedCategory !== "all" && product.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // 2. Sub-category filter (Direct exact match)
    if (selectedSubCategory && !selectedSubCategory.startsWith('all-')) {
      // Check if the product's subCategory matches the selected ID directly
      // (Assuming your database uses the same IDs like "classic", "designer", "bldc")
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
      const brand = product.brand || "Unbranded"; // fallback if brand is missing
      if (!grouped[brand]) {
        grouped[brand] = [];
      }
      grouped[brand].push(product);
    });
    return grouped;
  };

  const groupedProducts = groupProductsByBrand(filteredProducts);
  const brandNames = Object.keys(groupedProducts);

  // Check if we're on a specific subcategory (not "all")
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
              // Show products grouped by brand when subcategory is selected
              <div className="space-y-8">
                {brandNames.map((brand) => (
                  <div key={brand} className="bg-white mt-2 rounded-xl p-4">
                    {/* Brand Name Header */}
                    <h2 className="text-2xl font-bold text-gray-800  pb-3 mb-4">
                      {brand}
                      <span className="text-sm font-normal text-gray-500 ml-3">
                        ({groupedProducts[brand].length} products)
                      </span>
                    </h2>
                    
                    {/* Products Grid for this brand */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {groupedProducts[brand].map((product) => (
                        <ShowProduct key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show all products in a grid when "All" subcategory is selected
              <div className="grid mt-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5  gap-2 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ShowProduct key={product._id} product={product} />
                ))}
              </div>
            )
          ) : (
            <p className="text-center text-gray-500 py-10">
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