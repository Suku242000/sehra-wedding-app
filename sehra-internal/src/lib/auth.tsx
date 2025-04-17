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

// Extended user type for internal applications (vendor, supervisor, admin)
export interface InternalUser extends User {
  // Common fields for all internal users
  joinDate?: string;
  lastActive?: string;
  contactDetails?: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  
  // Vendor-specific fields
  vendorId?: number;
  businessName?: string;
  vendorType?: string;
  rating?: number;
  sqsScore?: number;
  sqsCategory?: 'standard' | 'gold' | 'premium';
  
  // Supervisor-specific fields
  assignedClients?: number[];
  supervisorStats?: {
    totalClients: number;
    activeWeddings: number;
    completedWeddings: number;
    clientSatisfaction: number;
  };
  
  // Admin-specific fields
  adminPrivileges?: string[];
  adminStats?: {
    totalUsers: number;
    totalVendors: number;
    totalSupervisors: number;
    totalWeddings: number;
    revenueGenerated: number;
  };
}

// Interface for profile updates
export interface ProfileUpdate {
  name?: string;
  contactDetails?: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

// Main auth provider for internal application
export function AuthProvider({ children }: { children: ReactNode }) {
  // Use the base auth provider with internal-specific endpoints
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
  
  // Fetch notifications for the logged-in user
  const { data: notifications } = useQuery({
    queryKey: ["/api/internal/notifications"],
    queryFn: async () => {
      try {
        if (!baseAuth.user) return null;
        
        const res = await apiRequest("GET", "/api/internal/notifications");
        if (!res.ok) {
          throw new Error("Failed to fetch notifications");
        }
        return await res.json();
      } catch (err) {
        return null;
      }
    },
    enabled: !!baseAuth.user,
  });

  // Fetch messages for the logged-in user
  const { data: unreadMessages } = useQuery({
    queryKey: ["/api/internal/unread-messages"],
    queryFn: async () => {
      try {
        if (!baseAuth.user) return null;
        
        const res = await apiRequest("GET", "/api/internal/unread-messages");
        if (!res.ok) {
          throw new Error("Failed to fetch unread messages");
        }
        return await res.json();
      } catch (err) {
        return null;
      }
    },
    enabled: !!baseAuth.user,
  });

  // For vendors - Fetch vendor profile with SQS score
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

  // For supervisors - Fetch assigned clients
  const { data: assignedClients } = useQuery({
    queryKey: ["/api/internal/assigned-clients"],
    queryFn: async () => {
      try {
        if (!baseAuth.user || baseAuth.user.role !== "supervisor") return null;
        
        const res = await apiRequest("GET", "/api/internal/assigned-clients");
        if (!res.ok) {
          throw new Error("Failed to fetch assigned clients");
        }
        return await res.json();
      } catch (err) {
        return null;
      }
    },
    enabled: !!baseAuth.user && baseAuth.user.role === "supervisor",
  });

  // Mutation for updating profile information
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileUpdate) => {
      const res = await apiRequest("PATCH", "/api/internal/update-profile", profileData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile information");
      }
      return await res.json();
    },
    onSuccess: (userData: InternalUser) => {
      queryClient.setQueryData(["/api/internal/user"], userData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
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
  
  // For vendors - Mutation for updating vendor details
  const updateVendorProfileMutation = useMutation({
    mutationFn: async (vendorData: any) => {
      const res = await apiRequest("PATCH", "/api/internal/update-vendor-profile", vendorData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update vendor information");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/internal/vendor-profile"], data);
      toast({
        title: "Vendor Profile Updated",
        description: "Your vendor profile has been successfully updated.",
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
  
  // For supervisors - Mutation for updating client contact status
  const updateClientContactMutation = useMutation({
    mutationFn: async (data: { clientId: number, status: string, notes?: string }) => {
      const res = await apiRequest("PATCH", "/api/internal/update-client-contact", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update client contact status");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal/assigned-clients"] });
      toast({
        title: "Contact Status Updated",
        description: "The client contact status has been successfully updated.",
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

  // Extended auth context with internal-specific functionality
  const extendedAuth = {
    ...baseAuth,
    user: baseAuth.user as InternalUser | null,
    notifications,
    unreadMessages,
    vendorProfile,
    assignedClients,
    updateProfileMutation,
    updateVendorProfileMutation,
    updateClientContactMutation
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
  
  // Cast the user to InternalUser type and add role-specific helper functions
  return {
    ...baseAuth,
    user: baseAuth.user as InternalUser | null,
    // Role helper functions
    isVendor: !!baseAuth.user && baseAuth.user.role === "vendor",
    isSupervisor: !!baseAuth.user && baseAuth.user.role === "supervisor",
    isAdmin: !!baseAuth.user && baseAuth.user.role === "admin",
    // SQS tier helper function for vendors
    getVendorTier: () => {
      const user = baseAuth.user as InternalUser | null;
      if (!user || user.role !== "vendor") return null;
      return user.sqsCategory || "standard";
    }
  };
}