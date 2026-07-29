import { FaLightbulb, FaFan, FaCouch, FaBolt, FaSolarPanel, FaBath } from "react-icons/fa";

const categories = [
  {
    title: "Lighting",
    icon: <FaLightbulb size={25} />,
    color: "bg-yellow-100",
  },
  {
    title: "Fans",
    icon: <FaFan size={25} />,
    color: "bg-blue-100",
  },
  {
    title: "Appliance",
    icon: <FaCouch size={25} />,
    color: "bg-pink-100",
  },
  {
    title: "Electrical",
    icon: <FaBolt size={25} />,
    color: "bg-orange-100",
  },
  {
    title: "Solar",
    icon: <FaSolarPanel size={25} />,
    color: "bg-green-100",
  },
  {
    title: "Other",
    icon: <FaBath size={25} />,
    color: "bg-cyan-100",
  },
];

const Category = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <section className="max-w-7xl mx-auto px-3 py-1">
      {/* Cards */}
      <div className="flex gap-5 overflow-x-auto hide-scrollbar p-2">

        {categories.map((item, index) => (
          <div 
            key={index} 
            onClick={() => setSelectedCategory(item.title)}
            className="group cursor-pointer shrink-0"
          >
            <div
              className={`${item.color} rounded-xl p-3 md:p-4 flex justify-center items-center transition duration-300 group-hover:scale-105 group-hover:shadow-xl 
                ${
                  selectedCategory === item.title
                      ? "ring-2 ring-red-500 shadow-lg scale-105"
                      : ""
              }`}
            >
              {item.icon}
            </div>

            <h3 className={`text-center font-semibold text-sm md:text-lg 
                mt-1 group-hover:text-red-600 transition
                ${
                  selectedCategory === item.title
                  ? "text-red-600"
                  : "group-hover:text-red-600"
                }`}
            >
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Category;
