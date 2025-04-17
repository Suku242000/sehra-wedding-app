import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@shared/lib/queryClient";
import { useToast } from "@shared/hooks/useToast";
import { 
  BaseAuthProvider, 
  User,
  useBaseAuth 
} from "@shared/hooks/useAuth";

// Extended user type with internal-specific properties
export interface InternalUser extends User {
  vendorType?: string;   // For vendors
  specialization?: string; // For vendors
  ratings?: number;      // For vendors
  assignedClients?: number[]; // For supervisors
  adminLevel?: string;   // For admins
  lastActive?: string;
}

// Login credentials type
interface LoginCredentials {
  email: string;
  password: string;
}

// Internal roles
export type InternalRole = "vendor" | "supervisor" | "admin";

// Internal auth context with role-specific methods
interface InternalAuthContextType {
  user: InternalUser | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<InternalUser>) => Promise<void>;
}

export function InternalAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", "/api/staff/login", credentials);
      return await res.json();
    },
    onSuccess: (user: InternalUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
        variant: "success",
      });

      // Redirect based on role
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
          setLocation("/");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<InternalUser>) => {
      const res = await apiRequest("PATCH", "/api/staff/profile", data);
      return await res.json();
    },
    onSuccess: (user: InternalUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Login function
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  // Update profile function
  const updateProfile = async (data: Partial<InternalUser>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  // Custom on logout success handler
  const handleLogoutSuccess = () => {
    setLocation("/login");
  };

  // Extra context values specific to internal app
  const extraContextValues = {
    login,
    updateProfile,
  };

  return (
    <BaseAuthProvider
      authApiEndpoint="/api/staff/user"
      onLogoutSuccess={handleLogoutSuccess}
      extraContextValues={extraContextValues}
    >
      {children}
    </BaseAuthProvider>
  );
}

export function useAuth(): InternalAuthContextType {
  const baseAuth = useBaseAuth();
  return baseAuth as InternalAuthContextType;
}