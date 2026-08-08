// frontend/src/api/index.js
import ProductAPI from "./productApi";
import AuthAPI from "./authApi";
import OrderAPI from "./orderApi";
import CartAPI from "./cartApi";
import ReviewAPI from "./reviewApi";
import UserAPI from "./userApi";
import PaymentAPI from "./paymentApi";
import CategoryAPI from "./categoryApi";
import AnalyticsAPI from "./analyticsApi";

export {
  ProductAPI,
  AuthAPI,
  OrderAPI,
  CartAPI,
  ReviewAPI,
  UserAPI,
  PaymentAPI,
  CategoryAPI,
  AnalyticsAPI,
};

// Default export for convenience
export default {
  ProductAPI,
  AuthAPI,
  OrderAPI,
  CartAPI,
  ReviewAPI,
  UserAPI,
  PaymentAPI,
  CategoryAPI,
  AnalyticsAPI,
};