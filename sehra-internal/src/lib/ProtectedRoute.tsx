import { ReactNode } from "react";
import { Route, Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth, InternalUser } from "./auth";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  roles?: Array<"vendor" | "supervisor" | "admin">;
}

/**
 * ProtectedRoute component for the internal application
 * - Redirects to /login if user is not authenticated
 * - Handles loading state during authentication check
 * - Supports role-based access restriction for internal roles
 */
export function ProtectedRoute({ 
  path, 
  component: Component, 
  roles 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Redirect to login page if not logged in
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/login" />
      </Route>
    );
  }

  // If roles are specified, check if user has the required role
  if (roles && roles.length > 0) {
    const hasRequiredRole = roles.includes(user.role as "vendor" | "supervisor" | "admin");
    
    if (!hasRequiredRole) {
      return (
        <Route path={path}>
          <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page.
            </p>
            <a 
              href="/" 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Return to Dashboard
            </a>
          </div>
        </Route>
      );
    }
  }

  // If all checks pass, render the protected component
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}