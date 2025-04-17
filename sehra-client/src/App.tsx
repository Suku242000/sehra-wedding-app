import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from '@shared/hooks/useAuth';

// Lazy loaded pages for client app
const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BudgetPage = lazy(() => import('./pages/BudgetPage'));
const VendorsPage = lazy(() => import('./pages/VendorsPage'));
const GuestsPage = lazy(() => import('./pages/GuestsPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading component for suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Protected route component for client app
const ProtectedRoute = ({ 
  component: Component, 
  roles = ['bride', 'groom', 'family'], 
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
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        
        {/* Protected routes for wedding clients */}
        <ProtectedRoute 
          path="/dashboard" 
          component={DashboardPage} 
        />
        
        <ProtectedRoute 
          path="/budget" 
          component={BudgetPage} 
        />
        
        <ProtectedRoute 
          path="/vendors" 
          component={VendorsPage} 
        />
        
        <ProtectedRoute 
          path="/guests" 
          component={GuestsPage} 
        />
        
        <ProtectedRoute 
          path="/timeline" 
          component={TimelinePage} 
        />
        
        <ProtectedRoute 
          path="/achievements" 
          component={AchievementsPage} 
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