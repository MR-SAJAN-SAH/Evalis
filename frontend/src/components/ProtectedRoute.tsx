import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, role } = useAuth();

  // Log for debugging
  console.log(`🔐 ProtectedRoute Check:`, {
    isAuthenticated,
    role,
    requiredRole,
    pathname: window.location.pathname,
  });

  if (!isAuthenticated) {
    console.warn(`❌ Not authenticated, redirecting to login`);
    return <Navigate to="/login" replace />;
  }

  // Check if role matches (case-insensitive)
  if (requiredRole) {
    const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const roleMatches = rolesToCheck.some(r => {
      const matches = role?.toLowerCase() === r.toLowerCase();
      console.log(`  Comparing: "${role?.toLowerCase()}" === "${r.toLowerCase()}" => ${matches}`);
      return matches;
    });
    
    if (!roleMatches) {
      console.warn(`❌ Access denied: User role "${role}" does not match required role(s): ${rolesToCheck.join(', ')}`);
      return <Navigate to="/" replace />;
    }
  }

  console.log(`✅ Access granted`);
  return <>{children}</>;
};

export default ProtectedRoute;
