// Category.jsx
export default function Category({ selectedCategory, setSelectedCategory }) {
  const categories = [
    { id: "all", label: "All" },
    { id: "fans", label: "Fans" },
    { id: "lighting", label: "Lighting" },
    { id: "appliance", label: "Appliance" },
    { id: "electrical", label: "Electrical" },
    { id: "solar", label: "Solar" },
    { id: "other", label: "Other" }
  ];

  return (
    <div className="flex gap-4 p-4 overflow-x-auto">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => setSelectedCategory(cat.id)}
          className={`px-4 py-2 rounded-lg transition ${
            selectedCategory === cat.id 
              ? "bg-blue-600 text-white" 
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}