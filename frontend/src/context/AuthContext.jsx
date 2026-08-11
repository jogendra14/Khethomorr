// frontend/src/context/AuthContext.jsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useQueryClient } from "@tanstack/react-query";
import authApi from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const queryClient = useQueryClient();

  // Load saved user when app starts
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to load user:", error);

        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login
  const login = useCallback(
    (userData, token, refreshToken = null) => {
      setUser(userData);

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // User-specific data should be fetched again
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    [queryClient]
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      setUser(null);

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("admin");

      queryClient.clear();

      window.location.href = "/";
    }
  }, [queryClient]);

  // Refresh user from backend
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

  // Update user locally
  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  // Authentication status
  const isAuthenticated =
    !!user && !!localStorage.getItem("token");

  // Admin status
  const isAdmin =
    user?.role === "admin" ||
    user?.role === "superadmin";

  const value = {
    user,
    setUser,

    loading,

    login,
    logout,
    refreshUser,
    updateUser,

    isAuthenticated,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />

            <p className="mt-4 text-gray-600">
              Loading...
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthContext;