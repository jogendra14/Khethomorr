import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, requireAdmin = true }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const adminData = localStorage.getItem("admin");

      // ✅ If no token, redirect to login
      if (!token) {
        setIsAuthorized(false);
        setChecking(false);
        return;
      }

      // ✅ If admin route, check admin data
      if (requireAdmin) {
        if (!adminData) {
          toast.error("Admin access required");
          setIsAuthorized(false);
          setChecking(false);
          return;
        }

        try {
          const admin = JSON.parse(adminData);
          
          // ✅ Check if user has admin role
          if (admin.role !== "admin") {
            toast.error("Access Denied. Admin only.");
            setIsAuthorized(false);
            setChecking(false);
            return;
          }

          setIsAuthorized(true);
          setChecking(false);
        } catch (error) {
          console.error("Error parsing admin data:", error);
          localStorage.removeItem("admin");
          toast.error("Session expired. Please login again.");
          setIsAuthorized(false);
          setChecking(false);
        }
      } else {
        // ✅ Non-admin route - just check authentication
        setIsAuthorized(isAuthenticated);
        setChecking(false);
      }
    };

    // ✅ Wait for auth to load
    if (!loading) {
      checkAuth();
    }
  }, [loading, isAuthenticated, requireAdmin]);

  // ✅ Show loading state
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ✅ Redirect if not authorized
  if (!isAuthorized) {
    if (requireAdmin) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // ✅ Render children if authorized
  return children;
};

export default ProtectedRoute;