import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../app/useAuth';
import LoadingState from '../components/LoadingState';

/**
 * GuestOnlyRoute — renders child routes only for unauthenticated users.
 * Authenticated users are redirected:
 *   - ADMIN role  → /admin
 *   - others      → /profile
 */
export const GuestOnlyRoute: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingState message="Verifying session..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/profile'} replace />;
  }

  return <Outlet />;
};
