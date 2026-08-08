// frontend/src/context/AuthContext.jsx

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

import authApi from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // LOAD USER FROM LOCAL STORAGE
  // ============================================
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = authApi.getCurrentUser();
        const token = localStorage.getItem("token");

        if (storedUser && token) {
          setUser(storedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Error loading auth:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
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
  }, []);

  // ============================================
  // LOGOUT
  // ============================================
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      setUser(null);

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
    }
  }, []);

  // ============================================
  // ADMIN CHECK
  // ============================================
  const isAdmin = useCallback(() => {
    return user
      ? ["admin", "superadmin"].includes(user.role)
      : false;
  }, [user]);

  // ============================================
  // VENDOR CHECK
  // ============================================
  const isVendor = useCallback(() => {
    return user?.role === "vendor";
  }, [user]);

  // ============================================
  // AUTHENTICATED CHECK
  // ============================================
  const isAuthenticated =
    !!user && !!localStorage.getItem("token");

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    user,
    setUser,
    loading,

    login,
    logout,

    isAdmin: isAdmin(),
    isVendor: isVendor(),
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// USE AUTH HOOK
// ============================================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export default AuthContext;