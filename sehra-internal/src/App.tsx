import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation } from 'wouter';
import { queryClient } from '@shared/lib/queryClient';
import { InternalAuthProvider, useInternalAuth } from './lib/auth';
import { Toaster } from '@shared/components/ui/toaster';

// Pages
import AuthPage from './pages/auth-page';
import InternalLogin from './pages/InternalLogin';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import DashboardPlaceholder from './pages/dashboard-placeholder';

const VendorDashboardPage = () => <DashboardPlaceholder role="vendor" />;
const SupervisorDashboardPage = () => <DashboardPlaceholder role="supervisor" />;
const AdminDashboardPage = () => <AdminDashboard />;
const NotFoundPage = () => <div className="p-8 text-center">Page not found</div>;
const RootRedirect = () => {
  const { user } = useInternalAuth();
  const [, navigate] = useLocation();
  
  React.useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/internal/admin/dashboard');
      } else if (user.role === 'vendor') {
        navigate('/internal/vendor/dashboard');
      } else if (user.role === 'supervisor') {
        navigate('/internal/supervisor/dashboard');
      } else {
        // Default redirect to login if role is not recognized
        navigate('/internal/login');
      }
    } else {
      // If not authenticated, redirect to login
      navigate('/internal/login');
    }
  }, [user, navigate]);
  
  return <div className="p-8 text-center">Redirecting...</div>;
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
            <Route path="/internal-login" component={InternalLogin} />
            <Route path="/internal/admin/dashboard" component={AdminDashboardPage} />
            <Route path="/internal/vendor/dashboard" component={VendorDashboardPage} />
            <Route path="/internal/supervisor/dashboard" component={SupervisorDashboardPage} />
            <Route path="/internal/admin/users" component={UserManagement} />
            
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