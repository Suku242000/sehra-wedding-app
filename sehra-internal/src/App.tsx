import { Route, Switch } from 'wouter';
import { AuthProvider } from '@shared/hooks/useAuth';
import { Toaster } from '@shared/components/ui/toaster';

// Lazy load pages
const LoginPage = () => import('./pages/LoginPage').then(module => ({ default: module.default }));
const VendorDashboardPage = () => import('./pages/VendorDashboardPage').then(module => ({ default: module.default }));
const SupervisorDashboardPage = () => import('./pages/SupervisorDashboardPage').then(module => ({ default: module.default }));
const AdminDashboardPage = () => import('./pages/AdminDashboardPage').then(module => ({ default: module.default }));
const NotFoundPage = () => import('./pages/NotFoundPage').then(module => ({ default: module.default }));

function App() {
  return (
    <AuthProvider>
      <main className="min-h-screen">
        <Switch>
          <Route path="/" component={LoginPage} />
          <Route path="/vendor/*" component={VendorDashboardPage} />
          <Route path="/supervisor/*" component={SupervisorDashboardPage} />
          <Route path="/admin/*" component={AdminDashboardPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>
      <Toaster />
    </AuthProvider>
  );
}

export default App;