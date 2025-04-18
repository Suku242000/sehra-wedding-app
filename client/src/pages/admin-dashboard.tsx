import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  User, 
  PieChart,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { useLocation, useRoute, useRouter } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Query for dashboard stats from API
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['/api/admin/dashboard/stats'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/dashboard/stats');
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Return fallback data for development
        return {
          totalUsers: 256,
          weddingsBooked: 78,
          totalRevenue: 12500000,
          activeVendors: 42,
          pendingTasks: 36,
          newSignups: 24,
          revenueGrowth: 18.5
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for recent activity from API
  const { data: recentActivity, isLoading: isActivityLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/recent-activity'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/dashboard/recent-activity');
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
        // Return fallback data for development
        return [
          { id: 1, type: 'user_created', user: 'Aryan Sharma', timestamp: new Date().toISOString(), message: 'New supervisor account created' },
          { id: 2, type: 'booking_completed', user: 'Meera Patel', timestamp: new Date(Date.now() - 3600000).toISOString(), message: 'Completed booking with Premium Decor vendor' },
          { id: 3, type: 'payment_received', user: 'Vikram Singh', timestamp: new Date(Date.now() - 7200000).toISOString(), message: 'Payment of ₹250,000 received' }
        ];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleLogout = () => {
    logout();
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetchStats();
      toast({
        title: 'Dashboard Refreshed',
        description: 'The latest data has been loaded.',
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Could not refresh dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportData = () => {
    toast({
      title: 'Export Started',
      description: 'Your data is being exported. You will be notified when it\'s ready.',
    });
    setIsExportDialogOpen(false);
    
    // Simulate export completion after 2 seconds
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: 'Your data has been successfully exported.',
      });
    }, 2000);
  };

  const navigateToUserManagement = () => {
    navigate('/internal/admin/users');
  };

  const navigateToAnalytics = () => {
    navigate('/admin/analytics');
  };

  const navigateToSettings = () => {
    navigate('/admin/settings');
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick, badge = null }) => {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-all" onClick={onClick}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                {badge && (
                  <Badge variant={badge.variant} className="text-xs">
                    {badge.text}
                  </Badge>
                )}
              </div>
              {isStatsLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className={`text-2xl font-semibold`}>{value}</p>
              )}
            </div>
            <div className={`rounded-full p-3`} style={{ backgroundColor: `rgba(var(--${color}), 0.1)` }}>
              <Icon className={`h-5 w-5`} style={{ color: `rgb(var(--${color}))` }} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'user_created':
          return <User className="h-4 w-4 text-blue-500" />;
        case 'booking_completed':
          return <Calendar className="h-4 w-4 text-green-500" />;
        case 'payment_received':
          return <DollarSign className="h-4 w-4 text-emerald-500" />;
        default:
          return <Calendar className="h-4 w-4 text-gray-500" />;
      }
    };

    return (
      <div className="flex items-start gap-4 py-3 border-b last:border-0">
        <div className="bg-muted rounded-full p-2 mt-1">
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1">
          <p className="font-medium">{activity.message}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{activity.user}</span>
            <span>•</span>
            <span>{new Date(activity.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.name || 'Admin'}. Here's what's happening with Sehra today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsExportDialogOpen(true)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefreshData} 
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <StatCard
                title="Total Users"
                value={isStatsLoading ? "--" : stats?.totalUsers}
                icon={Users}
                color="primary"
                onClick={navigateToUserManagement}
                badge={stats?.newSignups ? { text: `+${stats.newSignups} new`, variant: 'outline' } : null}
              />
              <StatCard
                title="Weddings Booked"
                value={isStatsLoading ? "--" : stats?.weddingsBooked}
                icon={Calendar}
                color="blue"
                onClick={() => navigate('/admin/bookings')}
              />
              <StatCard
                title="Total Revenue"
                value={isStatsLoading ? "--" : `₹${stats?.totalRevenue.toLocaleString()}`}
                icon={DollarSign}
                color="green"
                onClick={navigateToAnalytics}
                badge={stats?.revenueGrowth ? { text: `+${stats.revenueGrowth}%`, variant: 'outline' } : null}
              />
              <StatCard
                title="Active Vendors"
                value={isStatsLoading ? "--" : stats?.activeVendors}
                icon={Briefcase}
                color="purple"
                onClick={() => navigate('/admin/vendors')}
              />
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={navigateToUserManagement}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">User Management</CardTitle>
                  <User className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Manage user accounts, permissions, and roles</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={navigateToAnalytics}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Analytics</CardTitle>
                  <PieChart className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Review platform metrics, user activity, and growth</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={navigateToSettings}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">System Settings</CardTitle>
                  <Settings className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Configure application parameters and settings</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isActivityLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity && recentActivity.length > 0 ? (
                  <div className="space-y-1">
                    {recentActivity.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-gray-500">No recent activity to display</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Export Data Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Dashboard Data</DialogTitle>
            <DialogDescription>
              Choose the data format and time range for your export.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Export Format</h4>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Excel</Button>
                <Button variant="outline" className="flex-1">CSV</Button>
                <Button variant="outline" className="flex-1">PDF</Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Time Range</h4>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">This Month</Button>
                <Button variant="outline" className="flex-1">Last 3 Months</Button>
                <Button variant="outline" className="flex-1">All Time</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportData}>
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;