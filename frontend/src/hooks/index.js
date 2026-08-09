// Auth hooks
export {
  useGetMe,
  useLogin,
  useRegister,
  useLogout,
  useForgotPassword,
  useResetPassword,
  useUpdatePassword,
} from './useAuth';

// Product hooks
export {
  useProducts,
  useProduct,
  useProductBySlug,
  useFeaturedProducts,
  useBestSellingProducts,
  useNewArrivals,
  useSearchProducts,
  useProductsByCategory,
  useRelatedProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUpdateStock,
  useToggleFeatured,
  useProductStats,
  useLowStockProducts,
} from './useProducts';

// Cart hooks
export {
  useCart,
  useCartSummary,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useApplyCoupon,
  useRemoveCoupon,
} from './useCart';

// Category hooks
export {
  useCategories,
  useFeaturedCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategory,
} from './useCategories';

// Order hooks
export {
  useMyOrders,
  useOrder,
  useCreateOrder,
  useCancelOrder,
  useAllOrders,
  useUpdateOrderStatus,
  useAddTracking,
} from './useOrders';