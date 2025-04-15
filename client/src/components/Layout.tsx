import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/motion';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`min-h-screen bg-[#F5F5F5] ${className}`}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
};

export default Layout;
