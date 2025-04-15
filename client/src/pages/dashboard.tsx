import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardHero from '@/components/dashboard/DashboardHero';
import TaskManager from '@/components/dashboard/TaskManager';
import SupervisorCard from '@/components/dashboard/SupervisorCard';
import BudgetCard from '@/components/dashboard/BudgetCard';
import GuestManagement from '@/components/dashboard/GuestManagement';
import VendorCard from '@/components/dashboard/VendorCard';
import WeddingDateBanner from '@/components/dashboard/WeddingDateBanner';
import Footer from '@/components/dashboard/Footer';
import VendorList from '@/components/vendors/VendorList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fadeIn } from '@/lib/motion';
import { UserRole } from '@shared/schema';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Extract tab from URL query parameter if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL without navigation
    const url = value === 'dashboard' 
      ? '/dashboard'
      : `/dashboard?tab=${value}`;
    
    window.history.pushState(null, '', url);
  };

  return (
    <ProtectedRoute requirePackage={true}>
      <Layout className="flex flex-col">
        <DashboardHeader />
        
        {activeTab === 'dashboard' && <DashboardHero />}
        
        <main className="flex-1 bg-[#F5F5F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Mobile Tabs */}
            <div className="md:hidden mb-6">
              <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="wedding">Wedding</TabsTrigger>
                  <TabsTrigger value="vendors">Vendors</TabsTrigger>
                  <TabsTrigger value="guests">Guests</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <motion.div
                variants={fadeIn('up', 'tween', 0.2, 0.5)}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* First Row */}
                <TaskManager />
                <SupervisorCard />
                
                {/* Second Row */}
                <BudgetCard />
                <GuestManagement />
                <VendorCard />
                
                {/* Third Row */}
                <WeddingDateBanner />
              </motion.div>
            )}
            
            {/* Wedding Tab */}
            {activeTab === 'wedding' && (
              <motion.div
                variants={fadeIn('up', 'tween', 0.2, 0.5)}
                initial="hidden"
                animate="show"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <TaskManager />
                  <BudgetCard />
                </div>
                <WeddingDateBanner />
              </motion.div>
            )}
            
            {/* Vendors Tab */}
            {activeTab === 'vendors' && (
              <VendorList />
            )}
            
            {/* Guests Tab */}
            {activeTab === 'guests' && (
              <motion.div
                variants={fadeIn('up', 'tween', 0.2, 0.5)}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-6"
              >
                <GuestManagement />
              </motion.div>
            )}
          </div>
        </main>
        <Footer />
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard;
