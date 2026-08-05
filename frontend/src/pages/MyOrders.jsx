import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/home/navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../api/orderApi";

const currency = (value) => `₹${Number(value || 0).toFixed(2)}`;

export default function MyOrders() {
  const { isAuthenticated, loading } = useAuth();
  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
    enabled: isAuthenticated,
  });

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: "/orders" }} />;
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl min-h-[65vh] mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold">My Orders</h1>
        {isLoading && <p className="mt-8 text-gray-500">Loading orders...</p>}
        {isError && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5">
            <p className="text-red-700">Could not load your orders.</p>
            <button onClick={() => refetch()} className="mt-3 rounded bg-red-600 px-4 py-2 text-white">Try Again</button>
          </div>
        )}
        {!isLoading && !isError && orders.length === 0 && (
          <div className="mt-8 rounded-xl border p-8 text-center">
            <p className="text-gray-600">You have not placed an order yet.</p>
            <Link to="/shop" className="inline-block mt-4 rounded-lg bg-black px-5 py-2 text-white">Start Shopping</Link>
          </div>
        )}
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <article key={order._id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
                <div>
                  <p className="font-semibold">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">{order.status}</span>
              </div>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item._id} className="flex justify-between gap-4 py-3 text-sm">
                    <span>{item.productId?.name || "Product"} × {item.qty}</span>
                    <span>{currency(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4 font-semibold">
                <span>Payment: {order.paymentStatus}</span>
                <span>Total: {currency(order.totalAmount)}</span>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
