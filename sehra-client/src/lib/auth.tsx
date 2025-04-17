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

// Extended user type for client application (bride, groom, and family)
export interface ClientUser extends User {
  package?: string | null;
  weddingDate?: string | null;
  budget?: number | null;
  location?: string | null;
  progress?: number | null;
  supervisorId?: number | null;
}

// Extended registration credentials for client application
export interface ClientRegisterCredentials extends RegisterCredentials {
  package?: string;
  weddingDate?: string;
  budget?: number;
  location?: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use the base auth provider but with client-specific endpoints
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

  // Get wedding information if the user is logged in
  const { data: weddingInfo } = useQuery({
    queryKey: ["/api/client/wedding-info"],
    queryFn: async () => {
      try {
        if (!baseAuth.user) return null;
        
        const res = await apiRequest("GET", "/api/client/wedding-info");
        if (!res.ok) {
          throw new Error("Failed to fetch wedding information");
        }
        return await res.json();
      } catch (err) {
        return null;
      }
    },
    enabled: !!baseAuth.user,
  });

  // Get budget information if the user is logged in
  const { data: budgetInfo } = useQuery({
    queryKey: ["/api/client/budget-info"],
    queryFn: async () => {
      try {
        if (!baseAuth.user) return null;
        
        const res = await apiRequest("GET", "/api/client/budget-info");
        if (!res.ok) {
          throw new Error("Failed to fetch budget information");
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
    mutationFn: async (weddingData: Partial<ClientUser>) => {
      const res = await apiRequest("PATCH", "/api/client/wedding-info", weddingData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update wedding information");
      }
      return await res.json();
    },
    onSuccess: (userData: ClientUser) => {
      queryClient.setQueryData(["/api/client/wedding-info"], userData);
      toast({
        title: "Wedding Info Updated",
        description: "Your wedding information has been updated successfully.",
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

  // Mutation for package upgrade/downgrade
  const updatePackageMutation = useMutation({
    mutationFn: async ({ packageType }: { packageType: string }) => {
      const res = await apiRequest("POST", "/api/client/update-package", { packageType });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update package");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/client/user"], data);
      queryClient.setQueryData(["/api/client/wedding-info"], data);
      toast({
        title: "Package Updated",
        description: "Your wedding package has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Package Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Extended auth context that includes client-specific functionality
  const extendedAuth = {
    ...baseAuth,
    user: baseAuth.user as ClientUser | null,
    weddingInfo: baseAuth.user ? weddingInfo : null,
    budgetInfo: baseAuth.user ? budgetInfo : null,
    updateWeddingInfoMutation,
    updatePackageMutation,
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
    user: baseAuth.user as ClientUser | null
  };
}