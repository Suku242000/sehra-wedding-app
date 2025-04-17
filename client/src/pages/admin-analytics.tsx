import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Users, CreditCard, List, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { UserRole } from '@shared/schema';
import { useAuth } from '@/lib/auth';

// Define the color schemes
const COLORS = ['#800000', '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2'];
const TASKS_COLORS = {
  'completed': '#4CAF50',
  'in_progress': '#2196F3',
  'pending': '#FFC107'
};
const BUDGET_COLORS = {
  'venue': '#800000',
  'catering': '#FF6B6B',
  'decoration': '#FFD166',
  'photography': '#06D6A0',
  'other': '#118AB2'
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const AdminAnalytics: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<string>('month');
  const [dataView, setDataView] = useState<string>('summary');
  
  // Check if user is admin
  if (user?.role !== UserRole.ADMIN) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh] flex-col">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  // Fetch dashboard analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics', timeRange],
    queryFn: () => fetchWithAuth(`/api/admin/analytics?timeRange=${timeRange}`),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch user data
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/admin/users/stats'],
    queryFn: () => fetchWithAuth('/api/admin/users/stats'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch task statistics
  const { data: taskStats, isLoading: isTaskLoading } = useQuery({
    queryKey: ['/api/admin/tasks/stats'],
    queryFn: () => fetchWithAuth('/api/admin/tasks/stats'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch budget statistics
  const { data: budgetStats, isLoading: isBudgetLoading } = useQuery({
    queryKey: ['/api/admin/budget/stats'],
    queryFn: () => fetchWithAuth('/api/admin/budget/stats'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle CSV export
  const handleExportData = (dataType: string) => {
    toast({
      title: "Export Started",
      description: `${dataType} data export has been initiated.`,
    });
    
    // In a real implementation, we would call an API to generate and download a CSV
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${dataType} data has been exported.`,
      });
    }, 1500);
  };

  const isDataLoading = isLoading || isUserLoading || isTaskLoading || isBudgetLoading;

  // Generate placeholder data for initial development
  const userByRoleData = userData?.usersByRole || [
    { name: 'Bride', value: 28 },
    { name: 'Groom', value: 23 },
    { name: 'Family', value: 45 },
    { name: 'Vendor', value: 18 },
    { name: 'Supervisor', value: 12 }
  ];

  const userRegistrationTrend = userData?.registrationTrend || [
    { month: 'Jan', users: 10 },
    { month: 'Feb', users: 25 },
    { month: 'Mar', users: 35 },
    { month: 'Apr', users: 48 },
    { month: 'May', users: 60 },
    { month: 'Jun', users: 78 },
    { month: 'Jul', users: 90 }
  ];

  const taskStatusData = taskStats?.byStatus || [
    { name: 'Completed', value: 120 },
    { name: 'In Progress', value: 75 },
    { name: 'Pending', value: 45 }
  ];

  const budgetCategoryData = budgetStats?.byCategory || [
    { name: 'Venue', value: 4500000 },
    { name: 'Catering', value: 2800000 },
    { name: 'Decoration', value: 1500000 },
    { name: 'Photography', value: 850000 },
    { name: 'Other', value: 1200000 }
  ];

  const userActivityData = analyticsData?.userActivity || [
    { day: 'Mon', tasks: 25, budget: 15, guests: 8 },
    { day: 'Tue', tasks: 18, budget: 12, guests: 5 },
    { day: 'Wed', tasks: 30, budget: 20, guests: 10 },
    { day: 'Thu', tasks: 22, budget: 18, guests: 7 },
    { day: 'Fri', tasks: 28, budget: 23, guests: 9 },
    { day: 'Sat', tasks: 15, budget: 10, guests: 12 },
    { day: 'Sun', tasks: 10, budget: 8, guests: 4 }
  ];

  const packageDistribution = analyticsData?.packageDistribution || [
    { name: 'Silver', value: 45 },
    { name: 'Gold', value: 35 },
    { name: 'Platinum', value: 20 }
  ];

  const renderContent = () => {
    if (isDataLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="w-full">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <Tabs defaultValue="summary" value={dataView} onValueChange={setDataView} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => handleExportData(dataView)}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{userData?.totalUsers || 126}</div>
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                    +{userData?.growth?.users || 12}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Compared to last {timeRange}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Weddings</CardTitle>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{analyticsData?.totalWeddings || 84}</div>
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                    +{analyticsData?.growth?.weddings || 18}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Compared to last {timeRange}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{analyticsData?.totalRevenue ? formatCurrency(analyticsData.totalRevenue) : '₹1.2 Cr'}</div>
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                    +{analyticsData?.growth?.revenue || 22}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Compared to last {timeRange}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Distribution of users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userByRoleData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {userByRoleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Package Distribution</CardTitle>
                <CardDescription>Wedding packages selected by users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={packageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} weddings`, 'Count']} />
                      <Bar dataKey="value" fill="#800000" radius={[4, 4, 0, 0]}>
                        {packageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registration trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userRegistrationTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} users`, 'Registrations']} />
                      <Line type="monotone" dataKey="users" stroke="#800000" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Daily activity across features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tasks" name="Tasks" fill="#800000" />
                      <Bar dataKey="budget" name="Budget" fill="#FFD166" />
                      <Bar dataKey="guests" name="Guests" fill="#06D6A0" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  <div className="text-2xl font-bold">{userData?.totalUsers || 126}</div>
                </div>
                <Users className="h-8 w-8 text-[#800000]" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">All registered accounts</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                  <div className="text-2xl font-bold">{userData?.activeUsers || 98}</div>
                </div>
                <Users className="h-8 w-8 text-[#06D6A0]" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Users active in last 30 days</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">New Users</CardTitle>
                  <div className="text-2xl font-bold">{userData?.newUsers || 24}</div>
                </div>
                <Users className="h-8 w-8 text-[#FFD166]" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Registered in last 30 days</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Distribution of users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userByRoleData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {userByRoleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registration trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userRegistrationTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} users`, 'Registrations']} />
                      <Line type="monotone" dataKey="users" stroke="#800000" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>Weekly retention rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { week: 'Week 1', rate: 100 },
                      { week: 'Week 2', rate: 85 },
                      { week: 'Week 3', rate: 75 },
                      { week: 'Week 4', rate: 68 },
                      { week: 'Week 5', rate: 65 },
                      { week: 'Week 6', rate: 62 },
                      { week: 'Week 7', rate: 60 },
                      { week: 'Week 8', rate: 58 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Retention Rate']} />
                      <Line type="monotone" dataKey="rate" stroke="#800000" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                  <div className="text-2xl font-bold">{taskStats?.totalTasks || 240}</div>
                </div>
                <List className="h-8 w-8 text-[#800000]" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">All tasks created by users</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
                  <div className="text-2xl font-bold">{taskStats?.completedTasks || 120}</div>
                </div>
                <List className="h-8 w-8 text-[#4CAF50]" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Completion rate: {taskStats?.completionRate || 50}%
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Per User</CardTitle>
                  <div className="text-2xl font-bold">{taskStats?.tasksPerUser || 12}</div>
                </div>
                <List className="h-8 w-8 text-[#FFD166]" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Average tasks per active user</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>Breakdown by task status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={TASKS_COLORS['completed']} />
                        <Cell fill={TASKS_COLORS['in_progress']} />
                        <Cell fill={TASKS_COLORS['pending']} />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Trend</CardTitle>
                <CardDescription>Weekly task completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { week: 'Week 1', completed: 18, total: 25 },
                      { week: 'Week 2', completed: 22, total: 30 },
                      { week: 'Week 3', completed: 28, total: 35 },
                      { week: 'Week 4', completed: 32, total: 40 },
                      { week: 'Week 5', completed: 42, total: 50 },
                      { week: 'Week 6', completed: 48, total: 55 },
                      { week: 'Week 7', completed: 52, total: 60 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="completed" name="Completed" stroke="#4CAF50" strokeWidth={2} />
                      <Line type="monotone" dataKey="total" name="Total" stroke="#800000" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Task Priority Distribution</CardTitle>
                <CardDescription>Tasks by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { priority: 'Low', completed: 35, inProgress: 12, pending: 8 },
                      { priority: 'Medium', completed: 60, inProgress: 30, pending: 20 },
                      { priority: 'High', completed: 25, inProgress: 33, pending: 17 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" name="Completed" stackId="a" fill={TASKS_COLORS['completed']} />
                      <Bar dataKey="inProgress" name="In Progress" stackId="a" fill={TASKS_COLORS['in_progress']} />
                      <Bar dataKey="pending" name="Pending" stackId="a" fill={TASKS_COLORS['pending']} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
                  <div className="text-2xl font-bold">{budgetStats?.totalBudget ? formatCurrency(budgetStats.totalBudget) : '₹10.85 Cr'}</div>
                </div>
                <CreditCard className="h-8 w-8 text-[#800000]" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Cumulative budget across all weddings</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Budget</CardTitle>
                  <div className="text-2xl font-bold">{budgetStats?.averageBudget ? formatCurrency(budgetStats.averageBudget) : '₹35.5 L'}</div>
                </div>
                <CreditCard className="h-8 w-8 text-[#FFD166]" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Average wedding budget</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Budget Items</CardTitle>
                  <div className="text-2xl font-bold">{budgetStats?.totalItems || 845}</div>
                </div>
                <List className="h-8 w-8 text-[#06D6A0]" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Total budget items created</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget by Category</CardTitle>
                <CardDescription>Allocation across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetCategoryData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {budgetCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Budget by Package</CardTitle>
                <CardDescription>Average budget across packages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Silver', value: 2500000 },
                      { name: 'Gold', value: 4500000 },
                      { name: 'Platinum', value: 8000000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `₹${value / 100000}L`} />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Average Budget']} />
                      <Bar dataKey="value" fill="#800000" radius={[4, 4, 0, 0]}>
                        {packageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Budget Timeline</CardTitle>
                <CardDescription>Budget creation trend over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Jan', allocated: 1200000, spent: 800000 },
                      { month: 'Feb', allocated: 1800000, spent: 1250000 },
                      { month: 'Mar', allocated: 2400000, spent: 1800000 },
                      { month: 'Apr', allocated: 3100000, spent: 2200000 },
                      { month: 'May', allocated: 3800000, spent: 2800000 },
                      { month: 'Jun', allocated: 4500000, spent: 3200000 },
                      { month: 'Jul', allocated: 5200000, spent: 3800000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₹${value / 100000}L`} />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                      <Legend />
                      <Line type="monotone" dataKey="allocated" name="Allocated" stroke="#800000" strokeWidth={2} />
                      <Line type="monotone" dataKey="spent" name="Spent" stroke="#FFD166" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Layout>
      <motion.div
        variants={fadeIn('up', 'tween', 0.1, 0.8)}
        initial="hidden"
        animate="show"
        className="container mx-auto px-4 py-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#800000]">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights into platform performance
            </p>
          </div>
          <Button className="bg-[#800000] hover:bg-[#5c0000] text-white mt-4 md:mt-0">
            <Calendar className="h-4 w-4 mr-2" /> Generate Report
          </Button>
        </div>

        {renderContent()}
      </motion.div>
    </Layout>
  );
};

export default AdminAnalytics;