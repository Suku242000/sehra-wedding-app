import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, UserRole } from '@shared/schema';
import { Package, Users, CalendarDays, IndianRupee } from 'lucide-react';

interface StatsCardsProps {
  users: User[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ users }) => {
  // Count users by role and package
  const clientCount = users.filter(user => 
    user.role === UserRole.BRIDE || 
    user.role === UserRole.GROOM || 
    user.role === UserRole.FAMILY
  ).length;
  
  const vendorCount = users.filter(user => user.role === UserRole.VENDOR).length;
  const supervisorCount = users.filter(user => user.role === UserRole.SUPERVISOR).length;
  
  const packageStats = {
    silver: users.filter(user => user.package === 'silver').length,
    gold: users.filter(user => user.package === 'gold').length,
    platinum: users.filter(user => user.package === 'platinum').length,
  };
  
  // Calculate weddings scheduled for next 30 days
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);
  
  const upcomingWeddings = users.filter(user => {
    if (!user.weddingDate) return false;
    const weddingDate = new Date(user.weddingDate);
    return weddingDate >= now && weddingDate <= thirtyDaysFromNow;
  }).length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="bg-[#800000]/10 p-3 rounded-full">
              <Users className="h-6 w-6 text-[#800000]" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Clients</div>
              <div className="text-2xl font-bold">{clientCount}</div>
              <div className="text-xs text-gray-400 mt-1">
                {vendorCount} vendors, {supervisorCount} supervisors
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="bg-[#800000]/10 p-3 rounded-full">
              <Package className="h-6 w-6 text-[#800000]" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Package Distribution</div>
              <div className="text-2xl font-bold">{packageStats.gold + packageStats.platinum + packageStats.silver}</div>
              <div className="text-xs text-gray-400 mt-1">
                {packageStats.silver} Silver, {packageStats.gold} Gold, {packageStats.platinum} Platinum
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="bg-[#800000]/10 p-3 rounded-full">
              <CalendarDays className="h-6 w-6 text-[#800000]" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Upcoming Weddings</div>
              <div className="text-2xl font-bold">{upcomingWeddings}</div>
              <div className="text-xs text-gray-400 mt-1">
                Next 30 days
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="bg-[#800000]/10 p-3 rounded-full">
              <IndianRupee className="h-6 w-6 text-[#800000]" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Monthly Revenue</div>
              <div className="text-2xl font-bold">₹{(packageStats.silver * 50000 + packageStats.gold * 100000 + packageStats.platinum * 150000) / 12}</div>
              <div className="text-xs text-gray-400 mt-1">
                ₹{packageStats.silver * 50000 + packageStats.gold * 100000 + packageStats.platinum * 150000} annual
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;