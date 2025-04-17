import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from '@shared/hooks/useAuth';

// Lazy loaded pages for internal app
const LoginPage = lazy(() => import('./pages/LoginPage'));
const VendorDashboardPage = lazy(() => import('./pages/VendorDashboardPage'));
const SupervisorDashboardPage = lazy(() => import('./pages/SupervisorDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading component for suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Protected route component for internal app
const ProtectedRoute = ({ 
  component: Component, 
  roles = [], 
  ...rest 
}: { 
  component: React.ComponentType, 
  roles?: string[],
  path?: string 
}) => {
  // We'll implement the full role-based authentication check when we build the useAuth hook
  // For now, this is a placeholder
  return <Component />;
};

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Public routes */}
        <Route path="/login" component={LoginPage} />
        
        {/* Protected routes for internal staff */}
        <ProtectedRoute 
          path="/dashboard/vendor" 
          component={VendorDashboardPage} 
          roles={['vendor']}
        />
        
        <ProtectedRoute 
          path="/dashboard/supervisor" 
          component={SupervisorDashboardPage} 
          roles={['supervisor']}
        />
        
        <ProtectedRoute 
          path="/dashboard/admin" 
          component={AdminDashboardPage} 
          roles={['admin']}
        />
        
        <Route component={NotFoundPage} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}