import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`min-h-screen bg-[#F5F5F5] ${className}`}
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default Layout;
