import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  PieChart,
  Calendar,
  User,
  Briefcase,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Layout = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [openSection, setOpenSection] = React.useState(null);

  // Navigation structure based on user role
  const navigation = {
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
      { name: 'User Management', href: '/admin/users', icon: Users },
      { name: 'Contact Submissions', href: '/admin/contact', icon: MessageSquare },
      { name: 'Analytics', href: '/admin/analytics', icon: PieChart },
    ],
    supervisor: [
      { name: 'Dashboard', href: '/supervisor/dashboard', icon: Home },
      { name: 'My Clients', href: '/supervisor/clients', icon: Users },
      { name: 'Calendar', href: '/supervisor/calendar', icon: Calendar },
    ],
    vendor: [
      { name: 'Dashboard', href: '/vendor/dashboard', icon: Home },
      { name: 'My Profile', href: '/vendor/profile', icon: User },
      { name: 'Bookings', href: '/vendor/bookings', icon: Calendar },
      { name: 'Portfolio', href: '/vendor/portfolio', icon: Briefcase },
    ],
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle section in mobile view
  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get current user type navigation
  const userNavigation = user?.role ? navigation[user.role] || [] : [];

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r bg-muted/10">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <Link href="/">
                <div className="h-12 w-auto flex items-center justify-center">
                  <span className="text-2xl font-bold text-maroon-700">Sehra</span>
                  <span className="text-xl font-light ml-1">Admin</span>
                </div>
              </Link>
            </div>
            <div className="mt-5 flex flex-1 flex-col">
              <nav className="flex-1 space-y-1 px-2">
                {userNavigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-maroon-100 text-maroon-800'
                            : 'text-gray-600 hover:bg-maroon-50 hover:text-maroon-800'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 flex-shrink-0 ${
                            isActive ? 'text-maroon-600' : 'text-gray-400 group-hover:text-maroon-600'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-3">
            <div className="flex flex-shrink-0 w-full items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-700 font-semibold text-sm mr-2">
                  {user?.name?.slice(0, 1)?.toUpperCase() || 'U'}
                </div>
                <div className="ml-1">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[130px]">{user?.name}</p>
                  <p className="text-xs font-medium text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                className="flex items-center text-gray-600 hover:text-maroon-700"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="bg-white md:hidden sticky top-0 w-full z-10 border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open sidebar</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
            <div className="ml-3">
              <span className="text-xl font-bold text-maroon-700">Sehra</span>
              <span className="text-lg font-light ml-1">Admin</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="flex items-center text-gray-600 hover:text-maroon-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span>Logout</span>
            </Button>
            <div className="h-8 w-8 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-700 font-semibold text-sm">
              {user?.name?.slice(0, 1)?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={toggleMobileMenu}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4"
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-shrink-0 items-center px-4">
              <Link href="/">
                <div className="h-12 w-auto flex items-center justify-center">
                  <span className="text-2xl font-bold text-maroon-700">Sehra</span>
                  <span className="text-xl font-light ml-1">Admin</span>
                </div>
              </Link>
            </div>
            <div className="mt-5 h-0 flex-1 overflow-y-auto">
              <nav className="space-y-2 px-2">
                {userNavigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <a
                        onClick={toggleMobileMenu}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          isActive
                            ? 'bg-maroon-100 text-maroon-800'
                            : 'text-gray-600 hover:bg-maroon-50 hover:text-maroon-600'
                        }`}
                      >
                        <item.icon
                          className={`mr-4 h-6 w-6 flex-shrink-0 ${
                            isActive ? 'text-maroon-600' : 'text-gray-400 group-hover:text-maroon-500'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
              <a href="#" className="group block flex-shrink-0" onClick={handleLogout}>
                <div className="flex items-center">
                  <div>
                    <div className="h-10 w-10 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-700 font-semibold">
                      {user?.name?.slice(0, 1)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700 group-hover:text-maroon-900">
                      {user?.name}
                    </p>
                    <p className="text-sm font-medium text-gray-500 group-hover:text-maroon-700 flex items-center">
                      <LogOut className="mr-1 h-4 w-4" /> Log out
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </motion.div>
          <div className="w-14 flex-shrink-0" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;