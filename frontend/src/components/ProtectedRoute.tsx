import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'TEAM_MEMBER' | 'MANAGER' | 'ADMIN';
  managerOnly?: boolean;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, managerOnly, adminOnly }: ProtectedRouteProps) {
  const { isAuthenticated, isManager, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (managerOnly && !isManager) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
