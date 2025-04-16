import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  AuthState, 
  AuthContextType, 
  LoginResponse, 
  RegisterResponse 
} from '@/types';
import { apiRequest } from '@/lib/api';
import { User, UserRoleType, PackageTypeValue } from '@shared/schema';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null
};

// Action types
type AuthAction = 
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_REQUEST' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SELECT_PACKAGE_REQUEST' }
  | { type: 'SELECT_PACKAGE_SUCCESS'; payload: User }
  | { type: 'SELECT_PACKAGE_FAILURE'; payload: string }
  | { type: 'UPDATE_USER_REQUEST' }
  | { type: 'UPDATE_USER_SUCCESS'; payload: User }
  | { type: 'UPDATE_USER_FAILURE'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
    case 'SELECT_PACKAGE_REQUEST':
    case 'UPDATE_USER_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    case 'SELECT_PACKAGE_SUCCESS':
    case 'UPDATE_USER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
    case 'SELECT_PACKAGE_FAILURE':
    case 'UPDATE_USER_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check for token in localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_REQUEST' });
    
    try {
      const response = await apiRequest<LoginResponse>('POST', '/api/auth/login', { email, password });
      
      if (!response) {
        throw new Error('Login failed. Please try again.');
      }
      
      const { user, token } = response;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`,
        variant: 'default'
      });
      
      // Redirect based on role and package
      const lowerCaseRole = user.role.toLowerCase();
      if (lowerCaseRole === 'admin') {
        setLocation('/admin-dashboard');
      } else if (lowerCaseRole === 'vendor') {
        setLocation('/vendor-dashboard');
      } else if (lowerCaseRole === 'supervisor') {
        setLocation('/supervisor-dashboard');
      } else if (user.package) {
        setLocation('/dashboard');
      } else {
        setLocation('/select-package');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message || 'Login failed. Please check your credentials.'
      });
      
      toast({
        title: 'Login Failed',
        description: error.message || 'Please check your credentials.',
        variant: 'destructive'
      });
    }
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRoleType
  ): Promise<void> => {
    dispatch({ type: 'REGISTER_REQUEST' });
    
    try {
      const response = await apiRequest<RegisterResponse>('POST', '/api/auth/register', {
        name,
        email,
        password,
        role
      });
      
      if (!response) {
        throw new Error('Registration failed. Please try again.');
      }
      
      const { user, token } = response;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user, token }
      });
      
      toast({
        title: 'Registration Successful',
        description: `Welcome to Sehra, ${user.name}!`,
        variant: 'default'
      });
      
      // Redirect based on role
      const lowerCaseRole = user.role.toLowerCase();
      if (lowerCaseRole === 'admin') {
        setLocation('/admin-dashboard');
      } else if (lowerCaseRole === 'vendor') {
        setLocation('/vendor-dashboard');
      } else if (lowerCaseRole === 'supervisor') {
        setLocation('/supervisor-dashboard');
      } else {
        setLocation('/select-package');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: error.message || 'Registration failed. Please try again.'
      });
      
      toast({
        title: 'Registration Failed',
        description: error.message || 'Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dispatch({ type: 'LOGOUT' });
    
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
      variant: 'default'
    });
    
    setLocation('/');
  };

  // Select package function
  const selectPackage = async (packageType: PackageTypeValue): Promise<void> => {
    dispatch({ type: 'SELECT_PACKAGE_REQUEST' });
    
    try {
      const response = await apiRequest<{ user: User }>('POST', '/api/auth/select-package', {
        package: packageType
      });
      
      if (!response || !response.user) {
        throw new Error('Failed to select package. Please try again.');
      }
      
      const updatedUser = response.user;
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      dispatch({
        type: 'SELECT_PACKAGE_SUCCESS',
        payload: updatedUser
      });
      
      toast({
        title: 'Package Selected',
        description: `You have selected the ${packageType.charAt(0).toUpperCase() + packageType.slice(1)} package.`,
        variant: 'default'
      });
      
      setLocation('/dashboard');
    } catch (error) {
      console.error('Package selection error:', error);
      
      dispatch({
        type: 'SELECT_PACKAGE_FAILURE',
        payload: error.message || 'Failed to select package. Please try again.'
      });
      
      toast({
        title: 'Package Selection Failed',
        description: error.message || 'Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    dispatch({ type: 'UPDATE_USER_REQUEST' });
    
    try {
      const response = await apiRequest<User>('PATCH', '/api/users/me', userData);
      
      if (!response) {
        throw new Error('Failed to update profile. Please try again.');
      }
      
      // Update user in localStorage
      if (state.user) {
        const updatedUser = { ...state.user, ...response };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        dispatch({
          type: 'UPDATE_USER_SUCCESS',
          payload: updatedUser
        });
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Update user error:', error);
      
      dispatch({
        type: 'UPDATE_USER_FAILURE',
        payload: error.message || 'Failed to update profile. Please try again.'
      });
      
      toast({
        title: 'Update Failed',
        description: error.message || 'Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    selectPackage,
    clearError,
    updateUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
