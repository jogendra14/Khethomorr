import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./ScrollToTop.jsx";
import { Toaster } from "react-hot-toast";

{/* ADMIN RELATED */}
import ProtectedRoute from "./Admin/components/ProtectedRoute";
import AdminLogin from "./Admin/AdminLogin.jsx";
import AdminLayout from "./Admin/AdminLayout.jsx";
import Dashboard from "./Admin/pages/Dashboard.jsx";

import Products from "./Admin/pages/Products.jsx";
import AddProduct from "./Admin/components/product/AddProduct.jsx";
import EditProduct from "./Admin/components/product/EditProduct.jsx";

import Categories from "./Admin/pages/Categories.jsx";
import SubCategories from "./Admin/components/subCategories/SubCategories.jsx";
import Brands from "./Admin/components/subCategories/Brands.jsx";
//import AddCategory from "./Admin/components/category/AddCategory.jsx"
//import EditCategory from "./Admin/components/category/EditCategory.jsx"

import Offers from "./Admin/pages/Deals.jsx";
import AddDeal from "./Admin/components/deal/AddDeal.jsx";
import EditDeal from "./Admin/components/deal/EditDeal.jsx";

import Orders from "./Admin/pages/Orders.jsx";
import Users from './Admin/pages/Users.jsx';

{/* USER RELATED */}
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Deals from "./pages/Deals.jsx"
import Services from "./pages/Services";
import AboutUs from "./pages/AboutUs.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import Checkout from "./pages/Checkout.jsx";

import ProductDetail from "./pages/ProductDetails.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx"
import Cart from "./pages/Cart.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Coupons from "./Admin/pages/Coupons.jsx";
import Banner from "./Admin/pages/Banner.jsx";
import Settings from "./Admin/pages/Settings.jsx";
import AdminProfile from "./Admin/pages/AdminProfile.jsx";
//import Product from "./pages/Product.jsx";



const App = () => {
  return (
      <BrowserRouter>
      <ScrollToTop/>
        <Routes>
          {/* USERS */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/services" element={<Services />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/contactUs" element={<ContactUs />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout/>}/>
          
          {/*ADMIN */}
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
            <Route path="products" element={<Products />} />
            <Route path="/admin/add-product" element={<AddProduct />} /> 
            <Route path="/admin/edit-product/:id" element={<EditProduct/>} /> 

            <Route path="categories" element={<Categories />} />
            <Route path="/admin/sub-categories" element={<SubCategories />} />
            <Route path="/admin/brands" element={<Brands />} />

          {/*
            <Route path="/admin/add-category" element={<AddCategory />} /> 
            <Route path="/admin/edit-category/:id" element={<EditCategory/>} /> */}

            <Route path="deals" element={<Offers  />}/>
            <Route path="/admin/add-deal" element={<AddDeal />} /> 
            <Route path="/admin/edit-deal/:id" element={<EditDeal/>} /> 
            <Route path="orders" element={<Orders />} />
            <Route path="users" element={<Users />} />

            <Route path="coupons" element={<Coupons />} />
            <Route path="banner" element={<Banner />} />
            <Route path="settings" element={<Settings />} />
            <Route path="adminProfile" element={<AdminProfile />} />
          </Route>

          {/*User Login Page */}
          <Route path="/Login" element={<Login />} />
          {/*User SignUp Page */}
          <Route path="/SignUp" element={<SignUp />} />
          {/* Cart Page */}
          <Route path="/Cart" element={<Cart />} />
          {/* Wishlist Page */}
          <Route path="/Wishlist" element={<Wishlist />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
  );
};

export default App;
