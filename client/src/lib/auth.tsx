import { UserRoleType } from '@shared/schema';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import React, { useEffect } from 'react';

// ProtectedRoute component props
interface ProtectedRouteProps {
  children: React.ReactNode | (() => React.ReactNode);
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
        const lowerCaseRole = user.role.toLowerCase();
        if (lowerCaseRole === 'admin') {
          setLocation('/admin-dashboard');
        } else if (lowerCaseRole === 'vendor') {
          setLocation('/vendor-dashboard');
        } else if (lowerCaseRole === 'supervisor') {
          setLocation('/supervisor-dashboard');
        } else {
          setLocation('/dashboard');
        }
        return;
      }
      
      // Redirect to package selection if package is required but not selected
      // Skip package requirement for supervisors, vendors and admins
      if (requirePackage && user && !user.package && 
          !['supervisor', 'vendor', 'admin'].includes(user.role.toLowerCase())) {
        setLocation('/select-package');
        return;
      }
    }
  }, [isAuthenticated, user, loading, requiredRoles, requirePackage, setLocation]);
  
  // Show nothing while checking authentication or redirecting
  if (loading || !isAuthenticated || 
      (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role as UserRoleType)) ||
      (requirePackage && user && !user.package && 
       !['supervisor', 'vendor', 'admin'].includes(user.role.toLowerCase()))) {
    return null;
  }
  
  // Check if children is a function and call it if it is
  return <>{typeof children === 'function' ? children() : children}</>;
};

/**
 * Higher-order component for public routes (redirect if already authenticated)
 */
export const PublicRoute: React.FC<{ children: React.ReactNode | (() => React.ReactNode), noRedirect?: boolean }> = ({ children, noRedirect = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // Wait for authentication check to complete
    // Only redirect if noRedirect is false
    if (!noRedirect && !loading && isAuthenticated && user) {
      // Redirect based on user's role
      const lowerCaseRole = user.role.toLowerCase();
      if (lowerCaseRole === 'admin') {
        setLocation('/admin-dashboard');
      } else if (lowerCaseRole === 'vendor') {
        setLocation('/vendor-dashboard');
      } else if (lowerCaseRole === 'supervisor') {
        setLocation('/supervisor-dashboard');
      } else if (user.package) {
        setLocation('/dashboard');
      } else {
        setLocation('/select-package');
      }
    }
  }, [isAuthenticated, user, loading, setLocation, noRedirect]);
  
  // Show nothing while checking authentication or redirecting
  // But if noRedirect is true, always render children regardless of auth state
  if (!noRedirect && (loading || (isAuthenticated && user))) {
    // Special case: if we're on select-package and user is a supervisor, vendor, or admin, allow rendering
    if (location === "/select-package" && user && 
        ['supervisor', 'vendor', 'admin'].includes(user.role.toLowerCase())) {
      return <>{typeof children === 'function' ? children() : children}</>;
    }
    return null;
  }
  
  return <>{typeof children === 'function' ? children() : children}</>;
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
  const lowerCaseUserRole = user.role.toLowerCase();
  return rolesToCheck.some(role => role.toLowerCase() === lowerCaseUserRole);
};
