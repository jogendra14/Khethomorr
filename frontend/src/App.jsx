import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./ScrollToTop.jsx";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// ADMIN RELATED
import ProtectedRoute from "./Admin/ProtectedRoute";
import AdminLogin from "./Admin/AdminLogin.jsx";
import AdminLayout from "./Admin/AdminLayout.jsx";
import AdminProfile from "./Admin/pages/AdminProfile.jsx";
import Dashboard from "./Admin/pages/Dashboard.jsx";

import Products from "./Admin/pages/Products.jsx";
import AddProduct from "./Admin/components/product/AddProduct.jsx";
import EditProduct from "./Admin/components/product/EditProduct.jsx";

import Categories from "./Admin/pages/Categories.jsx";
//import SubCategories from "./Admin/components/subCategories/SubCategories.jsx";
//import Brands from "./Admin/components/subCategories/Brands.jsx";
//import Offers from "./Admin/pages/Deals.jsx";
//import AddDeal from "./Admin/components/deal/AddDeal.jsx";
//import EditDeal from "./Admin/components/deal/EditDeal.jsx";

import Users from "./Admin/pages/Users.jsx";

import Orders from "./Admin/pages/Orders.jsx";

// USER RELATED
//import Login from "./pages/Login.jsx";
//import SignUp from "./pages/SignUp.jsx"
import Cart from "./pages/Cart.jsx";
import Wishlist from "./pages/Wishlist.jsx";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Deals from "./pages/Deals.jsx";
import Services from "./pages/Services";
import AboutUs from "./pages/AboutUs.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import ProductDetail from "./pages/ProductDetails.jsx";

//import Checkout from "./pages/Checkout.jsx";
//import MyOrders from "./pages/MyOrders.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* USERS */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/services" element={<Services />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/contactUs" element={<ContactUs />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/Cart" element={<Cart />} />
          <Route path="/Wishlist" element={<Wishlist />} />

          {/* ADMIN */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/create" element={<AddProduct />} />
              <Route path="products/:id/edit" element={<EditProduct />} />

              <Route path="categories" element={<Categories />} />
              <Route path="users" element={<Users />} />
              <Route path="orders" element={<Orders />} />
              <Route path="adminProfile" element={<AdminProfile />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>

      {/* ✅ Toaster - ek baar hi rakhna hai */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />

      {/* ✅ React Query DevTools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </BrowserRouter>
  );
};

export default App;
