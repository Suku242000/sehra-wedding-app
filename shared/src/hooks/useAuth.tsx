import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

// Define user schema
const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
  // Add more fields as needed
});

type User = z.infer<typeof userSchema>;

interface LoginCredentials {
  email: string;
  password: string;
  role?: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
  // Add more fields as needed for registration
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useMutation<User, Error, LoginCredentials>>;
  logoutMutation: ReturnType<typeof useMutation<void, Error, void>>;
  registerMutation: ReturnType<typeof useMutation<User, Error, RegisterCredentials>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Get the currently logged in user
  const {
    data: user,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ['/api/user'],
    refetchOnWindowFocus: false,
    retry: false,
    throwOnError: false,
  });

  // Login mutation
  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(credentials),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Login failed');
        }

        return res.json();
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
          throw err;
        }
        const error = new Error('An unexpected error occurred during login');
        setError(error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      setError(null);
    },
  });

  // Register mutation
  const registerMutation = useMutation<User, Error, RegisterCredentials>({
    mutationFn: async (userData) => {
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(userData),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Registration failed');
        }

        return res.json();
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
          throw err;
        }
        const error = new Error('An unexpected error occurred during registration');
        setError(error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      setError(null);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        const res = await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Logout failed');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
          throw err;
        }
        const error = new Error('An unexpected error occurred during logout');
        setError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      setError(null);
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}