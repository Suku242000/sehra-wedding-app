import React from 'react';
import { useAuth } from '../lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  User, 
  PieChart,
  Settings
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Mock data for quick display
  const stats = {
    totalUsers: 256,
    weddingsBooked: 78,
    totalRevenue: 12500000,
    activeVendors: 42
  };

  const StatCard = ({ title, value, icon: Icon, color }) => {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className={`text-2xl font-semibold text-${color}-700`}>{value}</p>
            </div>
            <div className={`rounded-full p-3 bg-${color}-50`}>
              <Icon className={`h-5 w-5 text-${color}-500`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || 'Admin'}. Here's what's happening with Sehra today.
          </p>
        </div>
        <Button onClick={handleLogout} variant="destructive">
          Logout
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Weddings Booked"
          value={stats.weddingsBooked}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Active Vendors"
          value={stats.activeVendors}
          icon={Briefcase}
          color="purple"
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">User Management</CardTitle>
            <User className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Manage user accounts, permissions, and roles</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Analytics</CardTitle>
            <PieChart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Review platform metrics, user activity, and growth</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">System Settings</CardTitle>
            <Settings className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Configure application parameters and settings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;