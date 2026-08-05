// frontend/src/pages/MyOrders.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyOrders } from "../api/orderApi";
import Navbar from "../components/home/navbar/Navbar";
import Footer from "../components/home/footer/Footer";
import toast from "react-hot-toast";

// Status badge styles
const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

// Status order for progress bar
const statusOrder = ["Pending", "Processing", "Shipped", "Delivered"];

const MyOrders = () => {
  // ✅ React Query - Fetch Orders
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["myOrders"],
    queryFn: getMyOrders,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (error) => {
      console.error("Error fetching orders:", error);
      toast.error(error?.message || "Failed to load orders");
    },
  });

  // ✅ Get status index for progress
  const getStatusIndex = (status) => {
    const index = statusOrder.indexOf(status);
    return index === -1 ? 0 : index;
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Loading State
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded mt-2"></div>
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="mt-4 h-2 bg-gray-200 rounded"></div>
                <div className="mt-4 flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ✅ Error State
  if (isError) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 text-lg mb-2">⚠️ Failed to load orders</p>
            <p className="text-red-500 text-sm mb-4">{error?.message || "Please try again"}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ✅ Empty State
  if (orders.length === 0) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 min-h-[60vh]">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders.</p>
            <Link 
              to="/shop" 
              className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Start Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12 min-h-[60vh]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-gray-500 mt-1">
              {orders.length} order{orders.length > 1 ? "s" : ""} placed
            </p>
          </div>
          <Link 
            to="/shop" 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Continue Shopping →
          </Link>
        </div>

        <div className="space-y-6">
          {orders.map((order) => {
            const statusIndex = getStatusIndex(order.status);
            const totalItems = order.items?.reduce((sum, item) => sum + item.qty, 0) || 0;

            return (
              <div key={order._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">
                        Order #{order._id?.slice(-8)?.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status] || "bg-gray-100 text-gray-800"}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Placed on {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      ₹{order.totalAmount?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-xs text-gray-400">{totalItems} item{totalItems > 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {order.items?.slice(0, 3).map((item) => (
                      <div key={item._id} className="flex items-center gap-4">
                        <img
                          src={item.productId?.images?.[0] || "/placeholder-image.jpg"}
                          alt={item.productId?.name || "Product"}
                          className="w-16 h-16 object-cover rounded-lg border"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.productId?.name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.qty} × ₹{item.price}
                          </p>
                        </div>
                        <p className="font-semibold text-sm">
                          ₹{(item.qty * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        + {order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      Payment: <span className="font-medium text-gray-700">{order.paymentMethod}</span>
                    </span>
                    <span className="text-gray-500">
                      Status: <span className="font-medium text-gray-700">{order.paymentStatus}</span>
                    </span>
                  </div>
                  <Link
                    to={`/order/${order._id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;