import { useState, useEffect } from "react";
import ShowProduct from "../components/Shop/ShowProduct.jsx";
import Navbar from "../components/home/navbar/Navbar.jsx";
import Category from "../components/Shop/category/Category.jsx";
//import SubCategory from "../components/Shop/subCategory/SubCategory.jsx";
import Footer from "../components/home/footer/Footer.jsx";

export default function Product() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setProducts(data);
      })
      .catch((err) => console.log(err));
  }, []);

  const [selectedCategory, setSelectedCategory] = useState(null);
  return (
    <>
      <Navbar />
      <Category selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-7xl m-2 mx-auto flex gap-2 sm:gap-3 md:gap-5 lg:gap-6">
          {/*<div>
            <SubCategory selectedCategory={selectedCategory} />
          </div>*/}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2 md:gap-3">
            {/* </div><div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-7"> */}
            {products.map((product) => (
              <ShowProduct key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
