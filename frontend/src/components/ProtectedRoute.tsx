import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  // Determine the user type based on the path
  let userType: 'patient' | 'hospital' | 'doctor' = 'patient'; // Default to 'patient' for routes not explicitly tied to hospital/doctor
  if (path.includes('hospital')) userType = 'hospital';
  if (path.includes('doctor')) userType = 'doctor';

  // Check for the appropriate token in localStorage
  const token = localStorage.getItem(`${userType}Token`);

  if (!token) {
    // Redirect to the appropriate login page if not authenticated
    return <Navigate to={`/login/${userType}`} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;