import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from '@shared/hooks/useAuth';

// Lazy loaded pages
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

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={LoginPage} />
        <Route path="/vendor-dashboard/*" component={VendorDashboardPage} />
        <Route path="/supervisor-dashboard/*" component={SupervisorDashboardPage} />
        <Route path="/admin-dashboard/*" component={AdminDashboardPage} />
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