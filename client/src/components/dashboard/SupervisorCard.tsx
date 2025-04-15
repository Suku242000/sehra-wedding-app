import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

const SupervisorCard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch supervisor details if user has supervisorId
  const { data: supervisor, isLoading } = useQuery({
    queryKey: ['/api/admin/users', user?.supervisorId],
    enabled: !!user?.supervisorId,
  });

  const handleScheduleMeeting = () => {
    toast({
      title: "Meeting Request Sent",
      description: `A meeting request has been sent to ${supervisor?.name}. They will contact you shortly.`,
    });
  };

  if (!user?.supervisorId) {
    return (
      <motion.div 
        className="bg-white rounded-lg shadow-md overflow-hidden"
        variants={fadeIn('up', 'tween', 0.3, 0.5)}
        initial="hidden"
        animate="show"
      >
        <div className="bg-[#800000] py-3 px-4 border-b border-[#5c0000]">
          <h2 className="text-white font-medium">Your Supervisor</h2>
        </div>
        <div className="p-4 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="mt-2 font-medium text-lg">No Supervisor Assigned</h3>
          <p className="text-gray-500 text-sm">A wedding supervisor will be assigned to you soon.</p>
          <div className="divider my-3 w-1/2"></div>
          <p className="text-sm text-gray-600 mt-1">
            Your supervisor will help coordinate your wedding planning and vendor management.
          </p>
        </div>
      </motion.div>
    );
  }
  
  if (isLoading) {
    return (
      <motion.div 
        className="bg-white rounded-lg shadow-md overflow-hidden"
        variants={fadeIn('up', 'tween', 0.3, 0.5)}
        initial="hidden"
        animate="show"
      >
        <div className="bg-[#800000] py-3 px-4 border-b border-[#5c0000]">
          <h2 className="text-white font-medium">Your Supervisor</h2>
        </div>
        <div className="p-4 flex flex-col items-center text-center">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-6 w-32 mt-2" />
          <Skeleton className="h-4 w-48 mt-2" />
          <div className="divider my-3 w-1/2"></div>
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-full mt-1" />
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden"
      variants={fadeIn('up', 'tween', 0.3, 0.5)}
      initial="hidden"
      animate="show"
    >
      <div className="bg-[#800000] py-3 px-4 border-b border-[#5c0000]">
        <h2 className="text-white font-medium">Your Supervisor</h2>
      </div>
      <div className="p-4 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#FFD700]">
          <div className="w-full h-full bg-[#FFC0CB]/20 flex items-center justify-center text-[#800000]">
            <User className="w-12 h-12" />
          </div>
        </div>
        <h3 className="mt-2 font-medium text-lg">{supervisor?.name}</h3>
        <p className="text-gray-500 text-sm">Senior Wedding Coordinator</p>
        <div className="divider my-3 w-1/2"></div>
        <div className="flex items-center text-sm text-gray-600 mt-1">
          <Phone className="w-4 h-4 text-[#800000] mr-2" />
          +91 98765 43210
        </div>
        <div className="flex items-center text-sm text-gray-600 mt-1">
          <Mail className="w-4 h-4 text-[#800000] mr-2" />
          {supervisor?.email}
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4 w-full maroon-gradient">
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule a Meeting</DialogTitle>
              <DialogDescription>
                Select a time to meet with your supervisor {supervisor?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Date</label>
                  <div className="border rounded-md p-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <input 
                      type="date" 
                      className="flex-1 outline-none text-sm"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Time</label>
                  <div className="border rounded-md p-2">
                    <select className="w-full outline-none text-sm">
                      <option>9:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>12:00 PM</option>
                      <option>1:00 PM</option>
                      <option>2:00 PM</option>
                      <option>3:00 PM</option>
                      <option>4:00 PM</option>
                      <option>5:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Meeting Topic</label>
                <textarea 
                  className="border rounded-md p-2 w-full text-sm" 
                  rows={3}
                  placeholder="What would you like to discuss?"
                ></textarea>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline">Cancel</Button>
              <Button 
                type="button" 
                className="maroon-gradient"
                onClick={handleScheduleMeeting}
              >
                Request Meeting
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default SupervisorCard;
