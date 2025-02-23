import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import RenterDashboard from './RenterDashboard';
import OwnerDashboard from './OwnerDashboard';

export default function Dashboard() {
  const { userData, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!userData) {
    // Handle the case where role isn't set
    return <Navigate to="/login" />;
  }

  // Route to appropriate dashboard based on role
  console.log(userData);
  return userData.role === 'owner' ? <OwnerDashboard /> : <RenterDashboard />;
}
