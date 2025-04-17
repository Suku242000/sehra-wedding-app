import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'wouter';
import SupervisorClients from '@/components/supervisor/SupervisorClients';
import { UserRole } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

function SupervisorDashboard() {
  const { user, loading, logout } = useAuth();

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not logged in or not a supervisor
  if (!user || user.role !== UserRole.SUPERVISOR) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-screen">
      <div className="bg-primary text-white p-4">
        <div className="container flex justify-between items-center">
          <h1 className="text-xl font-bold">Sehra Supervisor Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80">Welcome, {user.name}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="text-white border-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      <main className="container pb-8 pt-6 md:py-8">
        <SupervisorClients />
      </main>
    </div>
  );
}

export default SupervisorDashboard;