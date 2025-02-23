import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import RenterDashboard from './RenterDashboard';
import OwnerDashboard from './OwnerDashboard';

export default function Dashboard() {
  const { userData, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <Navigate to="/login" />;
  }

  return userData.role === 'owner' ? <OwnerDashboard /> : <RenterDashboard />;
}
