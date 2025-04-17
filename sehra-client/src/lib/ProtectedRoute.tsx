import { useEffect } from "react";
import { Route, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "./auth";

/**
 * ProtectedRoute Component
 * 
 * Restricts access to routes based on authentication status and user role.
 * Additionally redirects users in the onboarding flow to the appropriate step.
 * 
 * @param path The route path to protect
 * @param component The component to render if access is granted
 * @param allowedRoles Optional array of roles allowed to access this route (defaults to all)
 * @param requirePackage Whether this route requires package selection
 * @param requireWeddingInfo Whether this route requires wedding info to be set
 */
export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles = ["bride", "groom", "family"],
  requirePackage = true,
  requireWeddingInfo = true,
}: {
  path: string;
  component: React.ComponentType;
  allowedRoles?: Array<"bride" | "groom" | "family">;
  requirePackage?: boolean;
  requireWeddingInfo?: boolean;
}) {
  const { 
    user, 
    isLoading, 
    hasSelectedPackage, 
    hasSetWeddingInfo,
    isBride,
    isGroom,
    isFamily
  } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If authenticated but missing required info, redirect to proper onboarding step
    if (user && !isLoading) {
      if (requirePackage && !hasSelectedPackage) {
        setLocation("/package-selection");
        return;
      }
      
      if (requireWeddingInfo && !hasSetWeddingInfo) {
        setLocation("/wedding-info");
        return;
      }
    }
  }, [user, isLoading, hasSelectedPackage, hasSetWeddingInfo, setLocation, requirePackage, requireWeddingInfo]);

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !user ? (
        // Not authenticated, redirect to auth page
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Redirecting to login...</p>
          </div>
          {setTimeout(() => setLocation("/auth"), 1000) && null}
        </div>
      ) : !hasRole(user.role, allowedRoles) ? (
        // Wrong role, show unauthorized
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md p-6 bg-background border rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-destructive">Access Restricted</h2>
            <p className="mb-4">
              You don't have permission to access this page with your current role.
            </p>
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={() => setLocation("/")}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        // Authorized, render the component
        <Component />
      )}
    </Route>
  );
}

// Helper function to check if user's role is in the allowed roles
function hasRole(
  userRole: string | undefined, 
  allowedRoles: Array<"bride" | "groom" | "family">
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as "bride" | "groom" | "family");
}