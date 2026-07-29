import { LayoutDashboard, Package, ShoppingCart, Users, FolderTree, TicketPercent, Image, Settings, LogOut } from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/admin/dashboard",
  },
  {
    name: "Products",
    icon: <Package size={20} />,
    path: "/admin/products",
  },
  {
    name: "Deals",
    icon: <Package size={20} />,
    path: "/admin/deals",
  },
  {
    name: "Orders",
    icon: <ShoppingCart size={20} />,
    path: "/admin/orders",
  },
  {
    name: "Users",
    icon: <Users size={20} />,
    path: "/admin/users",
  },
  {
    name: "Categories",
    icon: <FolderTree size={20} />,
    path: "/admin/categories",
  },
  {
    name: "Coupons",
    icon: <TicketPercent size={20} />,
    path: "/admin/coupons",
  },
  {
    name: "Banner",
    icon: <Image size={20} />,
    path: "/admin/banner",
  },
  {
    name: "Settings",
    icon: <Settings size={20} />,
    path: "/admin/settings",
  },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="text-2xl font-bold p-6 border-b border-slate-700">Admin Panel</div>

      <div className="flex-1 mt-4">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `flex items-center gap-3 px-6 py-4 hover:bg-blue-600 transition ${isActive ? "bg-blue-600" : ""}`}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>

      <button className="flex items-center gap-3 p-6 hover:bg-red-600">
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
}
