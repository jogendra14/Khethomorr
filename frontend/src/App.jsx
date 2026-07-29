import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./ScrollToTop.jsx";

import ProtectedRoute from "./Admin/components/ProtectedRoute";
import AdminLogin from "./Admin/AdminLogin.jsx";
import AdminLayout from "./Admin/AdminLayout.jsx";
import Dashboard from "./Admin/pages/Dashboard.jsx";
//import Products from "./Admin/pages/Products.jsx";
//import Deals from "./Admin/pages/Deals.jsx"
//import AddProduct from "./Admin/pages/AddProduct.jsx"
//import EditProduct from "./Admin/pages/EditProduct.jsx"
//import AddDeal from "./Admin/pages/AddDeal.jsx"
//import EditDeal from "./Admin/pages/EditDeal.jsx"

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Deals from "./pages/Deals.jsx"
import Inspiration from "./pages/Inspiration";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";

import ProductDetail from "./pages/ProductDetails.jsx";
import { CartProvider } from "./context/CartContext";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx"
import Cart from "./pages/Cart.jsx";
//import Product from "./pages/Product.jsx";



const App = () => {
  return (
    <CartProvider>
      <BrowserRouter>
      <ScrollToTop/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/inspiration" element={<Inspiration />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        
          {/*ProductDetail Page */}
          <Route path="/product/:id" element={<ProductDetail />} />
          

          {/*Admin Login Page */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            {/*<Route path="products" element={<Products />} />
            <Route path="add-product" element={<AddProduct />} /> 
            <Route path="/admin/edit-product/:id" element={<EditProduct/>} /> 
            <Route path="deals" element={<Deals/>}/>
            <Route path="add-deal" element={<AddDeal />} /> 
            <Route path="/admin/edit-deal/:id" element={<EditDeal/>} /> */}
            {/* <Route path="orders" element={<Orders />} /> */}
            {/* <Route path="users" element={<Users />} /> */}
          </Route>

          {/*User Login Page */}
          <Route path="/Login" element={<Login />} />
          {/*User SignUp Page */}
          <Route path="/SignUp" element={<SignUp />} />
          {/* Cart Page */}
          <Route path="/Cart" element={<Cart />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
