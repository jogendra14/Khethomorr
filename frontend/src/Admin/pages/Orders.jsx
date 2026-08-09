// frontend/src/Admin/pages/Orders.jsx
import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FiSearch, FiRefreshCw, FiDownload, FiX,
  FiShoppingBag, FiClock, FiTruck, FiCheckCircle, FiXCircle
} from "react-icons/fi";
import { orderApi } from "../../api";
import OrdersTable from "../components/orders/OrdersTable";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";

const Orders = () => {
  const queryClient = useQueryClient();

  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // ============================================
  // QUERY: Fetch Orders
  // ============================================
  const {
    data: ordersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-orders", page, limit, search, statusFilter],
    queryFn: () =>
      orderApi.getAllOrders({
        page,
        limit,
        ...(search && { search }),
        ...(statusFilter !== "All" && { status: statusFilter }),
      }).then(res => res.data),
    keepPreviousData: true,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });

  const orders = ordersData?.data || [];
  const total = ordersData?.total || 0;
  const totalPages = ordersData?.pagination?.totalPages || 1;
  const stats = ordersData?.stats;

  // ============================================
  // QUERY: Fetch Order Stats Separately (for real-time counts)
  // ============================================
  const { data: orderStats } = useQuery({
    queryKey: ["admin-orders-stats"],
    queryFn: () => orderApi.getStats().then(res => res.data),
    refetchInterval: 60 * 1000,
  });

  const statsData = orderStats?.data || stats;

  // ============================================
  // MUTATION: Update Order Status
  // ============================================
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => orderApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Order status updated!");
      queryClient.invalidateQueries(["admin-orders"]);
      queryClient.invalidateQueries(["admin-orders-stats"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  // ============================================
  // FILTERED ORDERS (Client-side for immediate search)
  // ============================================
  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    return orders.filter((order) => {
      const customer = order.userId?.name?.toLowerCase() || "";
      const orderNumber = order.orderNumber?.toLowerCase() || "";
      const id = order._id?.toLowerCase() || "";
      const query = search.toLowerCase();
      return customer.includes(query) || orderNumber.includes(query) || id.includes(query);
    });
  }, [orders, search]);

  // ============================================
  // STATS FROM DATA
  // ============================================
  const totalOrders = statsData?.totalOrders || total || 0;
  const pendingOrders = statsData?.pendingOrders || orders.filter(o => o.status === "Pending").length;
  const processingOrders = statsData?.processingOrders || orders.filter(o => o.status === "Processing").length;
  const shippedOrders = orders.filter(o => o.status === "Shipped").length;
  const deliveredOrders = statsData?.deliveredOrders || orders.filter(o => o.status === "Delivered").length;
  const cancelledOrders = orders.filter(o => o.status === "Cancelled").length;

  // ============================================
  // HANDLERS
  // ============================================
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
    refetch(); // Refresh data when modal closes
  };

  const handleStatusChange = (orderId, newStatus) => {
    statusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleExport = () => {
    orderApi.getAllOrders({ limit: 1000 }).then(res => {
      const allOrders = res.data.data || [];
      const csv = [
        ["Order #", "Customer", "Email", "Status", "Payment", "Total", "Date"],
        ...allOrders.map(o => [
          o.orderNumber || o._id?.slice(-8),
          o.userId?.name || "N/A",
          o.userId?.email || "N/A",
          o.status,
          o.paymentStatus,
          o.totalAmount,
          new Date(o.createdAt).toLocaleDateString(),
        ])
      ].map(row => row.join(",")).join("\n");
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Orders exported!");
    });
  };

  // ============================================
  // STAT CARDS DATA
  // ============================================
  const statCards = [
    { label: "Total Orders", value: totalOrders, icon: FiShoppingBag, color: "bg-blue-50 text-blue-600", border: "border-blue-200" },
    { label: "Pending", value: pendingOrders, icon: FiClock, color: "bg-yellow-50 text-yellow-600", border: "border-yellow-200" },
    { label: "Processing", value: processingOrders, icon: FiRefreshCw, color: "bg-indigo-50 text-indigo-600", border: "border-indigo-200" },
    { label: "Shipped", value: shippedOrders, icon: FiTruck, color: "bg-purple-50 text-purple-600", border: "border-purple-200" },
    { label: "Delivered", value: deliveredOrders, icon: FiCheckCircle, color: "bg-green-50 text-green-600", border: "border-green-200" },
    { label: "Cancelled", value: cancelledOrders, icon: FiXCircle, color: "bg-red-50 text-red-600", border: "border-red-200" },
  ];

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalOrders} orders total · Manage customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600"
          >
            <FiDownload size={16} />
            Export
          </button>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 border-l-4 ${border}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`p-2 rounded-lg ${color}`}>
                <Icon size={16} />
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer, order #..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FiX size={16} />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="In Transit">In Transit</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTable
        loading={isLoading}
        error={isError}
        errorMessage={error?.message}
        orders={filteredOrders}
        total={total}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onView={handleViewOrder}
        onStatusChange={handleStatusChange}
        onRefresh={refetch}
        isStatusUpdating={statusMutation.isPending}
      />

      {/* Order Details Modal */}
      {openModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          orderId={selectedOrder._id}
          onClose={handleCloseModal}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default Orders;