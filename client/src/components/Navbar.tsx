import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { goToDashboard } from '@/lib/navigation';

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to scroll to section with ID
  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
      // If not on home page, navigate to home then scroll
      window.location.href = `/${sectionId}`;
      return;
    }

    // On home page, scroll to section
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navLinks = [
    { text: 'Home', href: '/' },
    { text: 'Packages', href: '/#packages', id: 'packages' },
    { text: 'Testimonials', href: '/#testimonials', id: 'testimonials' },
    { text: 'Contact', href: '/#contact', id: 'contact' }
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isScrolled ? 'bg-[#800000]' : 'bg-white'
              }`}>
                <span className={`font-script text-xl ${
                  isScrolled ? 'text-white' : 'text-[#800000]'
                }`}>S</span>
              </div>
              <span className={`ml-2 font-serif text-xl font-bold ${
                isScrolled ? 'text-[#800000]' : 'text-white'
              }`}>Sehra</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <div key={index}>
                {link.id ? (
                  <a 
                    href={link.href}
                    onClick={(e) => link.id && scrollToSection(e, link.id)}
                    className={`font-medium transition-colors cursor-pointer ${
                      isScrolled ? 'text-gray-700 hover:text-[#800000]' : 'text-white hover:text-[#FFD700]'
                    }`}
                  >
                    {link.text}
                  </a>
                ) : (
                  <Link href={link.href}>
                    <div className={`font-medium transition-colors cursor-pointer ${
                      isScrolled ? 'text-gray-700 hover:text-[#800000]' : 'text-white hover:text-[#FFD700]'
                    }`}>
                      {link.text}
                    </div>
                  </Link>
                )}
              </div>
            ))}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => goToDashboard()} 
                  className="bg-[#800000] hover:bg-[#800000]/90 text-white"
                >
                  Go to Dashboard
                </Button>
                <div className={`flex items-center gap-2 font-medium ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}>
                  <User className="h-4 w-4" />
                  <span>{user?.name || 'User'}</span>
                </div>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="bg-[#800000] hover:bg-[#800000]/90 text-white">
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={isScrolled ? 'text-[#800000]' : 'text-white'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-5 space-y-4">
              {navLinks.map((link, index) => (
                <div key={index}>
                  {link.id ? (
                    <a 
                      href={link.href}
                      className="block px-3 py-2 text-[#800000] font-medium hover:bg-[#FFC0CB]/10 rounded-md cursor-pointer"
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        if (link.id) scrollToSection(e, link.id);
                      }}
                    >
                      {link.text}
                    </a>
                  ) : (
                    <Link href={link.href}>
                      <div
                        className="block px-3 py-2 text-[#800000] font-medium hover:bg-[#FFC0CB]/10 rounded-md cursor-pointer"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.text}
                      </div>
                    </Link>
                  )}
                </div>
              ))}
              <div className="pt-2">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-3 py-2 text-[#800000] font-medium">
                      <User className="h-4 w-4" />
                      <span>{user?.name || 'User'}</span>
                    </div>
                    <Button 
                      onClick={() => goToDashboard()}
                      className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <Link href="/auth">
                    <div className="block">
                      <Button className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white">
                        Login / Sign Up
                      </Button>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;