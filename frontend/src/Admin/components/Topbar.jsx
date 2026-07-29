import { Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Topbar() {
  return (
    <div className="bg-white h-16 shadow flex items-center justify-between px-8">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />

          <input type="text" placeholder="Search..." className="border rounded-lg pl-10 pr-4 py-2 w-72" />
        </div>

        <Bell className="cursor-pointer" />

        <Link to="/admin/adminProfile" className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition">
          <img src="https://i.pravatar.cc/100" className="w-10 h-10 rounded-full" alt="Admin" />

          <div>
            <h3 className="font-semibold">Admin</h3>

            <p className="text-sm text-gray-500">Super Admin</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
