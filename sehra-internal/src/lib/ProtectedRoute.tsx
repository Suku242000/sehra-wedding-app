import React from 'react';
import { Route, useLocation } from 'wouter';
import { useAuth } from './auth';

interface ProtectedRouteProps {
  component: React.ComponentType;
  path: string;
  allowedRoles: ('vendor' | 'supervisor' | 'admin')[];
}

export function ProtectedRoute({ 
  component: Component, 
  path, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <Route
      path={path}
      component={() => {
        // Show loading spinner while checking authentication
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
            </div>
          );
        }

        // Redirect to login if not authenticated
        if (!user) {
          // Use a side effect to redirect
          React.useEffect(() => {
            setLocation('/login');
          }, [setLocation]);

          // Return loading spinner while redirect happens
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
            </div>
          );
        }

        // Check if user has required role
        if (!allowedRoles.includes(user.role as any)) {
          // Use a side effect to redirect
          React.useEffect(() => {
            setLocation('/unauthorized');
          }, [setLocation]);

          // Return loading spinner while redirect happens
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
            </div>
          );
        }

        // Render the protected component
        return <Component />;
      }}
    />
  );
}