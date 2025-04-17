import { createContext, ReactNode, useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "../lib/queryClient";
import { useToast } from "./useToast";

// Basic user interface that both client and internal applications share
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

// Auth context interface shared between applications
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
}

// Props for the base auth provider
interface BaseAuthProviderProps {
  children: ReactNode;
  loginEndpoint: string;
  logoutEndpoint: string;
  registerEndpoint: string;
  userEndpoint: string;
}

// Custom hooks for auth operations
function useLoginMutation(loginEndpoint: string) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", loginEndpoint, credentials);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed. Please check your credentials.");
      }
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData([loginEndpoint.replace("/login", "/user")], userData);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function useRegisterMutation(registerEndpoint: string) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const res = await apiRequest("POST", registerEndpoint, credentials);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed. Please try again.");
      }
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData([registerEndpoint.replace("/register", "/user")], userData);
      toast({
        title: "Registration Successful",
        description: "Your account has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function useLogoutMutation(logoutEndpoint: string) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", logoutEndpoint);
      if (!res.ok) {
        throw new Error("Logout failed.");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData([logoutEndpoint.replace("/logout", "/user")], null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Base auth provider component that can be used by both apps
export function BaseAuthProvider({ 
  children,
  loginEndpoint,
  logoutEndpoint,
  registerEndpoint,
  userEndpoint
}: BaseAuthProviderProps) {
  // Fetch user data
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: [userEndpoint],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Initialize mutations
  const loginMutation = useLoginMutation(loginEndpoint);
  const registerMutation = useRegisterMutation(registerEndpoint);
  const logoutMutation = useLogoutMutation(logoutEndpoint);

  // Create auth context value
  const authContext: AuthContextType = {
    user: user || null,
    isLoading,
    error,
    loginMutation,
    registerMutation,
    logoutMutation,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}