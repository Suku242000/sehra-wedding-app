import { ReactNode, createContext, useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "../lib/queryClient";
import { useToast } from "./useToast";

// Basic user interface that will be extended by each application
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration credentials interface
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: string;
}

// Base authentication context type
interface BaseAuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
}

// Create the context
const BaseAuthContext = createContext<BaseAuthContextType | null>(null);

// Base auth provider props
interface BaseAuthProviderProps {
  children: ReactNode;
  loginEndpoint: string;
  logoutEndpoint: string;
  registerEndpoint: string;
  userEndpoint: string;
}

/**
 * Base authentication provider that will be extended by app-specific providers
 * Handles basic auth operations: login, logout, registration, user data fetching
 */
export function BaseAuthProvider({
  children,
  loginEndpoint,
  logoutEndpoint,
  registerEndpoint,
  userEndpoint,
}: BaseAuthProviderProps) {
  const { toast } = useToast();

  // Fetch current user data
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: [userEndpoint],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", loginEndpoint, credentials);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData([userEndpoint], userData);
      toast({
        title: "Welcome back!",
        description: `You've successfully logged in as ${userData.name}.`,
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const res = await apiRequest("POST", registerEndpoint, credentials);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData([userEndpoint], userData);
      toast({
        title: "Registration successful",
        description: `Welcome to Sehra, ${userData.name}!`,
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", logoutEndpoint);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData([userEndpoint], null);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
        variant: "default",
      });
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Context value
  const contextValue: BaseAuthContextType = {
    user: user || null,
    isLoading,
    error: error as Error | null,
    loginMutation,
    logoutMutation,
    registerMutation,
  };

  return (
    <BaseAuthContext.Provider value={contextValue}>
      {children}
    </BaseAuthContext.Provider>
  );
}

// Hook for accessing base auth context
export function useAuth() {
  const context = useContext(BaseAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a BaseAuthProvider");
  }
  return context;
}