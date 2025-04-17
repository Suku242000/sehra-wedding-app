import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";

/**
 * RootRedirect component for the internal application
 * - Redirects users to their appropriate dashboard based on their role
 * - Shows loading state during authentication check
 * - Falls back to login page if user is not authenticated
 */
export default function RootRedirect() {
  const { user, isLoading, isVendor, isSupervisor, isAdmin } = useAuth();
  
  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect to login page if not logged in
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  // Redirect to the appropriate dashboard based on role
  if (isVendor) {
    return <Redirect to="/vendor-dashboard" />;
  }
  
  if (isSupervisor) {
    return <Redirect to="/supervisor-dashboard" />;
  }
  
  if (isAdmin) {
    return <Redirect to="/admin-dashboard" />;
  }
  
  // Fallback for unknown role (shouldn't happen in normal cases)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold text-destructive mb-2">Invalid Role</h2>
      <p className="text-muted-foreground mb-4">
        Your user account has an unsupported role. Please contact an administrator.
      </p>
      <a 
        href="/login" 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        onClick={() => {
          // Attempt to log out before redirecting
          try {
            const { logoutMutation } = useAuth();
            if (logoutMutation) {
              logoutMutation.mutate();
            }
          } catch (err) {
            console.error("Logout failed:", err);
          }
        }}
      >
        Return to Login
      </a>
    </div>
  );
}