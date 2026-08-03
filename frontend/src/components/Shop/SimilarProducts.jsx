import { FaHeart, FaStar } from "react-icons/fa";
import "../../index.css";
import { Link } from "react-router-dom";
const products = [
  {
    id: 1,
    name: "Trail Windbreaker",
    category: "Jacket",
    price: "$129",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600",
  },
  {
    id: 2,
    name: "Winter Hoodie",
    category: "Hoodie",
    price: "$99",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
  },
  {
    id: 3,
    name: "Classic T-Shirt",
    category: "T-Shirt",
    price: "$59",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=600",
  },
  {
    id: 4,
    name: "Outdoor Sweatshirt",
    category: "Sweatshirt",
    price: "$149",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600",
  },
  {
    id: 5,
    name: "Outdoor Sweatshirt",
    category: "fgjfjf",
    price: "$149",
    rating: 3.9,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600",
  },
  {
    id: 6,
    name: "Outdoor Sweatshirt",
    category: "fjfgjhf",
    price: "$149",
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600",
  },
];

export default function SimilarProducts() {
  return (
    <section className="mt-10">
      {/* Heading */}
      <div className="flex justify-between items-center  mb-4">
        <div className="">
          <h2 className="text-2xl lg:text-3xl font-bold">Similar Products</h2>
          <p className="text-gray-500 text-sm lg:text-lg mt-1">Explore similar products selected for you.</p>
        </div>
        <button className="hidden md:block border px-4 py-2 rounded-lg hover:bg-black hover:text-white transition">View All</button>
      </div>

      {/* Cards */}
      <div className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory">
        {products.map((item) => (
          <div key={item.id} className=" relative bg-white shadow-lg">
            
            {/* Image */}
            <Link className=" shrink-0 snap-start">
              <img src={item.image} alt={item.name} className="w-78 h-48 object-cover shodow-md hover:scale-105" />

              <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-red-500 hover:text-white transition">
                <FaHeart />
              </button>
            </Link>

            {/* Content */}

            <div className="p-2">
              <h3 className="text-lg font-bold mt-0">{item.name}</h3>
              <div className="flex items-center gap-2 ">
                <FaStar className="text-yellow-400" />

                <span className="font-medium">{item.rating}</span>
              </div>

              <div className="flex justify-between items-center gap-14 mt-3">
                <span className="text-2xl font-bold text-green-700">{item.price}</span>

                <button className="bg-[#4F6B35] text-white px-5 py-1.5 rounded-lg hover:bg-[#3d5429] transition">Buy</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
