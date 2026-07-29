import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { Outlet } from "react-router-dom";


export default function AdminLayout() {
  return (
    <div className="flex bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <Outlet />
      </div>
    </div>
  );
}
