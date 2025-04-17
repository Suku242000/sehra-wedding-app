import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from '@shared/hooks/useAuth';
import { Toaster } from '@shared/components/ui/toaster';

// Client-facing Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import BudgetPage from './pages/BudgetPage';
import VendorsPage from './pages/VendorsPage';
import GuestsPage from './pages/GuestsPage';
import TimelinePage from './pages/TimelinePage';
import AchievementsPage from './pages/AchievementsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route component
import { ProtectedRoute } from './lib/ProtectedRoute';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          
          {/* Protected routes for authenticated users */}
          <ProtectedRoute path="/dashboard" component={DashboardPage} roles={['bride', 'groom', 'family']} />
          <ProtectedRoute path="/budget" component={BudgetPage} roles={['bride', 'groom', 'family']} />
          <ProtectedRoute path="/vendors" component={VendorsPage} roles={['bride', 'groom', 'family']} />
          <ProtectedRoute path="/guests" component={GuestsPage} roles={['bride', 'groom', 'family']} />
          <ProtectedRoute path="/timeline" component={TimelinePage} roles={['bride', 'groom', 'family']} />
          <ProtectedRoute path="/achievements" component={AchievementsPage} roles={['bride', 'groom', 'family']} />
          
          {/* Not found route */}
          <Route component={NotFoundPage} />
        </Switch>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;