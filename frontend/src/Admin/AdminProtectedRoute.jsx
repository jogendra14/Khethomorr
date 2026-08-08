import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, requireAdmin = true }) => {
  const { isAuthenticated, loading } = useAuth();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const adminData = localStorage.getItem("admin");

      // No token = not logged in
      if (!token) {
        setIsAuthorized(false);
        setChecking(false);
        return;
      }

      // Admin route
      if (requireAdmin) {
        // Admin data missing
        if (!adminData) {
          toast.error("Admin access required");
          setIsAuthorized(false);
          setChecking(false);
          return;
        }

        try {
          const admin = JSON.parse(adminData);

          // Allow both admin and superadmin
          if (!["admin", "superadmin"].includes(admin.role)) {
            toast.error("Access Denied. Admin only.");
            setIsAuthorized(false);
            setChecking(false);
            return;
          }

          // Authorized
          setIsAuthorized(true);
          setChecking(false);
        } catch (error) {
          console.error("❌ Error parsing admin data:", error);

          localStorage.removeItem("admin");

          toast.error("Session expired. Please login again.");

          setIsAuthorized(false);
          setChecking(false);
        }
      } else {
        // Normal authenticated route
        setIsAuthorized(isAuthenticated);
        setChecking(false);
      }
    };

    checkAuth();
  }, [loading, isAuthenticated, requireAdmin]);

  // Loading / checking authentication
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>

          <p className="mt-4 text-gray-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    if (requireAdmin) {
      return <Navigate to="/admin/login" replace />;
    }

    return <Navigate to="/admin/login" replace />;
  }

  // Authorized
  return children;
};

export default ProtectedRoute;