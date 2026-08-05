import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Package, ShoppingBag, Users, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../api/settingsApi.js";

const formatMoney = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(value || 0);

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-blue-50 text-blue-700",
  Shipped: "bg-violet-50 text-violet-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function Dashboard() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    refetchOnWindowFocus: true,
  });

  const cards = [
    { label: "Total revenue", value: formatMoney(stats?.totalRevenue), icon: Wallet, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Orders", value: stats?.totalOrders || 0, icon: ShoppingBag, tone: "bg-blue-50 text-blue-600" },
    { label: "Products", value: stats?.totalProducts || 0, icon: Package, tone: "bg-violet-50 text-violet-600" },
    { label: "Customers", value: stats?.totalUsers || 0, icon: Users, tone: "bg-orange-50 text-orange-600" },
  ];

  if (isError) {
    return <div className="p-6"><div className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-700">Couldn’t load dashboard data. <button onClick={() => refetch()} className="font-semibold underline">Try again</button></div></div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">STORE OVERVIEW</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-gray-500">Keep an eye on the activity that matters today.</p>
        </div>
        <Link to="/admin/add-product" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"><Package size={18} /> Add product</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-start justify-between"><span className={`rounded-lg p-3 ${tone}`}><Icon size={22} /></span><ArrowUpRight size={18} className="text-gray-300" /></div>
            <p className="mt-5 text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{isLoading ? "—" : value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Order status</h2><Link to="/admin/orders" className="text-sm font-medium text-blue-600 hover:underline">View orders</Link></div>
          <div className="mt-6 space-y-5">
            {[
              ["Pending", stats?.pendingOrders || 0, "bg-amber-400"],
              ["Processing", stats?.processingOrders || 0, "bg-blue-500"],
              ["Delivered", stats?.deliveredOrders || 0, "bg-emerald-500"],
            ].map(([label, count, color]) => {
              const percentage = stats?.totalOrders ? Math.round((count / stats.totalOrders) * 100) : 0;
              return <div key={label}><div className="mb-2 flex justify-between text-sm"><span className="text-gray-600">{label}</span><span className="font-semibold">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} /></div></div>;
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between p-6 pb-4"><h2 className="text-lg font-semibold">Recent orders</h2><Link to="/admin/orders" className="text-sm font-medium text-blue-600 hover:underline">Manage orders</Link></div>
          {isLoading ? <div className="p-6 text-gray-500">Loading orders…</div> : stats?.recentOrders?.length ? (
            <div className="divide-y divide-gray-100">
              {stats.recentOrders.map((order) => <div key={order._id} className="flex items-center justify-between gap-4 px-6 py-4"><div className="min-w-0"><p className="truncate font-medium">{order.userId?.name || "Customer"}</p><p className="mt-0.5 text-xs text-gray-500">#{order._id.slice(-6).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString("en-IN")}</p></div><div className="flex shrink-0 items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status] || "bg-gray-100 text-gray-600"}`}>{order.status}</span><span className="font-semibold">{formatMoney(order.totalAmount)}</span></div></div>)}
            </div>
          ) : <div className="p-6 text-sm text-gray-500">No orders yet. New orders will appear here.</div>}
        </section>
      </div>
    </div>
  );
}
