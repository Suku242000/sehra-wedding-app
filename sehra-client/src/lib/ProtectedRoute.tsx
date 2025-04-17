import { ReactNode } from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from './auth';

interface ProtectedRouteProps {
  path: string;
  component: ReactNode | (() => JSX.Element);
  roles?: ('bride' | 'groom' | 'family')[];
}

export function ProtectedRoute({ path, component: Component, roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        // If specific roles are required, check if the user has one of them
        if (roles && roles.length > 0) {
          if (!roles.includes(user.role as any)) {
            return <Redirect to="/unauthorized" />;
          }
        }

        // If the component is a function component, render it
        if (typeof Component === 'function') {
          return <Component />;
        }

        // Otherwise, render the component directly
        return Component;
      }}
    </Route>
  );
}