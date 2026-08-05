import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Check if user is admin
  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    const token = localStorage.getItem("token");
    
    if (!token || !adminData) {
      toast.error("Please login as admin");
      navigate("/admin/login");
      return;
    }

    try {
      const admin = JSON.parse(adminData);
      if (admin.role !== "admin") {
        toast.error("Access Denied. Admin only.");
        navigate("/admin/login");
      }
    } catch (error) {
      console.error("Error parsing admin data:", error);
      navigate("/admin/login");
    }
  }, [navigate]);

  // ✅ Handle responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ${
          isSidebarOpen && !isMobile ? "ml-64" : "ml-0"
        }`}
      >
        <Topbar 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
        />

        <main className="pt-16 p-4 md:p-6 min-h-screen">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
}