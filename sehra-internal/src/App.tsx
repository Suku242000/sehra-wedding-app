import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { queryClient } from '@shared/lib/queryClient';
import { InternalAuthProvider } from './lib/auth';
import { Toaster } from '@shared/components/ui/toaster';

// Pages
import AuthPage from './pages/auth-page';
import InternalLogin from './pages/InternalLogin';
import DashboardPlaceholder from './pages/dashboard-placeholder';

const VendorDashboardPage = () => <DashboardPlaceholder role="vendor" />;
const SupervisorDashboardPage = () => <DashboardPlaceholder role="supervisor" />;
const AdminDashboardPage = () => <DashboardPlaceholder role="admin" />;
const NotFoundPage = () => <div className="p-8 text-center">Page not found</div>;
const RootRedirect = () => {
  // This would typically use useEffect and navigate based on role
  return <div className="p-8">Redirecting...</div>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InternalAuthProvider>
        <main className="min-h-screen bg-background">
          <Switch>
            {/* Legacy routes */}
            <Route path="/auth" component={AuthPage} />
            <Route path="/login" component={AuthPage} />
            <Route path="/vendor-dashboard" component={VendorDashboardPage} />
            <Route path="/supervisor-dashboard" component={SupervisorDashboardPage} />
            <Route path="/admin-dashboard" component={AdminDashboardPage} />
            
            {/* New role-based routes */}
            <Route path="/internal/login" component={InternalLogin} />
            <Route path="/vendor/dashboard" component={VendorDashboardPage} />
            <Route path="/supervisor/dashboard" component={SupervisorDashboardPage} />
            <Route path="/admin/dashboard" component={AdminDashboardPage} />
            
            <Route path="/" component={RootRedirect} />
            <Route component={NotFoundPage} />
          </Switch>
        </main>
        <Toaster />
      </InternalAuthProvider>
    </QueryClientProvider>
  );
}

export default App;