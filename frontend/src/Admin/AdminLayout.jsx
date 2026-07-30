import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { Outlet } from "react-router-dom";


export default function AdminLayout() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="ml-64">
        <Topbar />

        <main className="pt-14 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
