import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from '@shared/hooks/useAuth';

// Lazy loaded pages
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

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/budget" component={BudgetPage} />
        <Route path="/vendors" component={VendorsPage} />
        <Route path="/guests" component={GuestsPage} />
        <Route path="/timeline" component={TimelinePage} />
        <Route path="/achievements" component={AchievementsPage} />
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