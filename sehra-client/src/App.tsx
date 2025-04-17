import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './lib/auth';
import { Toaster } from './components/ui/toaster';

// Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import BudgetPage from './pages/BudgetPage';
import VendorsPage from './pages/VendorsPage';
import GuestsPage from './pages/GuestsPage';
import TimelinePage from './pages/TimelinePage';
import AchievementsPage from './pages/AchievementsPage';
import NotFoundPage from './pages/NotFoundPage';

import { ProtectedRoute } from './lib/ProtectedRoute';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <main className="min-h-screen bg-background">
          <Switch>
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute 
              path="/" 
              component={HomePage} 
              allowedRoles={['bride', 'groom', 'family']} 
            />
            <ProtectedRoute 
              path="/dashboard" 
              component={DashboardPage} 
              allowedRoles={['bride', 'groom', 'family']} 
            />
            <ProtectedRoute 
              path="/budget" 
              component={BudgetPage} 
              allowedRoles={['bride', 'groom', 'family']} 
            />
            <ProtectedRoute 
              path="/vendors" 
              component={VendorsPage} 
              allowedRoles={['bride', 'groom', 'family']} 
            />
            <ProtectedRoute 
              path="/guests" 
              component={GuestsPage} 
              allowedRoles={['bride', 'groom', 'family']} 
            />
            <ProtectedRoute 
              path="/timeline" 
              component={TimelinePage} 
              allowedRoles={['bride', 'groom', 'family']} 
            />
            <ProtectedRoute 
              path="/achievements" 
              component={AchievementsPage} 
              allowedRoles={['bride', 'groom', 'family']} 
            />
            <Route component={NotFoundPage} />
          </Switch>
        </main>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;