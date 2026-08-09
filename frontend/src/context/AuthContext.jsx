// frontend/src/context/AuthContext.jsx

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import authApi from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // ============================================
  // LOAD USER FROM LOCAL STORAGE ON MOUNT
  // ============================================
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } else {
          // Clear if no token
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("❌ Error loading auth:", error);
        setUser(null);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ============================================
  // VERIFY TOKEN ON MOUNT (Optional - if you want to validate with backend)
  // ============================================
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        const userData = response.data.data || response.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        // Token invalid - clear auth
        if (error.response?.status === 401) {
          console.log("Token expired, clearing auth");
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      } finally {
        setLoading(false);
      }
    };

    // Uncomment below if you want to verify token with backend on every refresh
    // verifyUser();
  }, []);

  // ============================================
  // LOGIN
  // ============================================
  const login = useCallback((userData, token, refreshToken = null) => {
    setUser(userData);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    // Invalidate queries to refetch user-specific data
    queryClient.invalidateQueries(["cart"]);
    queryClient.invalidateQueries(["wishlist"]);
    queryClient.invalidateQueries(["orders"]);
  }, [queryClient]);

  // ============================================
  // LOGOUT
  // ============================================
  const logout = useCallback(async () => {
    try {
      // Try to call logout API (but don't block if fails)
      await authApi.logout().catch(() => {});
    } catch (error) {
      console.error("❌ Logout API error:", error);
    } finally {
      // Clear user state
      setUser(null);

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("admin");

      // Clear all React Query cache
      queryClient.clear();
      
      // Redirect to home (if needed)
      window.location.href = "/";
    }
  }, [queryClient]);

  // ============================================
  // UPDATE USER (For profile updates)
  // ============================================
  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  // ============================================
  // REFRESH USER FROM BACKEND
  // ============================================
  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      const userData = response.data.data || response.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      return null;
    }
  }, []);

  // ============================================
  // PERMISSION CHECKS
  // ============================================
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role === "superadmin";
  const isVendor = user?.role === "vendor";
  const isUser = user?.role === "user";
  const isAuthenticated = !!user && !!localStorage.getItem("token");

  // ============================================
  // HAS PERMISSION CHECK (For specific actions)
  // ============================================
  const hasPermission = useCallback((requiredRoles = []) => {
    if (!user) return false;
    if (requiredRoles.length === 0) return true;
    return requiredRoles.includes(user.role);
  }, [user]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    user,
    setUser,
    loading,

    // Auth actions
    login,
    logout,
    updateUser,
    refreshUser,

    // Permission checks
    isAdmin,
    isSuperAdmin,
    isVendor,
    isUser,
    isAuthenticated,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        // Optional: Loading screen while checking auth
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

// ============================================
// USE AUTH HOOK
// ============================================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider. Wrap your app with <AuthProvider>."
    );
  }

  return context;
};

// ============================================
// CUSTOM HOOK: USE ADMIN (Shortcut)
// ============================================
export const useAdmin = () => {
  const { user, isAdmin, loading } = useAuth();
  return { user, isAdmin, loading };
};

export default AuthContext;