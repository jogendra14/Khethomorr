import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import SubCategory from "../subCategory/SubCategory";
import { useCategories } from "../../../hooks/useCategories.js";

const categoryIcons = {
  all: "📋",
  fans: "🌀",
  lighting: "💡",
  kitchenappliance: "🔌",
  kitchen: "🔌",
  bathroomappliance: "🔌",
  bathroom: "🔌",
  electrical: "⚡",
  solar: "☀️",
  other: "📦",
};

export default function Category({ 
  selectedCategory, 
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory 
}) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  // ✅ Fetch categories dynamically from backend
  const { data: categoriesResponse, isLoading } = useCategories();
  const backendCategories = categoriesResponse?.data || [];

  // ✅ Construct dynamic categories list (with 'All' tab)
  const categories = [
    { id: "all", _id: "all", name: "All", icon: "📋", subcategories: [] },
    ...backendCategories.map((cat) => {
      const cleanSlug = (cat.slug || cat.name || "").toLowerCase().replace(/[^a-z]/g, "");
      return {
        id: cat._id,
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || categoryIcons[cleanSlug] || "📦",
        subcategories: cat.subcategories || [],
      };
    }),
  ];

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      // If same category clicked, toggle sub-categories collapse
      setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    } else {
      // New category selected
      setSelectedCategory(categoryId);
      setExpandedCategory(categoryId);
      // Reset sub-category to "all" when changing main category
      setSelectedSubCategory(categoryId === "all" ? "all" : `all-${categoryId}`);
    }
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Categories */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide">
          {isLoading ? (
            <div className="flex items-center gap-2 py-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-24 bg-gray-200 animate-pulse rounded-full" />
              ))}
            </div>
          ) : (
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1 text-sm font-medium ${
                  selectedCategory === category.id
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
                {category.id !== "all" && category.subcategories && category.subcategories.length > 0 && (
                  <span className="ml-1">
                    {expandedCategory === category.id && selectedCategory === category.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Sub-Categories - Using SubCategory component */}
        {selectedCategory !== "all" && expandedCategory === selectedCategory && (
          <div className="py-2 border-t border-gray-100">
            <SubCategory 
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              setSelectedSubCategory={setSelectedSubCategory}
              categories={categories}
              variant="inline"
              className=""
            />
          </div>
        )}
      </div>
    </div>
  );
}