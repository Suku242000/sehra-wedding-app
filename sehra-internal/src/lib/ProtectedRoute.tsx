import { ReactNode, FC } from "react";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth, InternalRole } from "./auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: InternalRole[];
  redirectTo?: string;
}

/**
 * ProtectedRoute component for internal application
 * - Requires authentication
 * - Optionally restricts access based on staff role
 */
export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = "/login",
}) => {
  const { user, isLoading } = useAuth();

  // Show loading state while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login page if not logged in
  if (!user) {
    return <Redirect to={redirectTo} />;
  }

  // Check if user has the required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role as InternalRole)) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case "vendor":
          return <Redirect to="/vendor-dashboard" />;
        case "supervisor":
          return <Redirect to="/supervisor-dashboard" />;
        case "admin":
          return <Redirect to="/admin-dashboard" />;
        default:
          return <Redirect to="/" />;
      }
    }
  }

  return <>{children}</>;
};