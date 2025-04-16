import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { fadeIn, progressBar } from '@/lib/motion';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Task } from '@shared/schema';
import { calculateDaysLeft } from '@/lib/utils';

interface DashboardStats {
  completedTasks: number;
  totalTasks: number;
  progress: number;
  daysLeft: number;
  pendingTasks: number;
  totalGuests: number;
  confirmedGuests: number;
  vendorsBooked: number;
}

const DashboardHero: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    completedTasks: 0,
    totalTasks: 0,
    progress: 0,
    daysLeft: 124,
    pendingTasks: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    vendorsBooked: 0
  });
  
  // Fetch tasks with auth
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    queryFn: () => fetchWithAuth('/api/tasks'),
    enabled: !!user
  });
  
  // Fetch guests with auth
  const { data: guests = [] } = useQuery<any[]>({
    queryKey: ['/api/guests'],
    queryFn: () => fetchWithAuth('/api/guests'),
    enabled: !!user
  });
  
  // Fetch bookings with auth
  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ['/api/bookings'],
    queryFn: () => fetchWithAuth('/api/bookings'),
    enabled: !!user
  });
  
  // Calculate stats
  useEffect(() => {
    if (tasks && guests && bookings && user) {
      const completedTasks = tasks.filter((task: Task) => task.status === 'completed').length;
      const totalTasks = tasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const pendingTasks = tasks.filter((task: Task) => task.status !== 'completed').length;
      
      const totalGuests = guests.length;
      const confirmedGuests = guests.filter((guest: any) => guest.status === 'confirmed').length;
      
      const vendorsBooked = bookings.filter((booking: any) => booking.status === 'confirmed').length;
      
      const daysLeft = user.weddingDate ? calculateDaysLeft(user.weddingDate) : 0;
      
      setStats({
        completedTasks,
        totalTasks,
        progress,
        daysLeft,
        pendingTasks,
        totalGuests,
        confirmedGuests,
        vendorsBooked
      });
    }
  }, [tasks, guests, bookings, user]);
  
  return (
    <div className="bg-cover bg-center py-8 md:py-16 relative" style={{backgroundImage: "url('https://images.unsplash.com/photo-1514222788835-3a1a1d5b32f8?q=80&w=1974&auto=format&fit=crop')"}}>
      <div className="absolute inset-0 bg-[#800000]/60"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          className="flex flex-col items-center text-center"
          initial="hidden"
          animate="show"
          variants={fadeIn('up', 'tween', 0.2, 0.5)}
        >
          <div className="font-script text-[#FFD700] text-lg md:text-2xl">Welcome to your</div>
          <h1 className="text-white font-serif text-3xl md:text-5xl font-bold mb-4">Wedding Journey</h1>
          <p className="text-white/90 max-w-2xl mb-6">
            Your {user?.package && user.package.charAt(0).toUpperCase() + user.package.slice(1)} package wedding 
            {user?.weddingDate ? ` is scheduled for ${new Date(user.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ' date is not set yet'}. 
            You have completed <span className="font-medium text-[#FFD700]">{stats.progress}%</span> of your preparations.
          </p>
          
          {/* Progress Bar */}
          <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="progress-bar h-full rounded-full"
              variants={progressBar(stats.progress)}
              initial="hidden"
              animate="show"
            ></motion.div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-2xl mt-8">
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
              variants={fadeIn('up', 'tween', 0.3, 0.5)}
            >
              <div className="text-3xl font-bold text-[#FFD700]">{stats.daysLeft}</div>
              <div className="text-white text-sm">Days Left</div>
            </motion.div>
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
              variants={fadeIn('up', 'tween', 0.4, 0.5)}
            >
              <div className="text-3xl font-bold text-[#FFD700]">{stats.pendingTasks}</div>
              <div className="text-white text-sm">Tasks Pending</div>
            </motion.div>
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
              variants={fadeIn('up', 'tween', 0.5, 0.5)}
            >
              <div className="text-3xl font-bold text-[#FFD700]">{stats.totalGuests}</div>
              <div className="text-white text-sm">Guests Added</div>
            </motion.div>
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
              variants={fadeIn('up', 'tween', 0.6, 0.5)}
            >
              <div className="text-3xl font-bold text-[#FFD700]">{stats.vendorsBooked}</div>
              <div className="text-white text-sm">Vendors Booked</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHero;
