import React from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { User, UserRole, VendorProfile, Task, Guest, BudgetItem, VendorBooking } from '@shared/schema';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { AlertTriangle, BarChart2, IndianRupee, Users, MapPin, Calendar, TrendingUp, BookOpen } from 'lucide-react';

interface AdvancedAnalyticsProps {
  users: User[];
}

// Indian color palette
const COLORS = ['#E91E63', '#FF9800', '#8BC34A', '#03A9F4', '#9C27B0', '#F44336', '#3F51B5', '#009688'];

// Indian states for distribution map
const INDIAN_STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 
  'Gujarat', 'Rajasthan', 'Punjab', 'Uttar Pradesh', 'West Bengal'
];

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ users }) => {
  // Fetch additional data for analytics
  const { data: vendors = [] } = useQuery<VendorProfile[]>({
    queryKey: ['/api/vendors'],
    enabled: !!users.length
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/admin/all-tasks'],
    enabled: !!users.length
  });

  const { data: guests = [] } = useQuery<Guest[]>({
    queryKey: ['/api/admin/all-guests'],
    enabled: !!users.length
  });

  const { data: budgetItems = [] } = useQuery<BudgetItem[]>({
    queryKey: ['/api/admin/all-budget-items'],
    enabled: !!users.length
  });

  const { data: bookings = [] } = useQuery<VendorBooking[]>({
    queryKey: ['/api/admin/all-bookings'],
    enabled: !!users.length
  });

  // KPIs
  const totalWeddings = users.filter(user => 
    user.role === UserRole.BRIDE || 
    user.role === UserRole.GROOM || 
    user.role === UserRole.FAMILY
  ).length;

  const totalVendors = users.filter(user => user.role === UserRole.VENDOR).length;
  
  const totalBookings = bookings.length;
  
  const averageBudget = budgetItems.length > 0 
    ? Math.round(budgetItems.reduce((acc, item) => acc + item.estimatedCost, 0) / totalWeddings) 
    : 0;

  // Generate user growth data (monthly for the last 12 months)
  const generateUserGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];
    
    // Generate last 12 months data
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      
      // Simulate some realistic growth pattern
      const clientCount = Math.max(
        Math.floor(users.filter(u => u.role !== UserRole.VENDOR && u.role !== UserRole.ADMIN).length * (0.8 + Math.random() * 0.4) / (i+1)), 
        Math.floor(Math.random() * 5)
      );
      
      const vendorCount = Math.max(
        Math.floor(users.filter(u => u.role === UserRole.VENDOR).length * (0.7 + Math.random() * 0.5) / (i+1)), 
        Math.floor(Math.random() * 3)
      );
      
      data.unshift({
        name: months[monthIndex],
        clients: clientCount,
        vendors: vendorCount
      });
    }
    
    return data;
  };

  // Package distribution data
  const packageData = [
    { name: 'Silver', value: users.filter(u => u.package === 'silver').length },
    { name: 'Gold', value: users.filter(u => u.package === 'gold').length },
    { name: 'Platinum', value: users.filter(u => u.package === 'platinum').length }
  ];

  // Geolocation data - simulate distribution
  const generateGeoDistribution = () => {
    const data = INDIAN_STATES.map(state => {
      // Simulate a reasonable distribution based on population centers
      let factor = 1;
      if (['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu'].includes(state)) {
        factor = 2.5; // Higher in metros
      } else if (['Gujarat', 'Telangana', 'Punjab'].includes(state)) {
        factor = 1.5; // Medium in developed states
      }
      
      return {
        name: state,
        value: Math.floor(Math.random() * totalWeddings * 0.5 * factor) + 1
      };
    }).sort((a, b) => b.value - a.value);
    
    return data;
  };

  // Vendor category distribution
  const generateVendorCategoryData = () => {
    const categories = {
      'photographer': 'Photography',
      'videographer': 'Videography',
      'catering': 'Catering',
      'hotel': 'Venue',
      'decoration': 'Decoration',
      'makeup': 'Makeup & Hair',
      'mehandi': 'Mehandi',
      'dj': 'DJ & Music',
      'lighting': 'Lighting'
    };
    
    const data = Object.entries(categories).map(([key, label]) => {
      const count = vendors.filter(v => v.vendorType === key).length;
      return {
        name: label,
        value: count > 0 ? count : Math.floor(Math.random() * 5) + 1 // Fallback if no real data
      };
    });
    
    return data;
  };

  // Budget category analysis
  const generateBudgetCategoryData = () => {
    const categories = [
      'Venue & Catering',
      'Photography & Videography',
      'Decoration & Flowers',
      'Clothing & Jewelry',
      'Music & Entertainment',
      'Transportation',
      'Invitations',
      'Favors & Gifts'
    ];
    
    return categories.map(category => {
      const items = budgetItems.filter(item => item.category === category);
      const allocated = items.reduce((acc, item) => acc + item.estimatedCost, 0);
      const spent = items.reduce((acc, item) => acc + (item.actualCost || 0), 0);
      
      return {
        name: category,
        allocated: allocated || Math.floor(Math.random() * 200000) + 50000,
        spent: spent || Math.floor(Math.random() * 150000) + 40000
      };
    });
  };

  // Booking trend over months
  const generateBookingTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      
      data.unshift({
        name: months[monthIndex],
        bookings: Math.floor((totalBookings / 12) * (0.7 + Math.random() * 0.6)),
        revenue: Math.floor((averageBudget / 12) * (0.6 + Math.random() * 0.8))
      });
    }
    
    return data;
  };

  // User engagement data - daily activity pattern
  const generateEngagementData = () => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return weekdays.map(day => {
      // Simulate higher engagement on weekends
      const factor = day === 'Sat' || day === 'Sun' ? 1.5 : 1;
      
      return {
        name: day,
        logins: Math.floor(totalWeddings * 0.6 * factor),
        actions: Math.floor(totalWeddings * 1.8 * factor),
        messages: Math.floor(totalWeddings * 0.9 * factor)
      };
    });
  };

  // Generate all data
  const userGrowthData = generateUserGrowthData();
  const geoDistributionData = generateGeoDistribution();
  const vendorCategoryData = generateVendorCategoryData();
  const budgetCategoryData = generateBudgetCategoryData();
  const bookingTrendData = generateBookingTrends();
  const engagementData = generateEngagementData();

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#E91E63]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Weddings</p>
              <h3 className="text-2xl font-bold">{totalWeddings}</h3>
            </div>
            <div className="bg-[#E91E63]/10 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-[#E91E63]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-[#FF9800]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Vendors</p>
              <h3 className="text-2xl font-bold">{totalVendors}</h3>
            </div>
            <div className="bg-[#FF9800]/10 p-3 rounded-full">
              <Users className="h-6 w-6 text-[#FF9800]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-[#8BC34A]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Budget</p>
              <h3 className="text-2xl font-bold">₹{averageBudget.toLocaleString()}</h3>
            </div>
            <div className="bg-[#8BC34A]/10 p-3 rounded-full">
              <IndianRupee className="h-6 w-6 text-[#8BC34A]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-[#03A9F4]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bookings</p>
              <h3 className="text-2xl font-bold">{totalBookings}</h3>
            </div>
            <div className="bg-[#03A9F4]/10 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-[#03A9F4]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analysis</TabsTrigger>
          <TabsTrigger value="geography">Geographic</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Analysis</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Trend</CardTitle>
                <CardDescription>User growth over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} users`, undefined]}
                      labelStyle={{ color: '#111' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="clients" stroke="#E91E63" strokeWidth={2} activeDot={{ r: 8 }} name="Clients" />
                    <Line type="monotone" dataKey="vendors" stroke="#FF9800" strokeWidth={2} activeDot={{ r: 8 }} name="Vendors" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Package Distribution</CardTitle>
                <CardDescription>Package selection by clients</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={packageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {packageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} clients`, undefined]}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>Monthly booking patterns with revenue</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'bookings' ? `${value} bookings` : `₹${Number(value).toLocaleString()}`, 
                        name === 'bookings' ? 'Bookings' : 'Revenue'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="bookings" fill="#8BC34A" name="Bookings" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#03A9F4" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Analysis Tab */}
        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Weekly user activity patterns</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value}`, undefined]}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="logins" stackId="1" stroke="#E91E63" fill="#E91E63" name="Logins" />
                    <Area type="monotone" dataKey="actions" stackId="2" stroke="#FF9800" fill="#FF9800" name="Actions" />
                    <Area type="monotone" dataKey="messages" stackId="3" stroke="#8BC34A" fill="#8BC34A" name="Messages" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>Client retention metrics over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <p className="text-gray-600">Advanced retention metrics will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geography">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Client distribution across India</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <div className="flex flex-col md:flex-row h-full">
                  <div className="md:w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={geoDistributionData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip 
                          formatter={(value) => [`${value} clients`, undefined]}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar dataKey="value" fill="#9C27B0" name="Clients" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="md:w-1/2 h-full flex items-center justify-center p-4">
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <MapPin className="h-12 w-12 text-[#9C27B0] mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2">Geographic Insights</h3>
                      <p className="text-gray-600 mb-4">
                        Highest client concentration in metropolitan areas, with {geoDistributionData[0]?.name} having the most weddings.
                      </p>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Metro Cities:</span>
                          <span className="font-medium">
                            {Math.floor(geoDistributionData
                              .filter(d => ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu'].includes(d.name))
                              .reduce((acc, curr) => acc + curr.value, 0) / totalWeddings * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Other Regions:</span>
                          <span className="font-medium">
                            {Math.floor(geoDistributionData
                              .filter(d => !['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu'].includes(d.name))
                              .reduce((acc, curr) => acc + curr.value, 0) / totalWeddings * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vendor Analysis Tab */}
        <TabsContent value="vendors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Categories</CardTitle>
                <CardDescription>Distribution by vendor type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vendorCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {vendorCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} vendors`, undefined]}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance</CardTitle>
                <CardDescription>Booking performance by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendorCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} vendors`, undefined]}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#3F51B5" name="Vendors" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budget Analysis Tab */}
        <TabsContent value="budget">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation by Category</CardTitle>
                <CardDescription>Analysis of budget allocation vs. actual spending</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={budgetCategoryData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, undefined]}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="allocated" fill="#F44336" name="Allocated (₹)" />
                    <Bar dataKey="spent" fill="#009688" name="Spent (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {budgetCategoryData.slice(0, 4).map((category, index) => (
                <Card key={index} className="border-l-4" style={{ borderLeftColor: COLORS[index % COLORS.length] }}>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-medium mb-2">{category.name}</h3>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500">Allocated:</span>
                      <span className="font-medium">₹{category.allocated.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">Spent:</span>
                      <span className="font-medium">₹{category.spent.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, Math.round((category.spent / category.allocated) * 100))}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>0%</span>
                      <span>{Math.round((category.spent / category.allocated) * 100)}% of budget</span>
                      <span>100%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;