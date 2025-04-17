import { Route, Switch } from 'wouter';
import { AuthProvider } from '@shared/hooks/useAuth';
import { Toaster } from '@shared/components/ui/toaster';

// Lazy load pages
const HomePage = () => import('./pages/HomePage').then(module => ({ default: module.default }));
const AuthPage = () => import('./pages/AuthPage').then(module => ({ default: module.default }));
const DashboardPage = () => import('./pages/DashboardPage').then(module => ({ default: module.default }));
const NotFoundPage = () => import('./pages/NotFoundPage').then(module => ({ default: module.default }));

function App() {
  return (
    <AuthProvider>
      <main className="min-h-screen">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/dashboard/*" component={DashboardPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>
      <Toaster />
    </AuthProvider>
  );
}

export default App;