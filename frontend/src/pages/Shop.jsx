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
    // Main category filter
    if (selectedCategory !== "all" && product.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // Sub-category filter
    if (selectedSubCategory && selectedSubCategory !== `all-${selectedCategory}`) {
      // Map sub-category IDs to search keywords
      const subCategoryMap = {
        "ceiling-fans": ["ceiling", "ceiling fan"],
        "table-fans": ["table", "table fan"],
        "pedestal-fans": ["pedestal", "stand fan", "floor fan"],
        "exhaust-fans": ["exhaust", "ventilation"],
        "smart-fans": ["smart", "wifi", "bluetooth", "remote"],
        "led-bulbs": ["led bulb", "led light"],
        "tube-lights": ["tube light", "fluorescent"],
        "panel-lights": ["panel light", "ceiling panel"],
        "decorative": ["decorative", "decoration", "string light"],
        "kitchen": ["kitchen", "mixer", "grinder", "juicer"],
        "laundry": ["washing", "dryer", "laundry"],
        "cooling": ["cooler", "air conditioner", "ac"],
        "switches": ["switch", "socket"],
        "wires": ["wire", "cable", "extension"],
        "circuit-breakers": ["breaker", "mcb", "rccb"],
        "panels": ["solar panel", "panel"],
        "inverters": ["inverter", "solar inverter"],
        "batteries": ["battery", "solar battery"],
      };

        const keywords = subCategoryMap[selectedSubCategory] || [];
      if (keywords.length > 0) {
        return keywords.some(keyword => 
          product.name?.toLowerCase().includes(keyword) ||
          product.description?.toLowerCase().includes(keyword)
        );
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

      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-7xl m-2 mx-auto flex gap-2 sm:gap-3 md:gap-5 lg:gap-6">
      
            {filteredProducts.length > 0 ? (
            isSubCategorySelected ? (
              // Show products grouped by brand when subcategory is selected
              <div className="space-y-8">
                {brandNames.map((brand) => (
                  <div key={brand} className="bg-white rounded-xl shadow-lg p-4">
                    {/* Brand Name Header */}
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-3 mb-4">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
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