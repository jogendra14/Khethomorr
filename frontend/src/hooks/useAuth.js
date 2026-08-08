// frontend/src/hooks/useAuth.js
import { useAuth } from '../context/AuthContext';

export const useAuthState = () => {
  const auth = useAuth();
  
  return {
    ...auth,
    // Additional computed properties
    isLoggedIn: auth.isAuthenticated,
    isAdmin: auth.isAdmin(),
    isVendor: auth.isVendor(),
    isSuperAdmin: auth.isSuperAdmin(),
    userName: auth.user?.name || '',
    userEmail: auth.user?.email || '',
    userRole: auth.user?.role || '',
  };
};

export default useAuthState;