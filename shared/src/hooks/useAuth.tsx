import { ReactNode, createContext, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "../lib/queryClient";
import { useToast } from "./useToast";

// Base user interface shared across all application roles
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

// Base auth context interface with shared functionalities
interface BaseAuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
}

// Create context
const BaseAuthContext = createContext<BaseAuthContextType | null>(null);

// Props for the base provider
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

  // Fetch user data
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User | null, Error>({
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
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
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
        description: "Your account has been created successfully.",
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
        description: "You have been logged out successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Base context value
  const contextValue: BaseAuthContextType = {
    user: user || null,
    isLoading,
    error,
    loginMutation,
    registerMutation,
    logoutMutation,
  };

  return (
    <BaseAuthContext.Provider value={contextValue}>
      {children}
    </BaseAuthContext.Provider>
  );
}

// Base hook for accessing auth context
export function useAuth() {
  const context = useContext(BaseAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}