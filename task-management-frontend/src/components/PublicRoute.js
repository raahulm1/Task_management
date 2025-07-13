import React from 'react';
import { Navigate } from 'react-router-dom';

function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Redirect to dashboard if user is already authenticated
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default PublicRoute; 