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

// Extended user type for client applications (bride, groom, family)
export interface ClientUser extends User {
  weddingDate?: string;
  package?: 'silver' | 'gold' | 'platinum';
  budget?: {
    total: number;
    spent: number;
    remaining: number;
  };
  location?: string;
  weddingInfo?: {
    venueType?: string;
    guestCount?: number;
    ceremonies?: string[];
    theme?: string;
  };
  progress?: {
    tasksCompleted: number;
    tasksTotal: number;
    percentage: number;
  };
  relationshipToCouple?: string; // For family members
}

// Interface for wedding info updates
export interface WeddingInfoUpdate {
  weddingDate?: string;
  package?: 'silver' | 'gold' | 'platinum';
  location?: string;
  weddingInfo?: {
    venueType?: string;
    guestCount?: number;
    ceremonies?: string[];
    theme?: string;
  };
}

// Calculated budget tiers
export const PACKAGE_BUDGET_RANGES = {
  silver: { min: 1000000, max: 3000000, serviceFeePercentage: 2 }, // ₹10L-₹30L, 2% service fee
  gold: { min: 3100000, max: 6000000, serviceFeePercentage: 5 },   // ₹31L-₹60L, 5% service fee
  platinum: { min: 6100000, max: 10000000, serviceFeePercentage: 8 } // ₹61L-₹1Cr+, 8% service fee
};

// Main auth provider for client application
export function AuthProvider({ children }: { children: ReactNode }) {
  // Use the base auth provider with client-specific endpoints
  return (
    <BaseAuthProvider
      loginEndpoint="/api/client/login"
      logoutEndpoint="/api/client/logout" 
      registerEndpoint="/api/client/register"
      userEndpoint="/api/client/user"
    >
      <ClientAuthExtension>{children}</ClientAuthExtension>
    </BaseAuthProvider>
  );
}

// This component extends the base auth with client-specific functionality
function ClientAuthExtension({ children }: { children: ReactNode }) {
  const baseAuth = useBaseAuth();
  const { toast } = useToast();

  // Fetch achievements for the logged-in user
  const { data: achievements } = useQuery({
    queryKey: ["/api/client/achievements"],
    queryFn: async () => {
      try {
        if (!baseAuth.user) return null;
        
        const res = await apiRequest("GET", "/api/client/achievements");
        if (!res.ok) {
          throw new Error("Failed to fetch achievements");
        }
        return await res.json();
      } catch (err) {
        return null;
      }
    },
    enabled: !!baseAuth.user,
  });

  // Fetch tasks for the logged-in user
  const { data: tasks } = useQuery({
    queryKey: ["/api/client/tasks"],
    queryFn: async () => {
      try {
        if (!baseAuth.user) return null;
        
        const res = await apiRequest("GET", "/api/client/tasks");
        if (!res.ok) {
          throw new Error("Failed to fetch tasks");
        }
        return await res.json();
      } catch (err) {
        return null;
      }
    },
    enabled: !!baseAuth.user,
  });

  // Fetch budget overview for the logged-in user
  const { data: budgetOverview } = useQuery({
    queryKey: ["/api/client/budget-overview"],
    queryFn: async () => {
      try {
        if (!baseAuth.user) return null;
        
        const res = await apiRequest("GET", "/api/client/budget-overview");
        if (!res.ok) {
          throw new Error("Failed to fetch budget overview");
        }
        return await res.json();
      } catch (err) {
        return null;
      }
    },
    enabled: !!baseAuth.user,
  });

  // Mutation for updating wedding information
  const updateWeddingInfoMutation = useMutation({
    mutationFn: async (weddingInfo: WeddingInfoUpdate) => {
      const res = await apiRequest("PATCH", "/api/client/update-wedding-info", weddingInfo);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update wedding information");
      }
      return await res.json();
    },
    onSuccess: (userData: ClientUser) => {
      queryClient.setQueryData(["/api/client/user"], userData);
      toast({
        title: "Wedding Information Updated",
        description: "Your wedding details have been successfully updated.",
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

  // Mutation for updating package selection
  const updatePackageMutation = useMutation({
    mutationFn: async (packageData: { package: 'silver' | 'gold' | 'platinum', budget: number }) => {
      const res = await apiRequest("PATCH", "/api/client/update-package", packageData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update package selection");
      }
      return await res.json();
    },
    onSuccess: (userData: ClientUser) => {
      queryClient.setQueryData(["/api/client/user"], userData);
      queryClient.invalidateQueries({ queryKey: ["/api/client/budget-overview"] });
      toast({
        title: "Package Updated",
        description: "Your package and budget have been successfully updated.",
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

  // Extended auth context with client-specific functionality
  const extendedAuth = {
    ...baseAuth,
    user: baseAuth.user as ClientUser | null,
    achievements,
    tasks,
    budgetOverview,
    updateWeddingInfoMutation,
    updatePackageMutation,
    // Helper functions
    isWeddingInfoComplete: () => {
      const user = baseAuth.user as ClientUser | null;
      if (!user) return false;
      
      return !!(user.weddingDate && user.package && user.location && 
               user.weddingInfo?.venueType && user.weddingInfo?.guestCount);
    },
    getServiceFee: () => {
      const user = baseAuth.user as ClientUser | null;
      if (!user || !user.package || !user.budget?.total) return 0;
      
      const packageInfo = PACKAGE_BUDGET_RANGES[user.package];
      return user.budget.total * (packageInfo.serviceFeePercentage / 100);
    }
  };

  return (
    <>
      {children}
    </>
  );
}

// Hook for accessing auth context in client app
export function useAuth() {
  const baseAuth = useBaseAuth();
  
  // Cast the user to ClientUser type 
  return {
    ...baseAuth,
    user: baseAuth.user as ClientUser | null,
    // Role helper functions
    isBride: !!baseAuth.user && baseAuth.user.role === "bride",
    isGroom: !!baseAuth.user && baseAuth.user.role === "groom",
    isFamily: !!baseAuth.user && baseAuth.user.role === "family",
  };
}