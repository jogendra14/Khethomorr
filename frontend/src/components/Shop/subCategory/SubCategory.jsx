// components/Shop/subCategory/SubCategory.jsx
import { ChevronDown, ChevronRight } from "lucide-react";

export default function SubCategory({ 
  selectedCategory, 
  setSelectedSubCategory, 
  selectedSubCategory,
  className = "",
  variant = "default" // "default" or "inline"
}) {
  // Define sub-categories for each main category
  const subCategoriesMap = {
    fans: [
      { id: "all-fans", name: "All Fans" },
      { id: "classic", name: "Classic" },
      { id: "designer", name: "Designer" },
      { id: "bldc", name: "BLDC" },
      { id: "antique", name: "Antique" },
      { id: "chandelier", name: "Chandelier" },
    ],
    lighting: [
      { id: "all-lighting", name: "All Lighting" },
      { id: "led-bulbs", name: "LED Bulbs" },
      { id: "tube-lights", name: "Tube Lights" },
      { id: "panel-lights", name: "Panel Lights" },
      { id: "decorative", name: "Decorative Lights" },
    ],
    kitchenAppliance: [
      { id: "all-appliance", name: "All" },
      { id: "chimney", name: "Chimney" },
      { id: "waterPurifier", name: "Water Purifier" },
      { id: "cookTop", name: "CookTop" },
      { id: "hobs", name: "Hobs" },
      { id: "mixerGrinder", name: "Mixer Grinder" },
      { id: "vaccumCleaner", name: "Vaccum Cleaner" },
      { id: "riceCooker", name: "Rice Cooker" },
      { id: "steamIron", name: "Steam Iron" },
      { id: "iron", name: "Iron" },
    ],
    bathroomAppliance: [
      { id: "all-appliance", name: "All" },
      { id: "kitchen", name: "Kitchen" },
      { id: "laundry", name: "Laundry" },
      { id: "cooling", name: "Cooling" },
    ],
    electrical: [
      { id: "all-electrical", name: "All Electrical" },
      { id: "switches", name: "Switches" },
      { id: "wires", name: "Wires & Cables" },
      { id: "circuit-breakers", name: "Circuit Breakers" },
    ],
    solar: [
      { id: "all-solar", name: "All Solar" },
      { id: "panels", name: "Solar Panels" },
      { id: "inverters", name: "Inverters" },
      { id: "batteries", name: "Solar Batteries" },
    ],
  };

  // Get sub-categories for selected category
  const subCategories = subCategoriesMap[selectedCategory?.toLowerCase()] || [];

  if (subCategories.length === 0) return null;

  // Different styles based on variant
  if (variant === "inline") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {subCategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubCategory(sub.id)}
            className={`px-2.5 py-1 text-sm rounded-full transition-all duration-200 ${
              selectedSubCategory === sub.id
                ? "bg-blue-100 font-medium border border-blue-300"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
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