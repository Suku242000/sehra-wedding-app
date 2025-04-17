import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { Loader2 } from "lucide-react";

/**
 * RootRedirect Component
 * 
 * Redirects users to appropriate dashboard based on their role.
 * Used for the root path ("/") to ensure users land on relevant pages.
 */
export default function RootRedirect() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
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
          setLocation("/login");
      }
    } else if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}