import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import UserList from '@/components/admin/UserList';
import SupervisorAssignment from '@/components/admin/SupervisorAssignment';
import StatsCards from '@/components/admin/StatsCards';
import AdvancedAnalytics from '@/components/admin/AdvancedAnalytics';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  // Fetch all users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user
  });

  return (
    <Layout>
      <div className="bg-[#800000] text-white p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Sehra Admin Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80">Welcome, {user?.name}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="text-white border-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="p-4 md:p-8"
      >
        <motion.div
          variants={fadeIn('up', 'tween', 0.2, 0.5)}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}. Manage your wedding planning platform from here.
          </p>
        </motion.div>

        <StatsCards users={users} />

        <Tabs defaultValue="analytics" className="mt-8">
          <TabsList className="mb-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="supervisors">Supervisor Assignment</TabsTrigger>
            <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <UserList users={users} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="supervisors">
            <Card>
              <CardHeader>
                <CardTitle>Supervisor Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <SupervisorAssignment />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Approve and manage vendor profiles here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Advanced Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <AdvancedAnalytics users={users} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Configure system settings here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default AdminDashboard;