import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "./useToast";

export interface User {
  id: number;
  email: string;
  role: string;
  name: string;
  [key: string]: any; // To allow for additional properties based on role
}

export interface BaseAuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
}

const BaseAuthContext = createContext<BaseAuthContextType | null>(null);

export interface BaseAuthProviderProps {
  children: ReactNode;
  authApiEndpoint?: string;
  onLoginSuccess?: (user: User) => void;
  onLogoutSuccess?: () => void;
  extraContextValues?: Record<string, any>;
}

export function BaseAuthProvider({
  children,
  authApiEndpoint = "/api/user",
  onLoginSuccess,
  onLogoutSuccess,
  extraContextValues = {}
}: BaseAuthProviderProps) {
  const { toast } = useToast();

  // Fetch current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: [authApiEndpoint],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData([authApiEndpoint], null);
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      // Notify success
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
        variant: "success",
      });
      // Call the optional callback
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Combine base context with extra values
  const contextValue = {
    user: user || null,
    isLoading,
    error,
    logout,
    ...extraContextValues,
  };

  return (
    <BaseAuthContext.Provider value={contextValue}>
      {children}
    </BaseAuthContext.Provider>
  );
}

export function useBaseAuth() {
  const context = useContext(BaseAuthContext);
  if (!context) {
    throw new Error("useBaseAuth must be used within a BaseAuthProvider");
  }
  return context;
}