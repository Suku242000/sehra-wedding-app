import { ReactNode } from "react";
import { Route, Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "./auth";

type InternalRole = "vendor" | "supervisor" | "admin";

/**
 * ProtectedRoute Component for Internal App
 * 
 * Restricts access to routes based on authentication status and internal staff roles.
 * 
 * @param path The route path to protect
 * @param component The component to render if access is granted
 * @param allowedRoles Optional array of roles allowed to access this route
 */
export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles,
  children
}: {
  path: string;
  component?: () => JSX.Element;
  allowedRoles?: InternalRole[];
  children?: ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/login" />
      </Route>
    );
  }

  // Check role permissions if allowedRoles are specified
  if (allowedRoles && !hasRole(user.role as InternalRole, allowedRoles)) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // Render the protected component
  if (Component) {
    return <Route path={path} component={Component} />;
  }

  // Or render children
  return <Route path={path}>{children}</Route>;
}

/**
 * Helper function to check if a user has one of the allowed roles
 */
function hasRole(userRole: InternalRole, allowedRoles: InternalRole[]): boolean {
  return allowedRoles.includes(userRole);
}