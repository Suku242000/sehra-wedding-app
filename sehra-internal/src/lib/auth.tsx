import { ReactNode } from "react";
import { 
  BaseAuthProvider, 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  useAuth as useBaseAuth
} from "../../../shared/src/hooks/useAuth";
import { useToast } from "../../../shared/src/hooks/useToast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../../../shared/src/lib/queryClient";

// Extended user type for vendor users in the internal application
export interface VendorUser extends User {
  vendorType?: string;
  businessName?: string;
  sqsScore?: number;
  tier?: 'regular' | 'gold' | 'premium';
  contactInfo?: {
    phone?: string;
    address?: string;
    website?: string;
  };
  services?: string[];
}

// Extended user type for supervisor users in the internal application
export interface SupervisorUser extends User {
  assignedClients?: number[];
  specialization?: string;
  region?: string;
  contactInfo?: {
    phone?: string;
    workEmail?: string;
  };
  performanceMetrics?: {
    clientSatisfaction?: number;
    responseTime?: number;
    successfulEvents?: number;
  };
}

// Extended user type for admin users in the internal application
export interface AdminUser extends User {
  department?: string;
  accessLevel?: string;
  permissions?: string[];
}

// Union type for all internal user types
export type InternalUser = VendorUser | SupervisorUser | AdminUser;

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use the base auth provider but with internal-specific endpoints
  return (
    <BaseAuthProvider
      loginEndpoint="/api/internal/login"
      logoutEndpoint="/api/internal/logout"
      registerEndpoint="/api/internal/register"
      userEndpoint="/api/internal/user"
    >
      <InternalAuthExtension>{children}</InternalAuthExtension>
    </BaseAuthProvider>
  );
}

// This component extends the base auth with internal-specific functionality
function InternalAuthExtension({ children }: { children: ReactNode }) {
  const baseAuth = useBaseAuth();
  const { toast } = useToast();

  // Fetch vendor profile data if the user is a vendor
  const { data: vendorProfile } = useQuery({
    queryKey: ["/api/internal/vendor-profile"],
    queryFn: async () => {
      try {
        if (!baseAuth.user || baseAuth.user.role !== "vendor") return null;
        
        const res = await apiRequest("GET", "/api/internal/vendor-profile");
        if (!res.ok) {
          throw new Error("Failed to fetch vendor profile");
        }
        return await res.json();
      } catch (err) {
        return null;
      }
    },
    enabled: !!baseAuth.user && baseAuth.user.role === "vendor",
  });

  // Fetch supervisor dashboard data if the user is a supervisor
  const { data: supervisorDashboard } = useQuery({
    queryKey: ["/api/internal/supervisor-dashboard"],
    queryFn: async () => {
      try {
        if (!baseAuth.user || baseAuth.user.role !== "supervisor") return null;
        
        const res = await apiRequest("GET", "/api/internal/supervisor-dashboard");
        if (!res.ok) {
          throw new Error("Failed to fetch supervisor dashboard data");
        }
        return await res.json();
      } catch (err) {
        return null;
      }
    },
    enabled: !!baseAuth.user && baseAuth.user.role === "supervisor",
  });

  // Fetch admin stats if the user is an admin
  const { data: adminStats } = useQuery({
    queryKey: ["/api/internal/admin-stats"],
    queryFn: async () => {
      try {
        if (!baseAuth.user || baseAuth.user.role !== "admin") return null;
        
        const res = await apiRequest("GET", "/api/internal/admin-stats");
        if (!res.ok) {
          throw new Error("Failed to fetch admin statistics");
        }
        return await res.json();
      } catch (err) {
        return null;
      }
    },
    enabled: !!baseAuth.user && baseAuth.user.role === "admin",
  });

  // Mutation for updating vendor profile
  const updateVendorProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<VendorUser>) => {
      const res = await apiRequest("PATCH", "/api/internal/vendor-profile", profileData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update vendor profile");
      }
      return await res.json();
    },
    onSuccess: (userData: VendorUser) => {
      queryClient.setQueryData(["/api/internal/vendor-profile"], userData);
      toast({
        title: "Profile Updated",
        description: "Your vendor profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating supervisor profile
  const updateSupervisorProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<SupervisorUser>) => {
      const res = await apiRequest("PATCH", "/api/internal/supervisor-profile", profileData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update supervisor profile");
      }
      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Extended auth context that includes internal-specific functionality
  const extendedAuth = {
    ...baseAuth,
    user: baseAuth.user as InternalUser | null,
    vendorProfile: baseAuth.user?.role === "vendor" ? vendorProfile : null,
    supervisorDashboard: baseAuth.user?.role === "supervisor" ? supervisorDashboard : null,
    adminStats: baseAuth.user?.role === "admin" ? adminStats : null,
    updateVendorProfileMutation,
    updateSupervisorProfileMutation,
    // Helper functions for type checking
    isVendor: !!baseAuth.user && baseAuth.user.role === "vendor",
    isSupervisor: !!baseAuth.user && baseAuth.user.role === "supervisor",
    isAdmin: !!baseAuth.user && baseAuth.user.role === "admin",
  };

  return (
    <>
      {children}
    </>
  );
}

// Hook for accessing auth context in internal app
export function useAuth() {
  const baseAuth = useBaseAuth();
  
  // Cast the user to InternalUser type
  return {
    ...baseAuth,
    user: baseAuth.user as InternalUser | null,
    // Helper functions for type checking
    isVendor: !!baseAuth.user && baseAuth.user.role === "vendor",
    isSupervisor: !!baseAuth.user && baseAuth.user.role === "supervisor",
    isAdmin: !!baseAuth.user && baseAuth.user.role === "admin",
  };
}