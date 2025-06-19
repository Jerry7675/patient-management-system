import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function RoleRoute({ children, allowedRoles = [] }) {
  const { user, role, loading } = useAuthContext();

  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return children;
}
