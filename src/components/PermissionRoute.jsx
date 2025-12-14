import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PermissionRoute = ({ requiredRole, requiredPermission, redirectPath = "/dashboard" }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a loader

  let isAllowed = true;

  // Check Role
  if (requiredRole && user?.role !== requiredRole) {
    isAllowed = false;
  }

  // Check Permission
  if (requiredPermission && user?.permissions?.[requiredPermission] !== true) {
    isAllowed = false;
  }

  return isAllowed ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default PermissionRoute;
