import { useEffect, useState } from "react";
import API from "../api/axios.js";
import ShowDeals from "../components/Deals/ShowDeals.jsx";

import Navbar from "../components/home/navbar/Navbar.jsx";
import Footer from "../components/home/footer/Footer.jsx";


export default function Deals() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    API.get("/deals")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, 
  []);

  return (
    <>
      <Navbar />
      <div className=" max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-2">🔥 Today's Deals</h1>

        <p className="text-gray-600 mb-8">Best products with exciting discounts.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((deal) => (
            <ShowDeals key={deal._id} product={deal} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
