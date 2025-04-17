import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";

/**
 * RootRedirect component
 * - Redirects users to their appropriate dashboard based on role
 * - Shows loading indicator while authentication state is determined
 */
export default function RootRedirect() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user role
      switch (user.role) {
        case "vendor":
          setLocation("/vendor-dashboard");
          break;
        case "supervisor":
          setLocation("/supervisor-dashboard");
          break;
        case "admin":
          setLocation("/admin-dashboard");
          break;
        default:
          // If role is unknown, redirect to login
          setLocation("/login");
      }
    } else if (!isLoading && !user) {
      // Redirect to login if user is not logged in
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );
}