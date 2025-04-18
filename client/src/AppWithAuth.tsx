import React from 'react';
import { Switch, Route } from "wouter";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth";
import SelectPackagePage from "@/pages/select-package";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import VendorDashboard from "@/pages/vendor-dashboard";
import SupervisorDashboard from "@/pages/supervisor-dashboard";
import GamificationDashboard from "@/pages/gamification-dashboard";
import PackageUpgrade from "@/pages/package-upgrade";
import NotFound from "@/pages/not-found";
import MessageCenter from "@/components/messaging/MessageCenter";
import { PublicRoute, ProtectedRoute } from "@/lib/auth";
import { UserRole } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";

// Import the Internal App
import InternalLogin from "@/pages/internal/login";

// Import Admin feature pages
import AdminAnalytics from "@/pages/admin/analytics";
import AdminSettings from "@/pages/admin/settings";

const AppWithAuth: React.FC = () => {
  // Make sure auth is being initialized
  const { loading, user } = useAuth();

  // Show a basic loading screen while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  return (
    <>
      <Switch>
        {/* Main Client Routes */}
        <Route path="/">
          <PublicRoute noRedirect={true}>
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
        
        <Route path="/wedding-journey">
          <ProtectedRoute requirePackage={true}>
            <GamificationDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/package-upgrade">
          <ProtectedRoute>
            <PackageUpgrade />
          </ProtectedRoute>
        </Route>
        
        {/* Admin Feature Routes */}
        <Route path="/admin/analytics">
          <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <AdminAnalytics />
          </ProtectedRoute>
        </Route>
        
        <Route path="/admin/settings">
          <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <AdminSettings />
          </ProtectedRoute>
        </Route>
        
        <Route path="/admin/users">
          <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            {() => {
              // Redirect to the right user management path
              window.location.href = '/internal/admin/users';
              return null;
            }}
          </ProtectedRoute>
        </Route>
        
        <Route path="/admin/vendors">
          <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <NotFound />
          </ProtectedRoute>
        </Route>
        
        <Route path="/admin/bookings">
          <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <NotFound />
          </ProtectedRoute>
        </Route>
        
        {/* Internal App Routes */}
        <Route path="/internal-login">
          <PublicRoute>
            <InternalLogin />
          </PublicRoute>
        </Route>
        
        <Route path="/internal/login">
          <PublicRoute>
            <InternalLogin />
          </PublicRoute>
        </Route>
        
        <Route path="/internal/admin/dashboard">
          <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/internal/admin/users">
          <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            {() => {
              // Can be replaced with actual UserManagement component
              window.location.href = '/internal/admin/dashboard';
              return null;
            }}
          </ProtectedRoute>
        </Route>
        
        <Route path="/internal/vendor/dashboard">
          <ProtectedRoute requiredRoles={[UserRole.VENDOR]}>
            <VendorDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/internal/supervisor/dashboard">
          <ProtectedRoute requiredRoles={[UserRole.SUPERVISOR]}>
            <SupervisorDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/vendor/dashboard">
          <ProtectedRoute requiredRoles={[UserRole.VENDOR]}>
            <VendorDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/supervisor/dashboard">
          <ProtectedRoute requiredRoles={[UserRole.SUPERVISOR]}>
            <SupervisorDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/admin/dashboard">
          <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            {() => {
              // Properly redirect to the internal app
              window.location.href = '/internal/admin/dashboard';
              return null;
            }}
          </ProtectedRoute>
        </Route>
        
        <Route>
          <NotFound />
        </Route>
      </Switch>
      
      {/* Global MessageCenter - will be visible on all screens for authenticated users */}
      {user && <MessageCenter />}
    </>
  );
};

export default AppWithAuth;