import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuthContext();

  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
