import { useEffect, useMemo, useState, useCallback } from "react";
import API from "../../api/axios";
import { FiSearch } from "react-icons/fi";
import { toast } from "react-hot-toast";

import OrdersTable from "../components/orders/OrdersTable";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await API.get("/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customer = order.userId?.name?.toLowerCase() || "";

      const id = order._id.toLowerCase();

      const searchMatch = customer.includes(search.toLowerCase()) || id.includes(search.toLowerCase());

      const statusMatch = statusFilter === "All" ? true : order.status === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [orders, search, statusFilter]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;

  const processingOrders = orders.filter((o) => o.status === "Processing").length;

  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>

          <p className="text-gray-500">Manage all customer orders</p>
        </div>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500">Total Orders</p>

          <h2 className="text-3xl font-bold mt-2">{totalOrders}</h2>
        </div>

        <div className="bg-yellow-50 rounded-xl p-5">
          <p>Pending</p>

          <h2 className="text-3xl font-bold">{pendingOrders}</h2>
        </div>

        <div className="bg-blue-50 rounded-xl p-5">
          <p>Processing</p>

          <h2 className="text-3xl font-bold">{processingOrders}</h2>
        </div>

        <div className="bg-green-50 rounded-xl p-5">
          <p>Delivered</p>

          <h2 className="text-3xl font-bold">{deliveredOrders}</h2>
        </div>
      </div>

      {/* Search + Filter */}

      <div className="bg-white rounded-xl shadow mt-8 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />

            <input
              type="text"
              placeholder="Search customer or order id..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg pl-10 pr-4 py-2 outline-none"
            />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-4 py-2">
            <option>All</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

        <OrdersTable
          loading={loading}
          orders={filteredOrders}
          onView={(order) => {
            setSelectedOrder(order);
            setOpenModal(true);
          }}
          onRefresh={fetchOrders}
        />
      </div>

      {openModal && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setOpenModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default Orders;
