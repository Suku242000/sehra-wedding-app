import React from 'react';
import { Loader2, LogOut, Award, Calendar, Users, Settings, DollarSign, Mail, Bell, PieChart } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@shared/components/ui/card';

interface DashboardPlaceholderProps {
  role: 'vendor' | 'supervisor' | 'admin';
}

const DashboardPlaceholder: React.FC<DashboardPlaceholderProps> = ({ role }) => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-4 text-center">Please log in to access this dashboard.</p>
        <Button asChild>
          <a href="/auth">Go to Login</a>
        </Button>
      </div>
    );
  }

  // Define role-specific dashboard content
  const getDashboardContent = () => {
    switch (role) {
      case 'vendor':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Earnings This Month</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹32,500</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Rating</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8/5</div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Vendor Performance</CardTitle>
                  <CardDescription>
                    Gold tier vendor - Keep up the good work!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Your vendor dashboard will be implemented soon.</p>
                </CardContent>
              </Card>
            </div>
          </>
        );
      
      case 'supervisor':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasks Due</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Client Overview</CardTitle>
                  <CardDescription>
                    Supervisor dashboard for managing client relationships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Your supervisor dashboard will be implemented soon.</p>
                </CardContent>
              </Card>
            </div>
          </>
        );
      
      case 'admin':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">148</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹4.2L</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendors</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Supervisors</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>
                    Admin dashboard for platform management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Your admin dashboard will be implemented soon.</p>
                </CardContent>
              </Card>
            </div>
          </>
        );
      
      default:
        return <p>Unknown role: {role}</p>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-rose-700 text-xl">Sehra</span>
            <span className="text-gray-500 text-sm">| {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-rose-500"></span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <span className="text-rose-700 text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium hidden md:inline-block">{user.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => logout()}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">
          Welcome, {user.name}!
        </h1>
        
        {/* Role-specific dashboard content */}
        {getDashboardContent()}
      </div>
    </div>
  );
};

export default DashboardPlaceholder;