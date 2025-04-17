import { createContext, useContext, ReactNode } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@shared/lib/queryClient";
import { useToast } from "@shared/hooks/useToast";
import { 
  BaseAuthProvider, 
  BaseAuthProviderProps, 
  User,
  useBaseAuth 
} from "@shared/hooks/useAuth";

// Extended user type with client-specific properties
export interface ClientUser extends User {
  weddingDate?: string;
  package?: string;
  budget?: number;
  location?: string;
  partnerName?: string;
  progress?: number;
}

// Login credentials type
interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data type
interface RegisterData extends LoginCredentials {
  name: string;
  role: "bride" | "groom" | "family";
}

// Package selection data
interface PackageData {
  package: string;
  budget: number;
  weddingDate: string;
  location: string;
  partnerName: string;
}

// Extended auth context with client-specific methods
interface ClientAuthContextType {
  user: ClientUser | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  selectPackage: (data: PackageData) => Promise<void>;
  updateWeddingInfo: (data: Partial<PackageData>) => Promise<void>;
}

const ClientAuthContext = createContext<ClientAuthContextType | null>(null);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: ClientUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
        variant: "success",
      });

      // Redirect based on package selection
      if (user.package) {
        setLocation("/dashboard");
      } else {
        setLocation("/select-package");
      }
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
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: (user: ClientUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
        variant: "success",
      });
      
      setLocation("/select-package");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Package selection mutation
  const packageMutation = useMutation({
    mutationFn: async (data: PackageData) => {
      const res = await apiRequest("POST", "/api/select-package", data);
      return await res.json();
    },
    onSuccess: (user: ClientUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      toast({
        title: "Package selected",
        description: `You've selected the ${user.package} package!`,
        variant: "success",
      });
      
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Package selection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Wedding info update mutation
  const updateWeddingInfoMutation = useMutation({
    mutationFn: async (data: Partial<PackageData>) => {
      const res = await apiRequest("PATCH", "/api/update-wedding-info", data);
      return await res.json();
    },
    onSuccess: (user: ClientUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      toast({
        title: "Wedding information updated",
        description: "Your wedding details have been updated successfully!",
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

  // Login function
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  // Register function
  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  // Package selection function
  const selectPackage = async (data: PackageData) => {
    await packageMutation.mutateAsync(data);
  };

  // Update wedding info function
  const updateWeddingInfo = async (data: Partial<PackageData>) => {
    await updateWeddingInfoMutation.mutateAsync(data);
  };

  // Custom on logout success handler
  const handleLogoutSuccess = () => {
    setLocation("/");
  };

  // Extra context values specific to client app
  const extraContextValues = {
    login,
    register,
    selectPackage,
    updateWeddingInfo,
  };

  return (
    <BaseAuthProvider
      onLogoutSuccess={handleLogoutSuccess}
      extraContextValues={extraContextValues}
    >
      {children}
    </BaseAuthProvider>
  );
}

export function useAuth(): ClientAuthContextType {
  const baseAuth = useBaseAuth();
  return baseAuth as ClientAuthContextType;
}