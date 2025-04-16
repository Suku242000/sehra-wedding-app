import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PhoneCall, Mail, MessageSquare, CalendarClock, Shield } from 'lucide-react';

const SupervisorCard: React.FC = () => {
  const { toast } = useToast();
  
  // Fetch user with supervisor details
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/users/me'],
  });

  // Check if user has a assigned supervisor
  const hasSupervisor = userData?.supervisorId;
  
  // Fetch supervisor details if available
  const { data: supervisor, isLoading: isSupervisorLoading } = useQuery({
    queryKey: ['/api/admin/users', userData?.supervisorId],
    enabled: !!userData?.supervisorId,
  });

  // Get supervisor initials for avatar fallback
  const getSupervisorInitials = (name?: string) => {
    if (!name) return 'SP';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  return (
    <Card className="border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#800000] text-xl flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Wedding Supervisor
        </CardTitle>
        <CardDescription>Your dedicated wedding planning expert</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || isSupervisorLoading ? (
          <div className="flex flex-col items-center justify-center py-6 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-32 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        ) : !hasSupervisor ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Avatar className="w-16 h-16 mb-4">
              <AvatarFallback className="bg-[#800000]/10 text-[#800000]">SP</AvatarFallback>
            </Avatar>
            <h3 className="font-medium text-lg mb-1 text-center">No Supervisor Assigned</h3>
            <p className="text-sm text-gray-500 mb-4 text-center">
              A wedding supervisor will be assigned to you soon
            </p>
            <div className="space-y-2 w-full">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Request Sent",
                    description: "Your request for a supervisor has been submitted.",
                  });
                }}
              >
                Request Supervisor
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <Avatar className="w-16 h-16 mb-4">
              <AvatarImage src={supervisor?.profileImage} />
              <AvatarFallback className="bg-[#800000]/10 text-[#800000]">
                {getSupervisorInitials(supervisor?.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-medium text-lg mb-1 text-center">{supervisor?.name || 'Wedding Supervisor'}</h3>
            <div className="flex items-center mb-4">
              <Badge variant="outline" className="bg-[#800000]/5 border-[#800000]/10 text-[#800000]">
                {supervisor?.uniqueId || 'SP0001'}
              </Badge>
            </div>
            <div className="space-y-2 w-full">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center"
                onClick={() => {
                  if (supervisor?.phone) {
                    window.open(`tel:${supervisor.phone}`, '_blank');
                  } else {
                    toast({
                      title: "Contact Info Missing",
                      description: "Phone number is not available.",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                Call Supervisor
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center"
                onClick={() => {
                  if (supervisor?.email) {
                    window.open(`mailto:${supervisor.email}`, '_blank');
                  } else {
                    toast({
                      title: "Contact Info Missing",
                      description: "Email is not available.",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Supervisor
              </Button>
              
              <Button className="w-full bg-[#800000] hover:bg-[#5c0000] flex items-center justify-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Supervisor
              </Button>
              
              <Button 
                variant="link" 
                className="w-full text-[#800000] hover:text-[#5c0000] p-0 h-auto mt-2"
                onClick={() => {
                  toast({
                    title: "Booking Request Sent",
                    description: "A request has been sent to schedule a call with your supervisor.",
                  });
                }}
              >
                <CalendarClock className="h-4 w-4 mr-1" />
                Schedule a consultation
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupervisorCard;