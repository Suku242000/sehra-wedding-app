import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardHero from '@/components/dashboard/DashboardHero';
import EnhancedTaskManager from '@/components/dashboard/EnhancedTaskManager';
import SupervisorCard from '@/components/dashboard/SupervisorCard';
import BudgetCard from '@/components/dashboard/BudgetCard';
import GuestManagement from '@/components/dashboard/GuestManagement';
import VendorCard from '@/components/dashboard/VendorCard';
import WeddingDateBanner from '@/components/dashboard/WeddingDateBanner';
import MyWeddingSection from '@/components/dashboard/MyWeddingSection';
import ProfileSettings from '@/components/dashboard/ProfileSettings';
import Footer from '@/components/dashboard/Footer';
import VendorList from '@/components/vendors/VendorList';
import EnhancedVendorList from '@/components/vendors/EnhancedVendorList';
import EnhancedGuestManagement from '@/components/guests/EnhancedGuestManagement';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fadeIn } from '@/lib/motion';
import { UserRole } from '@shared/schema';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Extract tab from URL query parameter if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const tabParam = searchParams.get('tab');
    if (tabParam && ['dashboard', 'wedding', 'vendors', 'guests'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Listen for custom tab change events from the header
  useEffect(() => {
    const handleTabChangeEvent = (e: CustomEvent) => {
      setActiveTab(e.detail);
    };

    // Need to cast to unknown first due to TypeScript's handling of CustomEvent
    document.addEventListener('tabChange', handleTabChangeEvent as unknown as EventListener);
    
    return () => {
      document.removeEventListener('tabChange', handleTabChangeEvent as unknown as EventListener);
    };
  }, []);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL without navigation
    const url = value === 'dashboard' 
      ? '/dashboard'
      : `/dashboard?tab=${value}`;
    
    window.history.pushState(null, '', url);
  };

  // Render the active tab content
  const renderActiveTabContent = () => {
    switch(activeTab) {
      case 'wedding':
        return <MyWeddingSection />;
      case 'vendors':
        return <EnhancedVendorList />;
      case 'guests':
        return <EnhancedGuestManagement />;
      case 'dashboard':
      default:
        return (
          <motion.div
            variants={fadeIn('up', 'tween', 0.2, 0.5)}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* First Row */}
            <EnhancedTaskManager />
            <SupervisorCard />
            
            {/* Second Row */}
            <BudgetCard />
            <GuestManagement />
            <VendorCard />
            
            {/* Third Row */}
            <WeddingDateBanner />
            
            {/* Profile Settings */}
            <div className="md:col-span-3">
              <ProfileSettings />
            </div>
          </motion.div>
        );
    }
  };

  return (
    <ProtectedRoute requirePackage={true}>
      <Layout className="flex flex-col">
        <DashboardHeader />
        
        {activeTab === 'dashboard' && <DashboardHero />}
        
        <main className="flex-1 bg-[#F5F5F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Desktop Tabs */}
            <div className="hidden md:block mb-6">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="wedding">My Wedding</TabsTrigger>
                  <TabsTrigger value="vendors">Vendors</TabsTrigger>
                  <TabsTrigger value="guests">Guests</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Mobile Tabs */}
            <div className="md:hidden mb-6">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="wedding">Wedding</TabsTrigger>
                  <TabsTrigger value="vendors">Vendors</TabsTrigger>
                  <TabsTrigger value="guests">Guests</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Render the active tab content */}
            {renderActiveTabContent()}
          </div>
        </main>
        <Footer />
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard;
