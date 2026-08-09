// frontend/src/Admin/pages/AdminDashboard.jsx
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  Package, 
  ShoppingBag, 
  Users, 
  Wallet,
  TrendingUp,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download
} from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../../api";
import { useState } from "react";

// ============================================
// UTILS
// ============================================
const formatMoney = (value) => 
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(value || 0);

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Shipped: "bg-violet-50 text-violet-700 border-violet-200",
  "In Transit": "bg-purple-50 text-purple-700 border-purple-200",
  "Out for Delivery": "bg-pink-50 text-pink-700 border-pink-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Returned: "bg-orange-50 text-orange-700 border-orange-200",
  Refunded: "bg-gray-50 text-gray-700 border-gray-200",
};

const getStatusStyle = (status) => 
  statusStyles[status] || "bg-gray-50 text-gray-600 border-gray-200";

// ============================================
// SKELETON LOADER
// ============================================
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const CardSkeleton = () => (
  <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
    <div className="flex items-start justify-between">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <Skeleton className="w-5 h-5 rounded" />
    </div>
    <Skeleton className="mt-5 w-24 h-4" />
    <Skeleton className="mt-2 w-32 h-8" />
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // ============================================
  // QUERIES
  // ============================================
  const {
    data: overview,
    isLoading: overviewLoading,
    isError: overviewError,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => dashboardApi.getOverview().then(res => res.data),
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  const {
    data: salesData,
    isLoading: salesLoading,
  } = useQuery({
    queryKey: ["dashboard", "sales"],
    queryFn: () => dashboardApi.getSalesAnalytics({ period: "7days" }).then(res => res.data),
    enabled: activeTab === "sales",
  });

  const {
    data: realtimeData,
    isLoading: realtimeLoading,
    refetch: refetchRealtime,
  } = useQuery({
    queryKey: ["dashboard", "realtime"],
    queryFn: () => dashboardApi.getRealTimeMetrics().then(res => res.data),
    refetchInterval: 30 * 1000, // Every 30 seconds
  });

  // ============================================
  // DERIVED DATA
  // ============================================
  const stats = overview?.data?.stats;
  const recent = overview?.data?.recent;
  const top = overview?.data?.top;

  const totalRevenue = stats?.revenue?.total || 0;
  const revenueToday = stats?.revenue?.today || 0;
  const revenueGrowth = stats?.revenue?.growth || 0;

  const totalOrders = stats?.orders?.total || 0;
  const ordersToday = stats?.orders?.today || 0;
  const ordersGrowth = stats?.orders?.growth || 0;

  const totalProducts = stats?.products?.total || 0;
  const activeProducts = stats?.products?.active || 0;
  const lowStockProducts = stats?.products?.lowStock || 0;

  const totalUsers = stats?.users?.total || 0;
  const newUsersToday = stats?.users?.newToday || 0;
  const userGrowth = stats?.users?.growth || 0;

  const pendingOrders = stats?.orders?.pending || 0;
  const processingOrders = stats?.orders?.processing || 0;
  const deliveredOrders = stats?.orders?.delivered || 0;
  const cancelledOrders = stats?.orders?.cancelled || 0;

  const averageRating = stats?.reviews?.averageRating || 0;
  const totalReviews = stats?.reviews?.total || 0;
  const conversionRate = stats?.conversionRate || 0;

  const recentOrders = recent?.orders || [];
  const recentUsers = recent?.users || [];
  const recentReviews = recent?.reviews || [];

  const topProducts = top?.products || [];
  const topCategories = top?.categories || [];
  const topCustomers = top?.customers || [];

  const realtime = realtimeData?.data?.realtime;
  const alerts = realtimeData?.data?.alerts;

  // ============================================
  // CARD DATA
  // ============================================
  const statCards = [
    {
      label: "Total Revenue",
      value: formatMoney(totalRevenue),
      subtitle: revenueToday > 0 ? `+${formatMoney(revenueToday)} today` : "No sales today",
      icon: Wallet,
      tone: "bg-emerald-50 text-emerald-600",
      trend: revenueGrowth,
      trendLabel: "vs last month",
    },
    {
      label: "Total Orders",
      value: formatNumber(totalOrders),
      subtitle: `${ordersToday} today`,
      icon: ShoppingBag,
      tone: "bg-blue-50 text-blue-600",
      trend: ordersGrowth,
      trendLabel: "vs yesterday",
    },
    {
      label: "Products",
      value: formatNumber(totalProducts),
      subtitle: `${activeProducts} active · ${lowStockProducts} low stock`,
      icon: Package,
      tone: "bg-violet-50 text-violet-600",
      trend: null,
      trendLabel: "",
    },
    {
      label: "Customers",
      value: formatNumber(totalUsers),
      subtitle: newUsersToday > 0 ? `+${newUsersToday} today` : "No new today",
      icon: Users,
      tone: "bg-orange-50 text-orange-600",
      trend: userGrowth,
      trendLabel: "vs last month",
    },
  ];

  // ============================================
  // ERROR STATE
  // ============================================
  if (overviewError) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-red-600 mb-4">
            Something went wrong while fetching dashboard data.
          </p>
          <button
            onClick={() => refetchOverview()}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition font-medium"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      {/* ========== HEADER ========== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase">
            Admin Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Welcome back 👋
          </h1>
          <p className="mt-1 text-gray-500">
            Here's what's happening with your store today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Action */}
          <Link
            to="/admin/products/add-product"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
          >
            <Package size={18} />
            Add Product
          </Link>

          {/* Export Button */}
          <button
            onClick={() => dashboardApi.exportData({ type: "orders", format: "json" })}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* ========== REAL-TIME BAR ========== */}
      {realtime && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 p-4 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              Live: {realtime.activeVisitors || 0} visitors
            </span>
          </div>
          <div className="text-slate-400">|</div>
          <div className="text-sm">
            <span className="text-slate-400">Orders (1h):</span>{" "}
            <span className="font-semibold">{realtime.ordersLastHour || 0}</span>
          </div>
          <div className="text-sm">
            <span className="text-slate-400">Revenue (1h):</span>{" "}
            <span className="font-semibold">{formatMoney(realtime.revenueLastHour)}</span>
          </div>
          <div className="text-sm">
            <span className="text-slate-400">Pending:</span>{" "}
            <span className="font-semibold text-amber-400">{realtime.pendingOrders || 0}</span>
          </div>
          <button
            onClick={() => refetchRealtime()}
            className="ml-auto text-slate-400 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      )}

      {/* ========== ALERTS ========== */}
      {alerts?.lowStock?.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="font-semibold text-amber-800">
              Low Stock Alerts ({alerts.lowStock.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {alerts.lowStock.slice(0, 5).map((item) => (
              <Link
                key={item._id}
                to={`/admin/products/${item._id}`}
                className="inline-flex items-center gap-1 text-sm bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-amber-800 hover:bg-amber-100 transition"
              >
                {item.name}
                <span className="font-bold text-red-600">({item.quantity})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ========== STAT CARDS ========== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewLoading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : statCards.map(({ label, value, subtitle, icon: Icon, tone, trend, trendLabel }) => (
              <div
                key={label}
                className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <span className={`rounded-lg p-3 ${tone}`}>
                    <Icon size={22} />
                  </span>
                  {trend !== null && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        trend >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {trend >= 0 ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      {Math.abs(trend)}%
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && (
                  <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
                )}
              </div>
            ))}
      </div>

      {/* ========== MAIN GRID ========== */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ========== ORDER STATUS CHART ========== */}
        <div className="lg:col-span-1 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
            <Link
              to="/admin/orders"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
            >
              View all →
            </Link>
          </div>

          {overviewLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-full h-3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {[
                { label: "Pending", count: pendingOrders, color: "bg-amber-400", total: totalOrders },
                { label: "Processing", count: processingOrders, color: "bg-blue-500", total: totalOrders },
                { label: "Delivered", count: deliveredOrders, color: "bg-emerald-500", total: totalOrders },
                { label: "Cancelled", count: cancelledOrders, color: "bg-red-400", total: totalOrders },
              ].map(({ label, count, color, total }) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">{label}</span>
                      <span className="font-semibold text-gray-900">
                        {count} <span className="text-gray-400 text-xs">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========== RECENT ORDERS ========== */}
        <div className="lg:col-span-2 rounded-xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
            >
              Manage orders →
            </Link>
          </div>

          {overviewLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-24 h-6 rounded-full" />
                  <Skeleton className="w-20 h-4" />
                </div>
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-4 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div>Customer</div>
                <div>Order</div>
                <div>Status</div>
                <div className="text-right">Amount</div>
              </div>

              {recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/admin/orders/${order._id}`}
                  className="grid sm:grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50 transition items-center"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {order.userId?.name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-900 font-mono text-xs">
                      #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {order.items?.length || 0} item(s)
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatMoney(order.totalAmount)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="font-medium">No orders yet</p>
              <p className="text-sm mt-1">New orders will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* ========== BOTTOM GRID ========== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ========== TOP PRODUCTS ========== */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🏆 Top Selling Products
          </h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <Link
                  key={product._id}
                  to={`/admin/products/${product._id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-2xl font-bold text-gray-300 w-8 text-center">
                    {index + 1}
                  </span>
                  <img
                    src={product.image || "/placeholder.png"}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.totalSold} sold · {formatMoney(product.revenue)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales data yet</p>
          )}
        </div>

        {/* ========== RECENT REVIEWS ========== */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              ⭐ Recent Reviews
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">{averageRating}</span>
              <span className="text-gray-400 text-sm">({totalReviews})</span>
            </div>
          </div>
          {recentReviews.length > 0 ? (
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div key={review._id} className="p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={review.userId?.avatar || "https://i.pravatar.cc/32"}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium text-sm">{review.userId?.name}</span>
                    <span className="text-amber-500 text-sm">
                      {"⭐".repeat(review.rating)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No reviews yet</p>
          )}
        </div>
      </div>

      {/* ========== QUICK STATS ========== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Avg. Order Value", value: formatMoney(stats?.revenue?.averageOrder || 0) },
          { label: "Conversion Rate", value: `${conversionRate}%` },
          { label: "Total Reviews", value: formatNumber(totalReviews) },
          { label: "Avg. Rating", value: `${averageRating} ⭐` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 text-center">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}