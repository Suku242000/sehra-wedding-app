import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, BarChart3, TrendingUp, Users, Briefcase, DollarSign, Map, Activity } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

// API service functions
const API = {
  getUserRolesStats: async () => {
    const response = await axios.get('/api/admin/analytics/user-roles');
    return response.data;
  },
  getEventStats: async () => {
    const response = await axios.get('/api/admin/analytics/events');
    return response.data;
  },
  getVendorStats: async () => {
    const response = await axios.get('/api/admin/analytics/vendors');
    return response.data;
  },
  getBudgetStats: async () => {
    const response = await axios.get('/api/admin/analytics/budget');
    return response.data;
  },
  getRegionalStats: async () => {
    const response = await axios.get('/api/admin/analytics/regions');
    return response.data;
  },
  getEngagementStats: async () => {
    const response = await axios.get('/api/admin/analytics/engagement');
    return response.data;
  },
  getTrendStats: async () => {
    const response = await axios.get('/api/admin/analytics/trends');
    return response.data;
  },
};

// Dashboard component
const Dashboard = () => {
  const { user } = useAuth();
  
  // Queries for various analytics
  const userRolesQuery = useQuery({
    queryKey: ['admin', 'analytics', 'user-roles'],
    queryFn: API.getUserRolesStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const eventStatsQuery = useQuery({
    queryKey: ['admin', 'analytics', 'events'],
    queryFn: API.getEventStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const vendorStatsQuery = useQuery({
    queryKey: ['admin', 'analytics', 'vendors'],
    queryFn: API.getVendorStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const budgetStatsQuery = useQuery({
    queryKey: ['admin', 'analytics', 'budget'],
    queryFn: API.getBudgetStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const regionalStatsQuery = useQuery({
    queryKey: ['admin', 'analytics', 'regions'],
    queryFn: API.getRegionalStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const engagementStatsQuery = useQuery({
    queryKey: ['admin', 'analytics', 'engagement'],
    queryFn: API.getEngagementStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const trendStatsQuery = useQuery({
    queryKey: ['admin', 'analytics', 'trends'],
    queryFn: API.getTrendStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Loading state for all queries
  const isLoading = 
    userRolesQuery.isLoading || 
    eventStatsQuery.isLoading || 
    vendorStatsQuery.isLoading || 
    budgetStatsQuery.isLoading || 
    regionalStatsQuery.isLoading || 
    engagementStatsQuery.isLoading || 
    trendStatsQuery.isLoading;
  
  // Extract stats from queries
  const userRolesStats = userRolesQuery.data || {};
  const eventStats = eventStatsQuery.data || {};
  const vendorStats = vendorStatsQuery.data || {};
  const budgetStats = budgetStatsQuery.data || {};
  const regionalStats = regionalStatsQuery.data || {};
  const engagementStats = engagementStatsQuery.data || {};
  const trendStats = trendStatsQuery.data || {};
  
  // Stat card component
  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'maroon' }) => {
    const colorClasses = {
      maroon: {
        bg: 'bg-maroon-50',
        text: 'text-maroon-700',
        icon: 'text-maroon-500',
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: 'text-blue-500',
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        icon: 'text-green-500',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        icon: 'text-purple-500',
      },
      amber: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        icon: 'text-amber-500',
      },
      teal: {
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        icon: 'text-teal-500',
      },
    };
    
    const colors = colorClasses[color] || colorClasses.maroon;
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className="mt-1 flex items-baseline">
                <p className={`text-2xl font-semibold ${colors.text}`}>
                  {isLoading ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
                  ) : (
                    value
                  )}
                </p>
                {trend && (
                  <span className={`ml-2 text-xs ${
                    parseFloat(trend) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {parseFloat(trend) >= 0 ? '+' : ''}{trend}%
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
            <div className={`rounded-full p-3 ${colors.bg}`}>
              <Icon className={`h-5 w-5 ${colors.icon}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Layout>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-maroon-700">Admin Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.name}. Here's what's happening with Sehra today.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                <span>Apr 18, 2025</span>
              </Button>
              <Button className="bg-maroon-700 hover:bg-maroon-800">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={userRolesStats.totalUsers || '0'}
              subtitle="Active accounts"
              icon={Users}
              trend={userRolesStats.userGrowth || '0'}
              color="maroon"
            />
            <StatCard
              title="Weddings Booked"
              value={eventStats.totalWeddings || '0'}
              subtitle="This month"
              icon={Calendar}
              trend={eventStats.weddingGrowth || '0'}
              color="blue"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${budgetStats.totalRevenue?.toLocaleString() || '0'}`}
              subtitle="Current year"
              icon={DollarSign}
              trend={budgetStats.revenueGrowth || '0'}
              color="green"
            />
            <StatCard
              title="Active Vendors"
              value={vendorStats.activeVendors || '0'}
              subtitle="Premium vendors"
              icon={Briefcase}
              trend={vendorStats.vendorGrowth || '0'}
              color="purple"
            />
          </div>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Platform Overview</TabsTrigger>
              <TabsTrigger value="users">User Analytics</TabsTrigger>
              <TabsTrigger value="revenue">Revenue Metrics</TabsTrigger>
              <TabsTrigger value="regions">Regional Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Metrics</CardTitle>
                    <CardDescription>
                      Key metrics for the Sehra platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-8 animate-pulse rounded bg-gray-200" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Task Completion Rate</span>
                          <span className="text-sm font-bold">{engagementStats.taskCompletionRate || '0'}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Avg. Time on Platform</span>
                          <span className="text-sm font-bold">{engagementStats.avgTimeOnPlatform || '0'} min</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Vendor Booking Rate</span>
                          <span className="text-sm font-bold">{vendorStats.bookingRate || '0'}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Customer Retention</span>
                          <span className="text-sm font-bold">{engagementStats.retentionRate || '0'}%</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Trend Analysis</CardTitle>
                    <CardDescription>
                      Emerging trends in wedding planning
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-8 animate-pulse rounded bg-gray-200" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(trendStats)
                          .filter(([key]) => key !== 'topThemes')
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                              <span className="text-sm font-bold">{value}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="users">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of user roles across the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-8 animate-pulse rounded bg-gray-200" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(userRolesStats)
                          .filter(([key]) => !['totalUsers', 'userGrowth'].includes(key))
                          .map(([role, count]) => (
                            <div key={role} className="flex justify-between items-center">
                              <span className="text-sm font-medium capitalize">
                                {role.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </span>
                              <span className="text-sm font-bold">{count}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>User Engagement</CardTitle>
                    <CardDescription>
                      User activity and engagement metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-8 animate-pulse rounded bg-gray-200" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Daily Active Users</span>
                          <span className="text-sm font-bold">{engagementStats.dailyActiveUsers || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Monthly Active Users</span>
                          <span className="text-sm font-bold">{engagementStats.monthlyActiveUsers || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Avg. Sessions Per User</span>
                          <span className="text-sm font-bold">{engagementStats.avgSessionsPerUser || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">New Registrations (MTD)</span>
                          <span className="text-sm font-bold">{userRolesStats.newUsers || '0'}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="revenue">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Breakdown</CardTitle>
                    <CardDescription>
                      Revenue sources and package distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-8 animate-pulse rounded bg-gray-200" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Silver Package</span>
                          <span className="text-sm font-bold">₹{budgetStats.silverRevenue?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Gold Package</span>
                          <span className="text-sm font-bold">₹{budgetStats.goldRevenue?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Platinum Package</span>
                          <span className="text-sm font-bold">₹{budgetStats.platinumRevenue?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Vendor Subscriptions</span>
                          <span className="text-sm font-bold">₹{budgetStats.vendorRevenue?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Metrics</CardTitle>
                    <CardDescription>
                      Key financial indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-8 animate-pulse rounded bg-gray-200" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Average Order Value</span>
                          <span className="text-sm font-bold">₹{budgetStats.avgOrderValue?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">MoM Revenue Growth</span>
                          <span className="text-sm font-bold">{budgetStats.momGrowth || '0'}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">YoY Revenue Growth</span>
                          <span className="text-sm font-bold">{budgetStats.yoyGrowth || '0'}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Projected Annual Revenue</span>
                          <span className="text-sm font-bold">₹{budgetStats.projectedAnnual?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="regions">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Regions</CardTitle>
                    <CardDescription>
                      Highest performing regions by user count
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="h-8 animate-pulse rounded bg-gray-200" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {regionalStats.topRegions?.map((region, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{region.name}</span>
                            <span className="text-sm font-bold">{region.count} users</span>
                          </div>
                        )) || (
                          <p className="text-sm text-gray-500">No regional data available</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Regional Growth</CardTitle>
                    <CardDescription>
                      Fastest growing regions by percentage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="h-8 animate-pulse rounded bg-gray-200" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {regionalStats.fastestGrowing?.map((region, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{region.name}</span>
                            <span className="text-sm font-bold text-green-600">+{region.growth}%</span>
                          </div>
                        )) || (
                          <p className="text-sm text-gray-500">No growth data available</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;