import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/authService';

const AdminRoute = () => {
  const isAdmin = authService.isAuthenticated() && authService.isAdmin();
  
  if (!isAdmin) {
    // Redirect to login if not authenticated or not admin
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
