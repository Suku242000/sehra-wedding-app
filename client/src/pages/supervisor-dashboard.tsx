import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'wouter';
import SupervisorClients from '@/components/supervisor/SupervisorClients';
import { UserRole } from '@shared/schema';

function SupervisorDashboard() {
  const { user, isLoading } = useAuth();

  // Handle loading state
  if (isLoading) {
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
          <span className="text-sm opacity-80">Welcome, {user.name}</span>
        </div>
      </div>
      <main className="container pb-8 pt-6 md:py-8">
        <SupervisorClients />
      </main>
    </div>
  );
}

export default SupervisorDashboard;