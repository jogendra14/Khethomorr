// components/Shop/category/Category.jsx
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import SubCategory from "../subCategory/SubCategory";


export default function Category({ 
  selectedCategory, 
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory 
}) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const categories = [
    { id: "all", name: "All", icon: "📋" },
    { id: "fans", name: "Fans", icon: "🌀" },
    { id: "lighting", name: "Lighting", icon: "💡" },
    { id: "appliance", name: "Appliance", icon: "🔌" },
    { id: "electrical", name: "Electrical", icon: "⚡" },
    { id: "solar", name: "Solar", icon: "☀️" },
    { id: "other", name: "Other", icon: "📦" },
  ];

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      // If same category clicked, toggle sub-categories
      setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    } else {
      // New category selected
      setSelectedCategory(categoryId);
      setExpandedCategory(categoryId);
      // Reset sub-category to "all" when changing main category
      setSelectedSubCategory(`all-${categoryId}`);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Categories */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
          {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`shrink-0 px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-1 ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
                <span className="mr-1">{category.icon}</span>
              {category.name}
              {category.id !== "all" && (
                <span className="ml-1">
                  {expandedCategory === category.id && selectedCategory === category.id ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sub-Categories - Using SubCategory component */}
        {selectedCategory !== "all" && expandedCategory === selectedCategory && (
          <div className="py-3 border-t border-gray-100">
            <SubCategory 
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              setSelectedSubCategory={setSelectedSubCategory}
              variant="inline"
              className=""
            />
          </div>
        )}
      </div>
    </div>
  );
}