import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function SubCateggory({ selectedCategory }) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const filterData = {
    Lighting: [
      {
        name: "Ceiling",
        subcategories: [
          "LED Bulbs",
          "Ceiling Lights",
          "Panel Lights",
          "Chandeliers",
        ],
      },
      {
        name: "Wall",
        subcategories: [
          "Wall Lights",
          "Picture Lights",
          "Decor Lights",
        ],
      },
      {
        name: "Table",
        subcategories: [
          "Study Lamps",
          "Table Lamps",
        ],
      },
    ],

    Fans: [
      {
        name: "Ceiling Fan",
        subcategories: [
          "1200 mm",
          "1400 mm",
          "BLDC Fan",
        ],
      },
      {
        name: "Table Fan",
        subcategories: [
          "12 Inch",
          "16 Inch",
        ],
      },
      {
        name: "Exhaust Fan",
        subcategories: [
          "Kitchen",
          "Bathroom",
        ],
      },
    ],

    Appliance: [
      {
        name: "Kitchen",
        subcategories: [
          "Mixer",
          "Microwave",
          "Oven",
        ],
      },
      {
        name: "Home",
        subcategories: [
          "Iron",
          "Heater",
          "Cooler",
        ],
      },
    ],

    Electrical: [
      {
        name: "Switch",
        subcategories: [
          "Anchor",
          "GM",
          "Havells",
        ],
      },
      {
        name: "Wire",
        subcategories: [
          "1 Sqmm",
          "1.5 Sqmm",
          "2.5 Sqmm",
        ],
      },
    ],

    Solar: [
      {
        name: "Panels",
        subcategories: [
          "Mono",
          "Poly",
        ],
      },
      {
        name: "Inverter",
        subcategories: [
          "1 KW",
          "3 KW",
          "5 KW",
        ],
      },
    ],

    Other: [
      {
        name: "Accessories",
        subcategories: [
          "Tools",
          "Spare Parts",
        ],
      },
    ],
  };

  const categories = filterData[selectedCategory] || [];

  const toggleCategory = (categoryName) => {
    setExpandedCategory(
      expandedCategory === categoryName ? null : categoryName
    );
  };

  // Jab koi category select na ho
  if (!selectedCategory) return null;

  return (
    <div className=" bg-white border-b border-r shadow-md p-2 md:p-4 ">
      <h2 className="text-md md:text-lg font-bold mb-3">
        Categories
      </h2>
      
      {categories.map((category) => (
        <div key={category.name}>
          {/* Main Category Button */}
          <button
            onClick={() => toggleCategory(category.name)}
                className=" my-2 md:my-3 lg:my-4 w-24 sm:w-35 md:w-43 lg:w-54 flex items-center justify-between mx-1.5 md:ml-2 lg:ml-4 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <span className="text-gray-700 text-[13px] md:text-md lg:text-[16px]">
                  {category.name}
                </span>

                <ChevronDown
                  className={`text-gray-600 size-3.5 md:size-4 lg:size-5 transition-transform duration-300 
                    ${expandedCategory === category.name ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Subcategories - Collapsible */}
              {expandedCategory === category.name && (
                <div className="text-[11px] md:text-sm lg:text-md ml-1.5 md:ml-2.5 lg:ml-4 border-l-2 border-gray-200">
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      className="block w-full text-left ml-1.5 md:ml-2.5 lg:ml-4 my-2 lg:my-3  text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
  );
}
