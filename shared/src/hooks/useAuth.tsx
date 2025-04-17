import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Define the User type
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Define context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

// Define input data types
interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
  role: 'bride' | 'groom' | 'family' | 'vendor' | 'admin' | 'supervisor';
  // Additional fields for different roles can be added
  vendorType?: string;
  businessName?: string;
  package?: string;
  weddingDate?: string;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  // Use React Query to fetch the current user
  const {
    data: user,
    isLoading,
    isError,
    refetch
  } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch user');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching authenticated user:', error);
        return null;
      }
    },
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return await response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  // Login function
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Register function
  const register = async (userData: RegisterData) => {
    await registerMutation.mutateAsync(userData);
  };

  // Check auth function
  const checkAuth = async (): Promise<User | null> => {
    const result = await refetch();
    return result.data || null;
  };

  // Handle role-based redirection after login
  useEffect(() => {
    if (user && redirectPath) {
      window.location.href = redirectPath;
      setRedirectPath(null);
    } else if (user) {
      // Determine redirect path based on role if not set explicitly
      let path = '/';
      
      if (user.role === 'vendor') {
        path = '/vendor-dashboard';
      } else if (user.role === 'supervisor') {
        path = '/supervisor-dashboard';
      } else if (user.role === 'admin') {
        path = '/admin-dashboard';
      } else if (['bride', 'groom', 'family'].includes(user.role)) {
        path = '/dashboard';
      }
      
      // Only redirect if we're not already on the correct path
      if (window.location.pathname !== path && 
          window.location.pathname !== '/auth' && 
          window.location.pathname !== '/') {
        window.location.href = path;
      }
    }
  }, [user, redirectPath]);

  // Context value
  const value = {
    user,
    isLoading,
    isError,
    login,
    logout,
    register,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}