import { ReactNode, createContext, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  BaseAuthProvider, 
  User, 
  useAuth as useBaseAuth 
} from "@shared/hooks/useAuth";
import { useToast } from "@shared/hooks/useToast";
import { apiRequest, queryClient } from "@shared/lib/queryClient";

// Internal-specific user interface extending the base user
export interface InternalUser extends User {
  // Vendor-specific fields
  vendorProfile?: {
    id: number;
    businessName: string;
    vendorType: string;
    sqsScore?: number;
    tier?: "standard" | "gold" | "premium";
    approvalStatus?: "pending" | "approved" | "rejected";
    joinedDate?: string;
  };
  
  // Supervisor-specific fields
  supervisorProfile?: {
    id: number;
    departmentId: number;
    departmentName: string;
    assignedCustomerCount: number;
    assignedVendorCount: number;
    performanceMetrics?: {
      responseTime: number;
      customerSatisfaction: number;
      taskCompletionRate: number;
    };
  };
  
  // Admin-specific fields
  adminProfile?: {
    id: number;
    accessLevel: number;
    permissions: string[];
    lastLogin: string;
  };
}

// Internal-specific auth context type
interface InternalAuthContextType {
  user: InternalUser | null;
  isLoading: boolean;
  error: Error | null;
  isVendor: boolean;
  isSupervisor: boolean;
  isAdmin: boolean;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
  updateVendorProfileMutation: any;
}

// Create the context
const InternalAuthContext = createContext<InternalAuthContextType | null>(null);

/**
 * Internal-specific AuthProvider
 * - Extends the BaseAuthProvider
 * - Adds role-specific authentication features for staff roles
 */
export function InternalAuthProvider({ children }: { children: ReactNode }) {
  // API endpoints
  const LOGIN_ENDPOINT = "/api/internal/login";
  const LOGOUT_ENDPOINT = "/api/internal/logout";
  const REGISTER_ENDPOINT = "/api/internal/register";
  const USER_ENDPOINT = "/api/internal/user";
  const VENDOR_PROFILE_ENDPOINT = "/api/internal/vendor-profile";

  return (
    <BaseAuthProvider
      loginEndpoint={LOGIN_ENDPOINT}
      logoutEndpoint={LOGOUT_ENDPOINT}
      registerEndpoint={REGISTER_ENDPOINT}
      userEndpoint={USER_ENDPOINT}
    >
      <InternalAuthExtension
        vendorProfileEndpoint={VENDOR_PROFILE_ENDPOINT}
      >
        {children}
      </InternalAuthExtension>
    </BaseAuthProvider>
  );
}

// Extension component to add internal-specific auth context
function InternalAuthExtension({ 
  children,
  vendorProfileEndpoint,
}: { 
  children: ReactNode; 
  vendorProfileEndpoint: string;
}) {
  const baseAuth = useBaseAuth();
  const { toast } = useToast();

  // Cast user to InternalUser
  const user = baseAuth.user as InternalUser | null;
  
  // Role-based helper properties
  const isVendor = !!(user?.role === "vendor");
  const isSupervisor = !!(user?.role === "supervisor");
  const isAdmin = !!(user?.role === "admin");

  // Update vendor profile mutation
  const updateVendorProfileMutation = useMutation({
    mutationFn: async (vendorProfileData: Partial<InternalUser["vendorProfile"]>) => {
      const res = await apiRequest("PATCH", vendorProfileEndpoint, vendorProfileData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update vendor profile");
      }
      return await res.json();
    },
    onSuccess: (userData: InternalUser) => {
      queryClient.setQueryData(["/api/internal/user"], userData);
      toast({
        title: "Profile updated",
        description: "Your vendor profile has been updated successfully.",
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

  // Enhanced context value
  const contextValue: InternalAuthContextType = {
    ...baseAuth,
    user,
    isVendor,
    isSupervisor,
    isAdmin,
    updateVendorProfileMutation,
  };

  return (
    <InternalAuthContext.Provider value={contextValue}>
      {children}
    </InternalAuthContext.Provider>
  );
}

// Hook for accessing internal auth context
export function useAuth() {
  const context = useContext(InternalAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an InternalAuthProvider");
  }
  return context;
}