import { ReactNode, createContext, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  BaseAuthProvider, 
  User, 
  useAuth as useBaseAuth 
} from "@shared/hooks/useAuth";
import { useToast } from "@shared/hooks/useToast";
import { apiRequest, queryClient } from "@shared/lib/queryClient";

// Client-specific user interface extending the base user
export interface ClientUser extends User {
  // Wedding-specific fields
  weddingDate?: string;
  package?: "silver" | "gold" | "platinum";
  location?: string;
  budget?: {
    total: number;
    allocated: number;
    spent: number;
  };
  progress?: {
    tasks: {
      total: number;
      completed: number;
    };
    timeline: {
      total: number;
      completed: number;
    };
  };
  customerId?: string; // For Stripe integration
  familyMembers?: {
    id: number;
    name: string;
    relation: string;
    email?: string;
  }[];
  supervisorId?: number;
}

// Package information interface
export interface PackageInfo {
  name: "silver" | "gold" | "platinum";
  budgetRange: {
    min: number;
    max: number;
  };
  serviceCharge: number;
  features: string[];
}

// Wedding information interface
export interface WeddingInfo {
  date: string;
  location: string;
  budgetEstimate: number;
  package: PackageInfo["name"];
}

// Client-specific auth context type extending base context
interface ClientAuthContextType {
  user: ClientUser | null;
  isLoading: boolean;
  error: Error | null;
  isBride: boolean;
  isGroom: boolean;
  isFamily: boolean;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
  updateWeddingInfoMutation: any;
  updatePackageMutation: any;
  hasSelectedPackage: boolean;
  hasSetWeddingInfo: boolean;
}

// Create the context
const ClientAuthContext = createContext<ClientAuthContextType | null>(null);

/**
 * Client-specific AuthProvider
 * - Extends the BaseAuthProvider
 * - Adds wedding-related authentication features
 */
export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // API endpoints
  const LOGIN_ENDPOINT = "/api/client/login";
  const LOGOUT_ENDPOINT = "/api/client/logout";
  const REGISTER_ENDPOINT = "/api/client/register";
  const USER_ENDPOINT = "/api/client/user";
  const WEDDING_INFO_ENDPOINT = "/api/client/wedding-info";
  const PACKAGE_ENDPOINT = "/api/client/package";

  return (
    <BaseAuthProvider
      loginEndpoint={LOGIN_ENDPOINT}
      logoutEndpoint={LOGOUT_ENDPOINT}
      registerEndpoint={REGISTER_ENDPOINT}
      userEndpoint={USER_ENDPOINT}
    >
      <ClientAuthExtension
        weddingInfoEndpoint={WEDDING_INFO_ENDPOINT}
        packageEndpoint={PACKAGE_ENDPOINT}
      >
        {children}
      </ClientAuthExtension>
    </BaseAuthProvider>
  );
}

// Extension component to add client-specific auth context
function ClientAuthExtension({ 
  children,
  weddingInfoEndpoint,
  packageEndpoint,
}: { 
  children: ReactNode; 
  weddingInfoEndpoint: string;
  packageEndpoint: string;
}) {
  const baseAuth = useBaseAuth();
  const { toast } = useToast();

  // Cast user to ClientUser
  const user = baseAuth.user as ClientUser | null;
  
  // Role-based helper properties
  const isBride = !!(user?.role === "bride");
  const isGroom = !!(user?.role === "groom");
  const isFamily = !!(user?.role === "family");
  
  // Helper properties for onboarding flow
  const hasSelectedPackage = !!(user?.package);
  const hasSetWeddingInfo = !!(user?.weddingDate && user?.location);

  // Update wedding info mutation
  const updateWeddingInfoMutation = useMutation({
    mutationFn: async (weddingInfo: WeddingInfo) => {
      const res = await apiRequest("PATCH", weddingInfoEndpoint, weddingInfo);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update wedding information");
      }
      return await res.json();
    },
    onSuccess: (userData: ClientUser) => {
      queryClient.setQueryData(["/api/client/user"], userData);
      toast({
        title: "Wedding information updated",
        description: "Your wedding details have been saved successfully.",
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

  // Update package mutation
  const updatePackageMutation = useMutation({
    mutationFn: async (packageName: PackageInfo["name"]) => {
      const res = await apiRequest("PATCH", packageEndpoint, { package: packageName });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update package selection");
      }
      return await res.json();
    },
    onSuccess: (userData: ClientUser) => {
      queryClient.setQueryData(["/api/client/user"], userData);
      toast({
        title: "Package updated",
        description: `You've selected the ${userData.package?.toUpperCase()} package.`,
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
  const contextValue: ClientAuthContextType = {
    ...baseAuth,
    user,
    isBride,
    isGroom,
    isFamily,
    updateWeddingInfoMutation,
    updatePackageMutation,
    hasSelectedPackage,
    hasSetWeddingInfo,
  };

  return (
    <ClientAuthContext.Provider value={contextValue}>
      {children}
    </ClientAuthContext.Provider>
  );
}

// Hook for accessing client auth context
export function useAuth() {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a ClientAuthProvider");
  }
  return context;
}