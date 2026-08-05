import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // ✅ React Query client for cache invalidation
  const queryClient = useQueryClient();

  // ✅ Check if user is logged in on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          // Handle both formats: { user: {...} } or direct user object
          const userObject = parsedUser.user || parsedUser;
          setUser(userObject);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // ✅ Login function with cache clearing
  const login = useCallback((userData, token) => {
    try {
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set state
      const userObject = userData.user || userData;
      setUser(userObject);
      setIsAuthenticated(true);
      
      // ✅ Clear React Query cache on login (optional)
      // queryClient.invalidateQueries();
      
      toast.success('Welcome back! 🎉');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login');
    }
  }, []);

  // ✅ Logout function with cache clearing
  const logout = useCallback(() => {
    try {
      // Remove from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      
      // ✅ Clear React Query cache on logout
      queryClient.clear();
      
      toast.success('Logged out successfully 👋');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }, [queryClient]);

  // ✅ Update user function
  const updateUser = useCallback((updatedUserData) => {
    try {
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedData = {
        ...currentUserData,
        ...updatedUserData
      };
      
      localStorage.setItem('user', JSON.stringify(updatedData));
      setUser(updatedData.user || updatedData);
      
      toast.success('Profile updated successfully ✅');
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Failed to update profile');
    }
  }, []);

  // ✅ Memoized context value
  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    updateUser,
    isAuthenticated,
    loading,
    // ✅ Helper to get auth token
    getToken: () => localStorage.getItem('token'),
    // ✅ Helper to check if user has specific role
    hasRole: (role) => {
      if (!user) return false;
      return user.role === role || user.isAdmin === true;
    },
    // ✅ Helper to get user name
    getUserName: () => {
      if (!user) return '';
      return user.name || user.fullName || user.username || 'User';
    },
    // ✅ Helper to get user email
    getUserEmail: () => {
      if (!user) return '';
      return user.email || '';
    }
  }), [user, login, logout, updateUser, isAuthenticated, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook with error handling
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Export AuthContext for advanced usage
export { AuthContext };