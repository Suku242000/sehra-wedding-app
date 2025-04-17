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

// Protected route component
const ProtectedRoute = ({ 
  component: Component, 
  requiredRole, 
  ...rest 
}: { 
  component: React.ComponentType, 
  requiredRole: string | string[],
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
        <Route path="/login" component={LoginPage} />
        
        {/* Role-specific routes */}
        <ProtectedRoute 
          path="/vendor-dashboard" 
          component={VendorDashboardPage} 
          requiredRole="vendor" 
        />
        
        <ProtectedRoute 
          path="/supervisor-dashboard" 
          component={SupervisorDashboardPage} 
          requiredRole="supervisor" 
        />
        
        <ProtectedRoute 
          path="/admin-dashboard" 
          component={AdminDashboardPage} 
          requiredRole="admin" 
        />
        
        {/* Redirect to login for root path */}
        <Route path="/">
          {() => {
            window.location.href = '/login';
            return null;
          }}
        </Route>
        
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