import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  const currentPath = window.location.pathname;
  if (user?.role === 'admin' && !currentPath.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }
  if (user?.role === 'user' && !currentPath.startsWith('/user')) {
    return <Navigate to="/user" replace />;
  }

  return children;
};

export default PrivateRoute;

