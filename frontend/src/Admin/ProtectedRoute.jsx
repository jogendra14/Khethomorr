import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  const location = useLocation();

  // Auth check abhi chal raha hai
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  // Login nahi hai
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Login hai, lekin admin nahi hai
  if (!isAdmin ) {
    return <Navigate to="/" replace />;
  }

  // Admin hai → requested route allow
  return <Outlet />;
};

export default ProtectedRoute;