import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  console.log("ProtectedRoute Render");

  const admin = JSON.parse(localStorage.getItem("admin"));

  console.log(admin);

  // ✅ FIX: "admin" OR "superadmin" dono allow karo
  if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) {
    console.log("Redirecting to Login");
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;