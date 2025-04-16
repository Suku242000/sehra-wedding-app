import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom link component for direct navigation to landing page
const HomeLinkButton: React.FC<{className?: string, children: React.ReactNode}> = ({ className, children }) => {
  const goToLandingPage = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/';
  };
  
  return (
    <button onClick={goToLandingPage} className={className}>
      {children}
    </button>
  );
};

const DashboardHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  // Function to handle tab navigation without reloading page
  const handleTabNavigation = (e: React.MouseEvent, path: string) => {
    if (path.startsWith('/dashboard?tab=')) {
      e.preventDefault();
      const tab = path.split('=')[1];
      
      // Update URL without navigation
      window.history.pushState(null, '', path);
      
      // Manually update the tab state via a custom event
      const tabChangeEvent = new CustomEvent('tabChange', { detail: tab });
      document.dispatchEvent(tabChangeEvent);
    }
  };

  const userRole = user?.role?.toLowerCase();
  
  const navItems = [
    // The Home link should go to the landing page
    { name: 'Home', path: '/' },
    // Based on role, select the appropriate dashboard
    { 
      name: 'Dashboard', 
      path: userRole === 'admin' ? '/admin-dashboard' : 
            userRole === 'vendor' ? '/vendor-dashboard' : 
            userRole === 'supervisor' ? '/supervisor-dashboard' : 
            '/dashboard' 
    },
    { name: 'My Wedding', path: '/dashboard?tab=wedding' },
    { name: 'Vendors', path: '/dashboard?tab=vendors' },
    { name: 'Guests', path: '/dashboard?tab=guests' },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            {/* Using HomeLinkButton to ensure direct navigation to landing page */}
            <HomeLinkButton className="flex-shrink-0 flex items-center cursor-pointer">
              <motion.div 
                className="w-10 h-10 bg-[#800000] rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-[#FFD700] font-script text-xl">S</span>
              </motion.div>
              <span className="ml-2 font-serif text-xl text-[#800000]">Sehra</span>
            </HomeLinkButton>
            
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => {
                // Determine if this navigation item should be highlighted
                const isActive = 
                  item.path === '/' ? location === '/' : 
                  item.path === '/dashboard' ? location === '/dashboard' && !location.includes('?tab=') : 
                  location.includes(item.path);
                
                return (
                  <div key={item.path} className="inline-block">
                    {item.path.startsWith('/dashboard?tab=') ? (
                      <button
                        className={`${
                          isActive
                            ? 'border-[#800000] text-[#800000]' 
                            : 'border-transparent text-gray-500 hover:border-[#FFD700] hover:text-[#FFD700]'
                          } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                        onClick={(e) => handleTabNavigation(e, item.path)}
                      >
                        {item.name}
                      </button>
                    ) : item.path === '/' ? (
                      <HomeLinkButton
                        className={`${
                          isActive
                            ? 'border-[#800000] text-[#800000]' 
                            : 'border-transparent text-gray-500 hover:border-[#FFD700] hover:text-[#FFD700]'
                          } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 cursor-pointer`}
                      >
                        {item.name}
                      </HomeLinkButton>
                    ) : (
                      <Link href={item.path}>
                        <span
                          className={`${
                            isActive
                              ? 'border-[#800000] text-[#800000]' 
                              : 'border-transparent text-gray-500 hover:border-[#FFD700] hover:text-[#FFD700]'
                            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 cursor-pointer`}
                        >
                          {item.name}
                        </span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800000]">
                  <span className="hidden md:block text-sm text-gray-700">{user?.name}</span>
                  <div className="h-8 w-8 rounded-full border border-[#FFD700] bg-[#FFC0CB]/20 flex items-center justify-center text-[#800000]">
                    <User className="h-4 w-4" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
