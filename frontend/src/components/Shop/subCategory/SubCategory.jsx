export default function SubCategory({ 
  selectedCategory, 
  setSelectedSubCategory, 
  selectedSubCategory,
  categories = [],
  className = "",
  variant = "default" // "default" or "inline"
}) {
  // ✅ Find the active selected category object from dynamic categories
  const currentCategory = categories.find(
    (c) => c.id === selectedCategory || c._id === selectedCategory || c.slug === selectedCategory
  );

  const rawSubCategories = currentCategory?.subcategories || [];

  // If no subcategories exist for this category, return null
  if (rawSubCategories.length === 0) return null;

  // ✅ Build dynamic subcategories list with "All [Category]" option
  const subCategories = [
    {
      id: `all-${selectedCategory}`,
      _id: `all-${selectedCategory}`,
      name: `All ${currentCategory?.name || ""}`,
    },
    ...rawSubCategories.map((sub) => ({
      id: sub._id,
      _id: sub._id,
      name: sub.name,
      slug: sub.slug,
    })),
  ];

  // Inline variant
  if (variant === "inline") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {subCategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubCategory(sub.id)}
            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
              selectedSubCategory === sub.id
                ? "bg-blue-600 text-white font-medium shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>
    );
  }

  // Default variant - Card style
  return (
    <div className={`bg-white rounded-xl shadow p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Sub-Categories
      </h3>
      <div className="flex flex-wrap gap-2">
        {subCategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubCategory(sub.id)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              selectedSubCategory === sub.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>
    </div>
  );
}