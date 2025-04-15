import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { fadeIn, itemVariants } from '@/lib/motion';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone 
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <motion.footer 
      className="bg-[#800000] text-white"
      variants={fadeIn('up', 'tween', 0.1, 0.5)}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div variants={itemVariants}>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#800000] font-script text-xl">S</span>
              </div>
              <span className="ml-2 font-serif text-xl text-[#FFD700]">Sehra</span>
            </div>
            <p className="mt-2 text-white/80 text-sm">Your complete Indian wedding management platform for every step of your special journey</p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="text-[#FFD700] font-medium mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard">
                  <a className="text-white/80 hover:text-[#FFD700] transition-colors">Dashboard</a>
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=wedding">
                  <a className="text-white/80 hover:text-[#FFD700] transition-colors">My Wedding</a>
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=vendors">
                  <a className="text-white/80 hover:text-[#FFD700] transition-colors">Vendors</a>
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=guests">
                  <a className="text-white/80 hover:text-[#FFD700] transition-colors">Guests</a>
                </Link>
              </li>
            </ul>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="text-[#FFD700] font-medium mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help">
                  <a className="text-white/80 hover:text-[#FFD700] transition-colors">Help Center</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-white/80 hover:text-[#FFD700] transition-colors">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-white/80 hover:text-[#FFD700] transition-colors">FAQ</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-white/80 hover:text-[#FFD700] transition-colors">Privacy Policy</a>
                </Link>
              </li>
            </ul>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="text-[#FFD700] font-medium mb-3">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-white/80">
              <span className="block mb-1">Contact Us:</span>
              <a href="mailto:info@sehra.com" className="flex items-center hover:text-[#FFD700] transition-colors">
                <Mail className="w-4 h-4 mr-2" />
                info@sehra.com
              </a>
              <a href="tel:+919876543210" className="flex items-center hover:text-[#FFD700] transition-colors mt-1">
                <Phone className="w-4 h-4 mr-2" />
                +91 9876 543 210
              </a>
            </p>
          </motion.div>
        </div>
        
        <div className="divider my-6"></div>
        
        <div className="text-center text-sm text-white/70">
          &copy; {new Date().getFullYear()} Sehra Wedding Management. All rights reserved.
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
