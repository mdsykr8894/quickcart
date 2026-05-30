import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../app/useAuth';
import LoadingState from '../components/LoadingState';

const DashboardRedirect: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Redirecting to your dashboard..." className="py-24" />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // Standard user redirects to shopping page
  return <Navigate to="/shop" replace />;
};

export default DashboardRedirect;
