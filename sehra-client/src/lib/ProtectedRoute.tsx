import { ReactNode, FC } from "react";
import { Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "./auth";

type ClientRole = "bride" | "groom" | "family";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ClientRole[];
  redirectTo?: string;
  requirePackage?: boolean;
}

/**
 * ProtectedRoute component for client application
 * - Requires authentication
 * - Optionally restricts access based on user role
 * - Can require package selection
 */
export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = "/auth",
  requirePackage = false,
}) => {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Show loading state while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth page if not logged in
  if (!user) {
    return <Redirect to={redirectTo} />;
  }

  // Check if user has the required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role as ClientRole)) {
      return <Redirect to="/" />;
    }
  }

  // Check if package selection is required
  if (requirePackage && !user.package) {
    // Only redirect if not already on the select-package page
    if (location !== "/select-package") {
      return <Redirect to="/select-package" />;
    }
  }

  return <>{children}</>;
};