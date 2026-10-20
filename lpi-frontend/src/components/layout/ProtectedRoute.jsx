import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../ui/LoadingState';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingState fullPage message="Loading..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
