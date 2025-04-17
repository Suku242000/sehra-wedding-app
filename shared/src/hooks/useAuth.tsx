import { ReactNode, createContext, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "./useToast";

// Base user interface that will be extended by client & internal specific interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLogin?: string;
}

// Base auth context interface
export interface BaseAuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
}

// Base context
const BaseAuthContext = createContext<BaseAuthContextType | null>(null);

interface BaseAuthProviderProps {
  children: ReactNode;
  loginEndpoint: string;
  logoutEndpoint: string;
  registerEndpoint: string;
  userEndpoint: string;
}

/**
 * Base Authentication Provider
 * 
 * Shared foundation for both client and internal auth providers.
 * Handles core authentication functionality:
 * - User data fetching
 * - Login/logout mutations
 * - Registration
 */
export function BaseAuthProvider({
  children, 
  loginEndpoint,
  logoutEndpoint,
  registerEndpoint,
  userEndpoint
}: BaseAuthProviderProps) {
  const { toast } = useToast();

  // Fetch current user data
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: [userEndpoint],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", userEndpoint);
        if (!res.ok) {
          if (res.status === 401) {
            return null;
          }
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch user data");
        }
        return await res.json();
      } catch (err) {
        if (err instanceof Error && err.message !== "Failed to fetch") {
          console.error("User fetch error:", err);
          toast({
            title: "Error fetching user data",
            description: err.message,
            variant: "destructive",
          });
        }
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await apiRequest("POST", loginEndpoint, credentials);
      if (!res.ok) {
        const errorData = await res.json();
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

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", logoutEndpoint);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData([userEndpoint], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        variant: "success",
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

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: {
      name: string;
      email: string;
      password: string;
      role?: string;
    }) => {
      const res = await apiRequest("POST", registerEndpoint, userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Registration failed. Please try again."
        );
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

  // Create base context value
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