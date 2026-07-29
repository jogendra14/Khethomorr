import { FaTimes } from "react-icons/fa";

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">

      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}

        <div className="flex items-center justify-between border-b p-5">

          <div>
            <h2 className="text-2xl font-bold">
              Order Details
            </h2>

            <p className="text-gray-500">
              #{order._id}
            </p>
          </div>

          <button onClick={onClose}>
            <FaTimes size={22} />
          </button>

        </div>

        <div className="p-6 space-y-6">

          {/* Customer */}

          <div className="border rounded-lg p-4">

            <h3 className="font-semibold text-lg mb-3">
              Customer Information
            </h3>

            <p>
              <strong>Name :</strong>{" "}
              {order.userId?.name || "N/A"}
            </p>

            <p>
              <strong>Email :</strong>{" "}
              {order.userId?.email || "N/A"}
            </p>

          </div>

          {/* Address */}

          <div className="border rounded-lg p-4">

            <h3 className="font-semibold text-lg mb-3">
              Delivery Address
            </h3>

            <p>{order.address?.fullName}</p>

            <p>{order.address?.street}</p>

            <p>
              {order.address?.city},{" "}
              {order.address?.postalCode}
            </p>

            <p>{order.address?.country}</p>

          </div>

          {/* Products */}

          <div className="border rounded-lg p-4">

            <h3 className="font-semibold text-lg mb-4">
              Ordered Products
            </h3>

            <div className="space-y-4">

              {order.items?.map((item) => (

                <div
                  key={item._id}
                  className="flex justify-between items-center border-b pb-3"
                >

                  <div>

                    <h4 className="font-medium">
                      {item.productId?.name || "Product"}
                    </h4>

                    <p className="text-gray-500">
                      Qty : {item.qty}
                    </p>

                  </div>

                  <div className="font-semibold">
                    ₹{item.price}
                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* Payment */}

          <div className="grid md:grid-cols-2 gap-4">

            <div className="border rounded-lg p-4">

              <h3 className="font-semibold mb-2">
                Payment
              </h3>

              <p>
                <strong>Method :</strong>{" "}
                {order.paymentMethod}
              </p>

              <p>
                <strong>Status :</strong>{" "}
                {order.paymentStatus}
              </p>

              <p>
                <strong>Payment ID :</strong>{" "}
                {order.paymentId || "N/A"}
              </p>

            </div>

            <div className="border rounded-lg p-4">

              <h3 className="font-semibold mb-2">
                Order Summary
              </h3>

              <p>
                <strong>Status :</strong>{" "}
                {order.status}
              </p>

              <p>
                <strong>Total :</strong>{" "}
                ₹{order.totalAmount}
              </p>

              <p>
                <strong>Date :</strong>{" "}
                {new Date(
                  order.createdAt
                ).toLocaleString()}
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default OrderDetailsModal;