// frontend/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  redirectTo = '/login' 
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role requirements
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user?.role);
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children || <Outlet />;
};

export default ProtectedRoute;