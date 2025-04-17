import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@shared/hooks/useAuth';
import { queryClient } from './lib/queryClient';

// Import pages
import LoginPage from './pages/LoginPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import SupervisorDashboardPage from './pages/SupervisorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

import { ProtectedRoute } from './lib/ProtectedRoute';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Switch>
            <Route path="/login" component={LoginPage} />
            
            <ProtectedRoute 
              path="/vendor-dashboard" 
              component={VendorDashboardPage} 
              roles={['vendor']}
            />
            
            <ProtectedRoute 
              path="/supervisor-dashboard" 
              component={SupervisorDashboardPage} 
              roles={['supervisor']}
            />
            
            <ProtectedRoute 
              path="/admin-dashboard" 
              component={AdminDashboardPage} 
              roles={['admin']}
            />
            
            {/* Default route redirects to login */}
            <Route path="/">
              {() => {
                const redirectTo = '/login';
                window.location.href = redirectTo;
                return null;
              }}
            </Route>
            
            <Route component={NotFoundPage} />
          </Switch>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;