// frontend/src/Admin/components/orders/OrderDetailsModal.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FiX, FiTruck, FiPackage, FiMapPin, FiUser, FiMail, FiPhone,
  FiCreditCard, FiCalendar, FiLoader
} from "react-icons/fi";
import { orderApi } from "../../../api";

const formatMoney = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val || 0);

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-yellow-100 text-yellow-800",
    Confirmed: "bg-blue-100 text-blue-800",
    Processing: "bg-indigo-100 text-indigo-800",
    Shipped: "bg-purple-100 text-purple-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
};

export default function OrderDetailsModal({ order: initialOrder, orderId, onClose, onStatusChange }) {
  // Fetch full order details
  const { data: orderData, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getOrderById(orderId).then(res => res.data.data || res.data),
    initialData: initialOrder ? { ...initialOrder } : undefined,
    enabled: !!orderId,
  });

  const order = orderData || initialOrder;

  const statusFlow = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];
  const currentIndex = statusFlow.indexOf(order?.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">
              Order #{order?.orderNumber || order?._id?.slice(-8)?.toUpperCase()}
            </h2>
            <p className="text-sm text-gray-500">
              {new Date(order?.createdAt).toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <FiX size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <FiLoader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Status Tracker */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-3">Order Progress</h3>
              <div className="flex items-center justify-between">
                {statusFlow.map((status, i) => (
                  <div key={status} className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i <= currentIndex ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      {i < currentIndex ? "✓" : i + 1}
                    </div>
                    <p className="text-xs mt-1 text-center font-medium">{status}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left - Items */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-semibold">Order Items ({order?.items?.length || 0})</h3>
                <div className="space-y-3">
                  {order?.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                      <img src={item.image || "/placeholder.png"} alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.name}</p>
                        {item.variant && <p className="text-xs text-gray-500">{item.variant.name}</p>}
                        <p className="text-xs text-gray-500">{item.qty} × {formatMoney(item.price)}</p>
                      </div>
                      <p className="font-semibold">{formatMoney(item.subtotal || item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Info */}
              <div className="space-y-4">
                {/* Customer */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><FiUser size={14} /> Customer</h4>
                  <p className="font-medium">{order?.userId?.name || "Guest"}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><FiMail size={12} /> {order?.userId?.email || "N/A"}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><FiPhone size={12} /> {order?.address?.phone || "N/A"}</p>
                </div>

                {/* Shipping */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><FiMapPin size={14} /> Shipping Address</h4>
                  <p className="text-sm">{order?.address?.fullName}</p>
                  <p className="text-sm text-gray-500">{order?.address?.street}</p>
                  {order?.address?.apartment && <p className="text-sm text-gray-500">{order.address.apartment}</p>}
                  <p className="text-sm text-gray-500">{order?.address?.city}, {order?.address?.state} {order?.address?.postalCode}</p>
                  <p className="text-sm text-gray-500">{order?.address?.country}</p>
                </div>

                {/* Payment */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><FiCreditCard size={14} /> Payment</h4>
                  <p className="text-sm">Method: <span className="font-medium">{order?.paymentMethod}</span></p>
                  <p className="text-sm">Status: <StatusBadge status={order?.paymentStatus} /></p>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-sm mb-2">Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(order?.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Tax</span><span>{formatMoney(order?.tax)}</span></div>
                    <div className="flex justify-between"><span>Shipping</span><span>{order?.shippingCost === 0 ? "FREE" : formatMoney(order?.shippingCost)}</span></div>
                    {order?.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatMoney(order?.discount)}</span></div>}
                    <hr />
                    <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatMoney(order?.totalAmount)}</span></div>
                  </div>
                </div>

                {/* Tracking */}
                {order?.trackingNumber && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><FiTruck size={14} /> Tracking</h4>
                    <p className="text-sm">Number: <span className="font-mono font-medium">{order.trackingNumber}</span></p>
                    <p className="text-sm">Carrier: {order.shippingCarrier}</p>
                  </div>
                )}

                {/* Status History */}
                {order?.statusHistory?.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-sm mb-2">Status History</h4>
                    <div className="space-y-2">
                      {order.statusHistory.map((h, i) => (
                        <div key={i} className="text-sm flex justify-between">
                          <span>{h.status}</span>
                          <span className="text-gray-500">{new Date(h.timestamp).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}