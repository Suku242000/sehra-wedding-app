import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

// Define user type
export type User = {
  id: number;
  email: string;
  name: string;
  role: string;  // 'bride', 'groom', 'family', 'vendor', 'supervisor', 'admin'
  [key: string]: any;
};

type RegisterData = {
  email: string;
  password: string;
  name: string;
  role: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<User>;
  checkAuth: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [, setLocation] = useLocation();

  // Check if user is authenticated on initial load
  useEffect(() => {
    checkAuth()
      .then((user) => {
        setUser(user);
        setIsLoading(false);
      })
      .catch(() => {
        setUser(null);
        setIsLoading(false);
        setIsError(true);
      });
  }, []);

  const checkAuth = async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Failed to check authentication status');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Auth check error:', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const userData = await response.json();
      setUser(userData);

      // Redirect based on user role
      redirectBasedOnRole(userData.role);
    } catch (error) {
      console.error('Login error:', error);
      setIsError(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<User> => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch('/api/register', {
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

      const user = await response.json();
      setUser(user);

      // Redirect based on user role
      redirectBasedOnRole(user.role);
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      setIsError(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      
      // Determine which app the user is in and redirect to the appropriate home page
      const isInternalApp = window.location.pathname.includes('/dashboard/vendor') || 
                           window.location.pathname.includes('/dashboard/supervisor') || 
                           window.location.pathname.includes('/dashboard/admin');
      
      if (isInternalApp) {
        // If in internal app, redirect to internal login
        setLocation('/login');
      } else {
        // If in client app, redirect to client home page
        setLocation('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to redirect based on user role
  const redirectBasedOnRole = (role: string): void => {
    switch (role) {
      case 'bride':
      case 'groom':
      case 'family':
        // Client app roles
        setLocation('/dashboard');
        break;
      case 'vendor':
        // Vendor in internal app
        setLocation('/dashboard/vendor');
        break;
      case 'supervisor':
        // Supervisor in internal app
        setLocation('/dashboard/supervisor');
        break;
      case 'admin':
        // Admin in internal app
        setLocation('/dashboard/admin');
        break;
      default:
        // Default redirect to client app home
        setLocation('/');
        break;
    }
  };

  // Export context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isError,
    login,
    logout,
    register,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;