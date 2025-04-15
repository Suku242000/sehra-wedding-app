import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserRole } from '@shared/schema';
import { UsersIcon, UserIcon, PackageIcon, CalendarIcon } from 'lucide-react';

interface StatsCardsProps {
  users: User[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ users }) => {
  // Calculate stats
  const totalUsers = users.length;
  const activeClients = users.filter(user => 
    (user.role === UserRole.BRIDE || 
     user.role === UserRole.GROOM || 
     user.role === UserRole.FAMILY) && 
    user.package
  ).length;
  
  const totalVendors = users.filter(user => user.role === UserRole.VENDOR).length;
  
  const upcomingWeddings = users.filter(user => 
    (user.role === UserRole.BRIDE || user.role === UserRole.GROOM || user.role === UserRole.FAMILY) && 
    user.weddingDate && 
    new Date(user.weddingDate) > new Date()
  ).length;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            All registered users in the system
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeClients}</div>
          <p className="text-xs text-muted-foreground">
            Clients with selected packages
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Registered Vendors</CardTitle>
          <PackageIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVendors}</div>
          <p className="text-xs text-muted-foreground">
            Active service providers
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Weddings</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingWeddings}</div>
          <p className="text-xs text-muted-foreground">
            Scheduled in the next 12 months
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;