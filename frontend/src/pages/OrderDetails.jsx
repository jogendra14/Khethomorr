// frontend/src/pages/OrderDetails.jsx

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";
import Navbar from "../components/home/navbar/Navbar";
import Footer from "../components/home/footer/Footer";
import toast from "react-hot-toast";

const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const statusOrder = ["Pending", "Processing", "Shipped", "Delivered"];

const getOrderById = async (id) => {
  const { data } = await API.get(`/orders/${id}`);
  return data;
};

export default function OrderDetails() {
  const { id } = useParams();
  
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    retry: 1,
    onError: (error) => {
      toast.error(error?.message || "Failed to load order details");
    },
  });

  const getStatusIndex = (status) => {
    const index = statusOrder.indexOf(status);
    return index === -1 ? 0 : index;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 w-48 bg-gray-200 rounded"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 min-h-[60vh]">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 text-lg mb-2">⚠️ Failed to load order</p>
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

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 min-h-[60vh]">
          <div className="text-center py-20">
            <p className="text-gray-500">Order not found</p>
            <Link to="/orders" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Orders
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const statusIndex = getStatusIndex(order.status);
  const totalItems = order.items?.reduce((sum, item) => sum + item.qty, 0) || 0;

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 min-h-[60vh]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-gray-500 mt-1">
              Order #{order._id?.slice(-8)?.toUpperCase()}
            </p>
          </div>
          <Link to="/orders" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Order Status */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.status] || "bg-gray-100 text-gray-800"}`}>
                  {order.status}
                </span>
                <span className="text-sm text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">
                  ₹{order.totalAmount?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-gray-400">{totalItems} item{totalItems > 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              {statusOrder.map((status, index) => (
                <span key={status} className={index <= statusIndex ? "text-blue-600 font-medium" : ""}>
                  {status}
                </span>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${(statusIndex / (statusOrder.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="px-6 py-4">
            <h2 className="font-semibold text-lg mb-4">Items</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item._id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0">
                  <img
                    src={item.productId?.images?.[0] || "/placeholder-image.jpg"}
                    alt={item.productId?.name || "Product"}
                    className="w-20 h-20 object-cover rounded-lg border"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <Link to={`/product/${item.productId?._id}`} className="font-medium hover:text-blue-600">
                      {item.productId?.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      Qty: {item.qty} × ₹{item.price}
                    </p>
                    <p className="text-sm font-semibold">
                      ₹{(item.qty * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{order.totalAmount?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Method</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Status</span>
                <span className={`font-medium ${order.paymentStatus === "Paid" ? "text-green-600" : "text-yellow-600"}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{order.totalAmount?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="px-6 py-4 border-t border-gray-100">
            <h3 className="font-semibold mb-2">Delivery Address</h3>
            <p className="text-sm text-gray-600">
              {order.address?.fullName}<br />
              {order.address?.street}<br />
              {order.address?.city}, {order.address?.postalCode}<br />
              {order.address?.country}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}