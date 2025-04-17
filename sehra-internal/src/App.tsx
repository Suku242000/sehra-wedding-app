import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './lib/auth';
import { Toaster } from './components/ui/toaster';

// Pages
import LoginPage from './pages/LoginPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import SupervisorDashboardPage from './pages/SupervisorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import RootRedirect from './pages/RootRedirect';

import { ProtectedRoute } from './lib/ProtectedRoute';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <main className="min-h-screen bg-background">
          <Switch>
            <Route path="/login" component={LoginPage} />
            <ProtectedRoute 
              path="/vendor-dashboard" 
              component={VendorDashboardPage} 
              allowedRoles={['vendor']} 
            />
            <ProtectedRoute 
              path="/supervisor-dashboard" 
              component={SupervisorDashboardPage} 
              allowedRoles={['supervisor']} 
            />
            <ProtectedRoute 
              path="/admin-dashboard" 
              component={AdminDashboardPage} 
              allowedRoles={['admin']} 
            />
            <Route path="/" component={RootRedirect} />
            <Route component={NotFoundPage} />
          </Switch>
        </main>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;