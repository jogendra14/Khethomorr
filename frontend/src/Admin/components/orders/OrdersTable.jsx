// frontend/src/Admin/components/orders/OrdersTable.jsx
import { 
  FiEye, FiTruck, FiCheck, FiX, FiAlertTriangle,
  FiChevronLeft, FiChevronRight, FiPackage
} from "react-icons/fi";

const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  Processing: "bg-indigo-100 text-indigo-800 border-indigo-300",
  Shipped: "bg-purple-100 text-purple-800 border-purple-300",
  "In Transit": "bg-violet-100 text-violet-800 border-violet-300",
  "Out for Delivery": "bg-pink-100 text-pink-800 border-pink-300",
  Delivered: "bg-green-100 text-green-800 border-green-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
  Returned: "bg-orange-100 text-orange-800 border-orange-300",
};

const paymentStyles = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Failed: "bg-red-100 text-red-700",
  Refunded: "bg-gray-100 text-gray-700",
};

const formatMoney = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val || 0);

const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || "bg-gray-100 text-gray-600 border-gray-300"}`}>
    {status}
  </span>
);

const PaymentBadge = ({ status }) => (
  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${paymentStyles[status] || "bg-gray-100 text-gray-600"}`}>
    {status}
  </span>
);

// Quick Status Actions
const QuickActions = ({ order, onStatusChange, disabled }) => {
  const actions = {
    Pending: [
      { status: "Confirmed", icon: FiCheck, color: "text-blue-600 hover:bg-blue-50", label: "Confirm" },
      { status: "Cancelled", icon: FiX, color: "text-red-600 hover:bg-red-50", label: "Cancel" },
    ],
    Confirmed: [
      { status: "Processing", icon: FiPackage, color: "text-indigo-600 hover:bg-indigo-50", label: "Process" },
    ],
    Processing: [
      { status: "Shipped", icon: FiTruck, color: "text-purple-600 hover:bg-purple-50", label: "Ship" },
    ],
  };

  const availableActions = actions[order.status] || [];

  if (availableActions.length === 0) return null;

  return (
    <div className="flex gap-1">
      {availableActions.map(({ status, icon: Icon, color, label }) => (
        <button
          key={status}
          onClick={() => onStatusChange(order._id, status)}
          disabled={disabled}
          className={`p-1.5 rounded-lg transition ${color} disabled:opacity-50`}
          title={label}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
};

// Skeleton
const TableSkeleton = () => (
  <div className="p-4 space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <div className="flex-1 h-4 bg-gray-200 rounded" />
        <div className="w-20 h-6 bg-gray-200 rounded-full" />
        <div className="w-16 h-4 bg-gray-200 rounded" />
        <div className="w-24 h-4 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

export default function OrdersTable({
  loading,
  error,
  errorMessage,
  orders = [],
  total = 0,
  totalPages = 1,
  page = 1,
  onPageChange,
  onView,
  onStatusChange,
  onRefresh,
  isStatusUpdating = false,
}) {
  // Error State
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-8 text-center">
        <FiAlertTriangle className="mx-auto text-red-400 mb-3" size={40} />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Orders</h3>
        <p className="text-red-600 text-sm mb-4">{errorMessage || "Something went wrong"}</p>
        <button onClick={onRefresh} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
          Try Again
        </button>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <TableSkeleton />
      </div>
    );
  }

  // Empty State
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-12 text-center">
        <FiPackage className="mx-auto text-gray-300 mb-3" size={48} />
        <p className="text-gray-500 font-medium">No orders found</p>
        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Order</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Customer</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Date</th>
              <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50/50 transition cursor-pointer" onClick={() => onView(order)}>
                {/* Order # */}
                <td className="p-4">
                  <p className="font-mono text-sm font-semibold text-blue-600">
                    #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.items?.length || 0} item(s)
                  </p>
                </td>

                {/* Customer */}
                <td className="p-4 hidden md:table-cell">
                  <p className="font-medium text-gray-900 text-sm">{order.userId?.name || "Guest"}</p>
                  <p className="text-xs text-gray-500">{order.userId?.email || ""}</p>
                </td>

                {/* Items */}
                <td className="p-4">
                  <div className="text-sm">
                    {order.items?.slice(0, 2).map((item, i) => (
                      <p key={i} className="text-gray-600 truncate max-w-[150px]">
                        {item.qty}x {item.name}
                      </p>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-xs text-gray-400">+{order.items.length - 2} more</p>
                    )}
                  </div>
                </td>

                {/* Amount */}
                <td className="p-4">
                  <p className="font-semibold text-gray-900">{formatMoney(order.totalAmount)}</p>
                </td>

                {/* Payment */}
                <td className="p-4">
                  <PaymentBadge status={order.paymentStatus} />
                  <p className="text-xs text-gray-400 mt-0.5">{order.paymentMethod}</p>
                </td>

                {/* Status */}
                <td className="p-4">
                  <StatusBadge status={order.status} />
                </td>

                {/* Date */}
                <td className="p-4 hidden lg:table-cell">
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </td>

                {/* Quick Actions */}
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    <QuickActions order={order} onStatusChange={onStatusChange} disabled={isStatusUpdating} />
                    <button
                      onClick={(e) => { e.stopPropagation(); onView(order); }}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View Details"
                    >
                      <FiEye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages} · {total} orders
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
            >
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let num;
              if (totalPages <= 5) num = i + 1;
              else if (page <= 3) num = i + 1;
              else if (page >= totalPages - 2) num = totalPages - 4 + i;
              else num = page - 2 + i;
              return (
                <button
                  key={num}
                  onClick={() => onPageChange(num)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    page === num ? "bg-blue-600 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  {num}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}