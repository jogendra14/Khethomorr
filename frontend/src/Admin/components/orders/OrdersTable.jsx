import axios from "axios";
import { FaEye, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";

const OrdersTable = ({
  orders,
  loading,
  onView,
  onRefresh,
}) => {

  const token = localStorage.getItem("token");

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Status Updated");
      onRefresh();

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const deleteOrder = async (id) => {

    if (!window.confirm("Delete this order?")) return;

    try {

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Order Deleted");

      onRefresh();

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (loading)
    return (
      <div className="text-center py-10">
        Loading Orders...
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="text-center py-10 text-gray-500">
        No Orders Found
      </div>
    );

  return (
    <div className="overflow-x-auto mt-6">

      <table className="w-full border">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-3">Order</th>

            <th className="p-3">Customer</th>

            <th className="p-3">Amount</th>

            <th className="p-3">Payment</th>

            <th className="p-3">Status</th>

            <th className="p-3">Date</th>

            <th className="p-3">Action</th>

          </tr>

        </thead>

        <tbody>

          {orders.map((order) => (

            <tr
              key={order._id}
              className="border-t hover:bg-gray-50"
            >

              <td className="p-3">
                #{order._id.slice(-6)}
              </td>

              <td className="p-3">
                {order.userId?.name || "User"}
              </td>

              <td className="p-3">
                ₹{order.totalAmount}
              </td>

              <td className="p-3">
                {order.paymentMethod}
              </td>

              <td className="p-3">

                <select
                  value={order.status}
                  onChange={(e)=>
                    updateStatus(
                      order._id,
                      e.target.value
                    )
                  }
                  className="border rounded px-2 py-1"
                >
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>

              </td>

              <td className="p-3">
                {new Date(
                  order.createdAt
                ).toLocaleDateString()}
              </td>

              <td className="p-3 flex gap-3">

                <button
                  onClick={() => onView(order)}
                >
                  <FaEye
                    className="text-blue-600"
                    size={18}
                  />
                </button>

                <button
                  onClick={() =>
                    deleteOrder(order._id)
                  }
                >
                  <FaTrash
                    className="text-red-600"
                    size={18}
                  />
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default OrdersTable;