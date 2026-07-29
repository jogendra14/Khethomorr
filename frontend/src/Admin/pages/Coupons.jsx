import { useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

const dummyCoupons = [
  {
    id: 1,
    code: "WELCOME10",
    discount: "10%",
    expiry: "31 Dec 2026",
    status: "Active",
  },
  {
    id: 2,
    code: "FESTIVE25",
    discount: "25%",
    expiry: "15 Aug 2026",
    status: "Active",
  },
  {
    id: 3,
    code: "NEWUSER15",
    discount: "15%",
    expiry: "01 Sep 2026",
    status: "Expired",
  },
];

export default function Coupons() {
  const [coupons, setCoupons] = useState(dummyCoupons);
  const [search, setSearch] = useState("");

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => coupon.code.toLowerCase().includes(search.toLowerCase()));
  }, [coupons, search]);

  const deleteCoupon = (id) => {
    if (window.confirm("Delete this coupon?")) {
      setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-gray-500">Manage all discount coupons</p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2">
          <Plus size={18} />
          Add Coupon
        </button>
      </div>

      {/* Search */}

      <div className="bg-white rounded-xl shadow mt-6 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search coupon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-4 py-3 outline-none"
          />
        </div>
      </div>

      {/* Table */}

      <div className="bg-white rounded-xl shadow mt-6 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">Coupon Code</th>
              <th className="text-left p-4">Discount</th>
              <th className="text-left p-4">Expiry</th>
              <th className="text-left p-4">Status</th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCoupons.map((coupon) => (
              <tr key={coupon.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-semibold">{coupon.code}</td>

                <td className="p-4">{coupon.discount}</td>

                <td className="p-4">{coupon.expiry}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      coupon.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {coupon.status}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </button>

                    <button onClick={() => deleteCoupon(coupon.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
