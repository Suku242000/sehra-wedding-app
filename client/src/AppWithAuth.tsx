import React from 'react';
import { Switch, Route } from "wouter";
import HomePage from "@/pages/index";
import AuthPage from "@/pages/auth";
import SelectPackagePage from "@/pages/select-package";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import VendorDashboard from "@/pages/vendor-dashboard";
import SupervisorDashboard from "@/pages/supervisor-dashboard";
import NotFound from "@/pages/not-found";
import { PublicRoute, ProtectedRoute } from "@/lib/auth";
import { UserRole } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";

const AppWithAuth: React.FC = () => {
  // Make sure auth is being initialized
  const { loading } = useAuth();

  // Show a basic loading screen while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        <PublicRoute>
          <HomePage />
        </PublicRoute>
      </Route>
      
      <Route path="/auth">
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      </Route>
      
      <Route path="/select-package">
        <ProtectedRoute>
          <SelectPackagePage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute requirePackage={true}>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin-dashboard">
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor-dashboard">
        <ProtectedRoute requiredRoles={[UserRole.VENDOR]}>
          <VendorDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/supervisor-dashboard">
        <ProtectedRoute requiredRoles={[UserRole.SUPERVISOR]}>
          <SupervisorDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
};

export default AppWithAuth;