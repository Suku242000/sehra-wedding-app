import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from '@shared/hooks/useAuth';
import { Toaster } from '@shared/components/ui/toaster';

// Internal-facing Pages
import LoginPage from './pages/LoginPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import SupervisorDashboardPage from './pages/SupervisorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route component
import { ProtectedRoute } from './lib/ProtectedRoute';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={LoginPage} />
          <Route path="/login" component={LoginPage} />
          
          {/* Protected routes for authenticated users */}
          <ProtectedRoute path="/vendor-dashboard" component={VendorDashboardPage} roles={['vendor']} />
          <ProtectedRoute path="/supervisor-dashboard" component={SupervisorDashboardPage} roles={['supervisor']} />
          <ProtectedRoute path="/admin-dashboard" component={AdminDashboardPage} roles={['admin']} />
          
          {/* Not found route */}
          <Route component={NotFoundPage} />
        </Switch>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;