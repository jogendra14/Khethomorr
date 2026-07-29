import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("admin");

  return isAdmin ? children : <Navigate to="/AdminLogin" replace />;
};

export default AdminProtectedRoute;