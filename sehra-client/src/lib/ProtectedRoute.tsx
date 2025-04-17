import React from 'react';
import { Route, useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@shared/hooks/useAuth';

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
  roles: ('bride' | 'groom' | 'family')[];
};

export function ProtectedRoute({ path, component: Component, roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // If no user is logged in, redirect to auth page
  if (!user) {
    React.useEffect(() => {
      setLocation('/auth');
    }, [setLocation]);
    
    return <Route path={path} component={() => <div />} />;
  }

  // If user doesn't have the required role, redirect to dashboard or show permission error
  if (!roles.includes(user.role as any)) {
    React.useEffect(() => {
      setLocation('/dashboard');
    }, [setLocation]);
    
    return <Route path={path} component={() => <div />} />;
  }

  // If all checks pass, render the protected component
  return <Route path={path} component={Component} />;
}