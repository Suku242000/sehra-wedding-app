import React from 'react';
import { User } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  Users,
  FileText, 
  Gift, 
  MapPin,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon, 
  Map,
  IndianRupee,
  TrendingUp,
  Clock
} from 'lucide-react';

interface AdvancedAnalyticsProps {
  users: User[];
}

// Color palette with Indian wedding-inspired colors
const COLORS = ['#D3447A', '#F48B29', '#8C52FF', '#00A19D', '#FFB740', '#FF5B5B', '#2E86AB', '#6ECB63'];

export default function AdvancedAnalytics({ users }: AdvancedAnalyticsProps) {
  const { data: roleData } = useQuery<any>({
    queryKey: ['/api/admin/analytics/user-roles'],
    staleTime: 60000,
  });

  const { data: eventData } = useQuery<any>({
    queryKey: ['/api/admin/analytics/events'],
    staleTime: 60000,
  });

  const { data: vendorData } = useQuery<any>({
    queryKey: ['/api/admin/analytics/vendors'],
    staleTime: 60000,
  });

  const { data: budgetData } = useQuery<any>({
    queryKey: ['/api/admin/analytics/budget'],
    staleTime: 60000,
  });

  const { data: regionData } = useQuery<any>({
    queryKey: ['/api/admin/analytics/regions'],
    staleTime: 60000,
  });

  const { data: trendData } = useQuery<any>({
    queryKey: ['/api/admin/analytics/trends'],
    staleTime: 60000,
  });

  const { data: engagementData } = useQuery<any>({
    queryKey: ['/api/admin/analytics/engagement'],
    staleTime: 60000,
  });

  // Default data if API responses haven't come in yet
  const defaultRoleData = [
    { name: 'Bride/Groom', value: 45 },
    { name: 'Family', value: 30 },
    { name: 'Vendors', value: 15 },
    { name: 'Supervisors', value: 10 },
  ];

  const defaultEngagementData = [
    { name: '0-25%', value: 15 },
    { name: '26-50%', value: 25 },
    { name: '51-75%', value: 30 },
    { name: '76-100%', value: 30 },
  ];

  const defaultVendorData = [
    { name: 'Catering', value: 22 },
    { name: 'Venue', value: 18 },
    { name: 'Photography', value: 15 },
    { name: 'Decoration', value: 14 },
    { name: 'Music', value: 11 },
    { name: 'Mehndi Artists', value: 10 },
    { name: 'Transportation', value: 6 },
    { name: 'Other', value: 4 },
  ];

  const defaultRegionData = [
    { name: 'North India', value: 35 },
    { name: 'South India', value: 30 },
    { name: 'West India', value: 20 },
    { name: 'East India', value: 12 },
    { name: 'International', value: 3 },
  ];

  const defaultBudgetData = [
    { name: 'Silver', min: 1000000, max: 3000000, avg: 2200000, count: 40 },
    { name: 'Gold', min: 3100000, max: 6000000, avg: 4500000, count: 35 },
    { name: 'Platinum', min: 6100000, max: 10000000, avg: 8000000, count: 25 },
  ];

  const defaultTrendData = [
    { month: 'Jan', users: 20 },
    { month: 'Feb', users: 25 },
    { month: 'Mar', users: 35 },
    { month: 'Apr', users: 45 },
    { month: 'May', users: 50 },
    { month: 'Jun', users: 70 },
    { month: 'Jul', users: 85 },
    { month: 'Aug', users: 90 },
    { month: 'Sep', users: 100 },
    { month: 'Oct', users: 110 },
    { month: 'Nov', users: 125 },
    { month: 'Dec', users: 140 },
  ];

  const formatIndianRupees = (value: number) => {
    // Convert to lakhs and crores format
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-gradient-to-r from-pink-100 to-amber-100 border-amber-300">
        <TrendingUp className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800">Analytics Dashboard</AlertTitle>
        <AlertDescription className="text-amber-700">
          Welcome to Sehra's advanced analytics. Track wedding trends, user engagement, and business metrics.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" /> Vendors
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" /> Budget
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-pink-500" />
                  User Distribution
                </CardTitle>
                <CardDescription>By role in the platform</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData || defaultRoleData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(roleData || defaultRoleData).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} users`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Growth Trend
                </CardTitle>
                <CardDescription>User acquisition over time</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData || defaultTrendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#D3447A"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Map className="h-5 w-5 text-amber-500" />
                  Regional Distribution
                </CardTitle>
                <CardDescription>Wedding locations by region</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionData || defaultRegionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(regionData || defaultRegionData).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} weddings`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                User Engagement Metrics
              </CardTitle>
              <CardDescription>Task completion rates and app usage frequency</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={engagementData || defaultEngagementData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar name="Task Completion %" dataKey="value" fill="#8C52FF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-pink-500" />
                  User Roles
                </CardTitle>
                <CardDescription>Distribution by role</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData || defaultRoleData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(roleData || defaultRoleData).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} users`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-green-500" />
                  User Growth
                </CardTitle>
                <CardDescription>Monthly trend</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData || defaultTrendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      name="Total Users"
                      stroke="#D3447A"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Map className="h-5 w-5 text-amber-500" />
                Regional Distribution
              </CardTitle>
              <CardDescription>Wedding locations by region</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionData || defaultRegionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar name="Weddings" dataKey="value" fill="#FFB740" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-pink-500" />
                  Vendor Categories
                </CardTitle>
                <CardDescription>Distribution by type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vendorData || defaultVendorData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(vendorData || defaultVendorData).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} vendors`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  Vendor Rating Distribution
                </CardTitle>
                <CardDescription>Performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { rating: '5 stars', count: 42 },
                      { rating: '4 stars', count: 28 },
                      { rating: '3 stars', count: 15 },
                      { rating: '2 stars', count: 10 },
                      { rating: '1 star', count: 5 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="Number of Vendors" dataKey="count" fill="#00A19D" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Map className="h-5 w-5 text-blue-500" />
                Vendor Bookings by Region
              </CardTitle>
              <CardDescription>Geographic distribution of vendor services</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { region: 'Delhi-NCR', catering: 35, venue: 28, photography: 22, decoration: 18 },
                    { region: 'Mumbai', catering: 30, venue: 25, photography: 20, decoration: 15 },
                    { region: 'Bangalore', catering: 25, venue: 20, photography: 18, decoration: 12 },
                    { region: 'Chennai', catering: 22, venue: 18, photography: 15, decoration: 10 },
                    { region: 'Kolkata', catering: 20, venue: 15, photography: 12, decoration: 8 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar name="Catering" dataKey="catering" stackId="a" fill="#D3447A" />
                  <Bar name="Venue" dataKey="venue" stackId="a" fill="#F48B29" />
                  <Bar name="Photography" dataKey="photography" stackId="a" fill="#8C52FF" />
                  <Bar name="Decoration" dataKey="decoration" stackId="a" fill="#00A19D" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-pink-500" />
                  Package Distribution
                </CardTitle>
                <CardDescription>Selected wedding packages</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetData?.packages || defaultBudgetData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(budgetData?.packages || defaultBudgetData).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any, name: any) => [value, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  Average Budget by Package
                </CardTitle>
                <CardDescription>In Indian Rupees</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={budgetData?.packages || defaultBudgetData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatIndianRupees} />
                    <Tooltip formatter={(value: any) => [formatIndianRupees(value), 'Budget']} />
                    <Legend />
                    <Bar name="Average Budget" dataKey="avg" fill="#8C52FF" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Budget Allocation by Category
              </CardTitle>
              <CardDescription>Where clients spend the most</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { category: 'Venue', percentage: 30 },
                    { category: 'Catering', percentage: 25 },
                    { category: 'Decoration', percentage: 15 },
                    { category: 'Photography', percentage: 10 },
                    { category: 'Attire', percentage: 10 },
                    { category: 'Music', percentage: 5 },
                    { category: 'Other', percentage: 5 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis unit="%" />
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Budget Allocation']} />
                  <Legend />
                  <Bar name="Budget Percentage" dataKey="percentage" fill="#D3447A" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6 bg-gradient-to-r from-amber-50 to-pink-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg text-amber-800">Indian Wedding Insights</CardTitle>
          <CardDescription className="text-amber-700">Cultural trends and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white bg-opacity-60 rounded-lg shadow-sm">
              <Calendar className="text-pink-600 h-10 w-10" />
              <div>
                <h3 className="font-medium">Popular Months</h3>
                <p className="text-sm text-muted-foreground">Nov-Feb (70% weddings)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white bg-opacity-60 rounded-lg shadow-sm">
              <Users className="text-amber-600 h-10 w-10" />
              <div>
                <h3 className="font-medium">Average Guest Count</h3>
                <p className="text-sm text-muted-foreground">250-350 guests</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white bg-opacity-60 rounded-lg shadow-sm">
              <Gift className="text-purple-600 h-10 w-10" />
              <div>
                <h3 className="font-medium">Top Ceremony</h3>
                <p className="text-sm text-muted-foreground">Sangeet (92% inclusion)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white bg-opacity-60 rounded-lg shadow-sm">
              <MapPin className="text-green-600 h-10 w-10" />
              <div>
                <h3 className="font-medium">Top Destination</h3>
                <p className="text-sm text-muted-foreground">Rajasthan (28%)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}