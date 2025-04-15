import { UserRoleType } from '@shared/schema';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import React, { useEffect } from 'react';

// ProtectedRoute component props
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRoleType[];
  requirePackage?: boolean;
}

/**
 * Higher-order component for protected routes
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requirePackage = false,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // Wait for authentication check to complete
    if (!loading) {
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        setLocation('/auth');
        return;
      }
      
      // Redirect if user doesn't have required role
      if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role as UserRoleType)) {
        // Redirect based on user's role
        if (user.role === 'admin') {
          setLocation('/admin-dashboard');
        } else if (user.role === 'vendor') {
          setLocation('/vendor-dashboard');
        } else if (user.role === 'supervisor') {
          setLocation('/supervisor-dashboard');
        } else {
          setLocation('/dashboard');
        }
        return;
      }
      
      // Redirect to package selection if package is required but not selected
      if (requirePackage && user && !user.package) {
        setLocation('/select-package');
        return;
      }
    }
  }, [isAuthenticated, user, loading, requiredRoles, requirePackage, setLocation]);
  
  // Show nothing while checking authentication or redirecting
  if (loading || !isAuthenticated || 
      (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role as UserRoleType)) ||
      (requirePackage && user && !user.package)) {
    return null;
  }
  
  return <>{children}</>;
};

/**
 * Higher-order component for public routes (redirect if already authenticated)
 */
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Wait for authentication check to complete
    if (!loading && isAuthenticated && user) {
      // Redirect based on user's role
      if (user.role === 'admin') {
        setLocation('/admin-dashboard');
      } else if (user.role === 'vendor') {
        setLocation('/vendor-dashboard');
      } else if (user.role === 'supervisor') {
        setLocation('/supervisor-dashboard');
      } else if (user.package) {
        setLocation('/dashboard');
      } else {
        setLocation('/select-package');
      }
    }
  }, [isAuthenticated, user, loading, setLocation]);
  
  // Show nothing while checking authentication or redirecting
  if (loading || (isAuthenticated && user)) {
    return null;
  }
  
  return <>{children}</>;
};

/**
 * Custom hook to check if user has specific role
 */
export const useHasRole = (roles: UserRoleType | UserRoleType[]): boolean => {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  const rolesToCheck = Array.isArray(roles) ? roles : [roles];
  return rolesToCheck.includes(user.role as UserRoleType);
};
