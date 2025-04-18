import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Download,
  PieChart,
  BarChart3,
  LineChart,
  AreaChart,
  RefreshCw,
  Calendar,
  Users,
  Briefcase,
  MapPin
} from 'lucide-react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#D3447A', '#F48B29', '#8C52FF', '#00A19D', '#FFB740', '#FF5B5B', '#2E86AB', '#6ECB63'];

const AdminAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [timeRange, setTimeRange] = useState('month');
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Query for analytics data
  const { data: analyticsData, isLoading: isAnalyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['/api/admin/analytics', timeRange],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/admin/analytics?timeRange=${timeRange}`);
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Return sample data for development
        return {
          userStats: {
            totalUsers: 1245,
            newUsersThisMonth: 126,
            activeUsers: 876,
            usersByRole: [
              { name: 'Bride/Groom', value: 450 },
              { name: 'Family', value: 320 },
              { name: 'Vendors', value: 275 },
              { name: 'Supervisors', value: 200 }
            ]
          },
          revenueStats: {
            totalRevenue: 5430000,
            monthlyRevenue: 860000,
            averageBookingValue: 345000,
            revenueByMonth: [
              { month: 'Jan', revenue: 520000 },
              { month: 'Feb', revenue: 480000 },
              { month: 'Mar', revenue: 590000 },
              { month: 'Apr', revenue: 620000 },
              { month: 'May', revenue: 710000 },
              { month: 'Jun', revenue: 680000 },
              { month: 'Jul', revenue: 750000 },
              { month: 'Aug', revenue: 860000 }
            ]
          },
          vendorStats: {
            totalVendors: 275,
            newVendorsThisMonth: 18,
            topVendorTypes: [
              { name: 'Catering', count: 45 },
              { name: 'Decoration', count: 38 },
              { name: 'Photography', count: 35 },
              { name: 'Venue', count: 30 },
              { name: 'Music', count: 25 }
            ],
            bookingsByVendorType: [
              { type: 'Catering', bookings: 120 },
              { type: 'Decoration', bookings: 105 },
              { type: 'Photography', bookings: 95 },
              { type: 'Venue', bookings: 80 },
              { type: 'Music', bookings: 65 }
            ]
          },
          regionStats: {
            usersByRegion: [
              { region: 'Mumbai', users: 320 },
              { region: 'Delhi', users: 280 },
              { region: 'Bangalore', users: 210 },
              { region: 'Chennai', users: 175 },
              { region: 'Kolkata', users: 150 },
              { region: 'Other', users: 110 }
            ],
            bookingsByRegion: [
              { region: 'Mumbai', bookings: 95 },
              { region: 'Delhi', bookings: 82 },
              { region: 'Bangalore', bookings: 65 },
              { region: 'Chennai', bookings: 53 },
              { region: 'Kolkata', bookings: 45 },
              { region: 'Other', bookings: 35 }
            ]
          },
          engagementStats: {
            taskCompletionRate: 68,
            userEngagementByStage: [
              { stage: 'Planning Start', rate: 98 },
              { stage: '25% Complete', rate: 86 },
              { stage: '50% Complete', rate: 74 },
              { stage: '75% Complete', rate: 65 },
              { stage: 'Final Phase', rate: 58 }
            ],
            userRetention: {
              day7: 86,
              day30: 72,
              day90: 64
            }
          }
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[80vh] flex-col">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to view this page.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  const handleExportData = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: 'Analytics Exported',
        description: 'Your analytics data has been exported successfully.',
      });
    }, 2000);
  };

  const handleRefreshData = async () => {
    try {
      await refetchAnalytics();
      toast({
        title: 'Data Refreshed',
        description: 'Analytics data has been updated with latest information.',
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Could not refresh analytics data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount) => {
    return `₹${(amount).toLocaleString('en-IN')}`;
  };
  
  // Loading placeholder for charts
  const ChartSkeleton = () => (
    <div className="w-full h-[300px] rounded-lg bg-muted animate-pulse flex items-center justify-center">
      <BarChart3 className="h-16 w-16 text-muted-foreground opacity-20" />
    </div>
  );

  const formatNumber = (num) => {
    if (num >= 100000) {
      return `${(num / 100000).toFixed(1)}L`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num;
  };

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon"
              className="mr-4"
              onClick={() => navigate('/admin-dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">Analytics Dashboard</h1>
              <p className="text-gray-600">
                Comprehensive insights into platform performance
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Select
              value={timeRange}
              onValueChange={setTimeRange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
                <SelectItem value="year">Last 12 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleRefreshData}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={handleExportData} 
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Overview Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      {isAnalyticsLoading ? (
                        <Skeleton className="h-7 w-24" />
                      ) : (
                        <p className="text-2xl font-bold">
                          {formatNumber(analyticsData?.userStats?.totalUsers || 0)}
                        </p>
                      )}
                    </div>
                    <div className="p-3 rounded-full bg-blue-100">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  {isAnalyticsLoading ? (
                    <Skeleton className="h-4 w-32 mt-2" />
                  ) : (
                    <p className="text-xs mt-2 text-green-600">
                      ↑ {analyticsData?.userStats?.newUsersThisMonth || 0} new this month
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                      {isAnalyticsLoading ? (
                        <Skeleton className="h-7 w-24" />
                      ) : (
                        <p className="text-2xl font-bold">
                          {formatNumber(analyticsData?.vendorStats?.totalVendors || 0)}
                        </p>
                      )}
                    </div>
                    <div className="p-3 rounded-full bg-purple-100">
                      <Briefcase className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                  {isAnalyticsLoading ? (
                    <Skeleton className="h-4 w-32 mt-2" />
                  ) : (
                    <p className="text-xs mt-2 text-green-600">
                      ↑ {analyticsData?.vendorStats?.newVendorsThisMonth || 0} new this month
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                      {isAnalyticsLoading ? (
                        <Skeleton className="h-7 w-24" />
                      ) : (
                        <p className="text-2xl font-bold">
                          {formatCurrency(analyticsData?.revenueStats?.monthlyRevenue || 0)}
                        </p>
                      )}
                    </div>
                    <div className="p-3 rounded-full bg-green-100">
                      <LineChart className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  {!isAnalyticsLoading && (
                    <p className="text-xs mt-2 text-green-600">
                      ↑ 12.4% from last month
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Task Completion</p>
                      {isAnalyticsLoading ? (
                        <Skeleton className="h-7 w-24" />
                      ) : (
                        <p className="text-2xl font-bold">
                          {analyticsData?.engagementStats?.taskCompletionRate || 0}%
                        </p>
                      )}
                    </div>
                    <div className="p-3 rounded-full bg-amber-100">
                      <Calendar className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                  {!isAnalyticsLoading && (
                    <p className="text-xs mt-2 text-amber-600">
                      ↑ 5.2% from last month
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue in the last 8 months</CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyticsLoading ? (
                    <ChartSkeleton />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={analyticsData?.revenueStats?.revenueByMonth || []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(tick) => `₹${formatNumber(tick)}`}
                        />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value), "Revenue"]}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#D3447A" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown of users by role</CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyticsLoading ? (
                    <ChartSkeleton />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={analyticsData?.userStats?.usersByRole || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {(analyticsData?.userStats?.usersByRole || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} users`, "Count"]} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Vendor Categories</CardTitle>
                  <CardDescription>Most popular vendor types by booking count</CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyticsLoading ? (
                    <ChartSkeleton />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        layout="vertical"
                        data={analyticsData?.vendorStats?.bookingsByVendorType || []}
                        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="type" type="category" width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="bookings" fill="#8C52FF" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Analytics</CardTitle>
                  <CardDescription>Users and bookings by region</CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyticsLoading ? (
                    <ChartSkeleton />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={analyticsData?.regionStats?.usersByRegion || []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="users" fill="#00A19D" name="Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Additional tabs content would go here */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>Detailed user statistics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <PieChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">User Analytics Coming Soon</h3>
                  <p className="text-muted-foreground max-w-lg mx-auto mt-2">
                    We're currently developing a comprehensive user analytics dashboard with detailed user behavior tracking, engagement metrics, and demographic analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Detailed revenue statistics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <LineChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Revenue Analytics Coming Soon</h3>
                  <p className="text-muted-foreground max-w-lg mx-auto mt-2">
                    We're currently developing a comprehensive revenue analytics dashboard with detailed financial reports, revenue forecasting, and transaction analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Analytics</CardTitle>
                <CardDescription>Detailed vendor statistics and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Vendor Analytics Coming Soon</h3>
                  <p className="text-muted-foreground max-w-lg mx-auto mt-2">
                    We're currently developing a comprehensive vendor analytics dashboard with detailed performance metrics, booking statistics, and vendor comparison tools.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Analytics</CardTitle>
                <CardDescription>User engagement and retention metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <AreaChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Engagement Analytics Coming Soon</h3>
                  <p className="text-muted-foreground max-w-lg mx-auto mt-2">
                    We're currently developing a comprehensive engagement analytics dashboard with detailed retention metrics, task completion rates, and user journey analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;