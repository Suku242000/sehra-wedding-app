import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { updateWithAuth } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const weddingDateSchema = z.object({
  weddingDate: z.string().min(1, 'Wedding date is required'),
});

type WeddingDateFormValues = z.infer<typeof weddingDateSchema>;

const WeddingDateBanner: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  
  // Form
  const form = useForm<WeddingDateFormValues>({
    resolver: zodResolver(weddingDateSchema),
    defaultValues: {
      weddingDate: user?.weddingDate || '',
    },
  });
  
  // Update wedding date mutation
  const updateWeddingDateMutation = useMutation({
    mutationFn: (date: string) => updateWithAuth('/api/wedding-date', { weddingDate: date }),
    onSuccess: (data) => {
      updateUser({ weddingDate: data.weddingDate });
      toast({ 
        title: "Wedding Date Updated", 
        description: "Your wedding date has been updated successfully." 
      });
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update wedding date.", 
        variant: "destructive" 
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: WeddingDateFormValues) => {
    updateWeddingDateMutation.mutate(data.weddingDate);
  };
  
  // Calculate countdown
  useEffect(() => {
    if (!user?.weddingDate) return;
    
    const weddingDate = new Date(user.weddingDate);
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = weddingDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [user?.weddingDate]);
  
  // Format wedding date
  const formattedWeddingDate = user?.weddingDate 
    ? new Date(user.weddingDate).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : 'Not set';
  
  return (
    <motion.div 
      className="mt-8 bg-white rounded-lg shadow-md overflow-hidden"
      variants={fadeIn('up', 'tween', 0.7, 0.5)}
      initial="hidden"
      animate="show"
    >
      <div className="bg-cover bg-center p-6 md:p-8 text-white text-center relative" style={{backgroundImage: "url('https://images.unsplash.com/photo-1617789160764-b8620252c6e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"}}>
        <div className="absolute inset-0 bg-[#800000]/70"></div>
        <div className="relative z-10">
          <h2 className="font-serif text-2xl md:text-3xl font-medium mb-2">Your Big Day Is Coming</h2>
          <div className="font-script text-xl text-[#FFD700]">
            {user?.weddingDate ? formattedWeddingDate : (
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/20"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Set Wedding Date
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Set Your Wedding Date</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="weddingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wedding Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                min={new Date().toISOString().split('T')[0]}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="maroon-gradient">
                          Save Date
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="divider my-4 mx-auto w-24"></div>
          <p className="max-w-xl mx-auto">
            {user?.weddingDate 
              ? "Mark your calendars for this special occasion. Everything is being prepared to make your wedding day unforgettable."
              : "Setting your wedding date helps us plan your special day better. Click the button above to choose your date."}
          </p>
          
          {user?.weddingDate && (
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[110px]"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-[#FFD700]">{countdown.days}</div>
                <div className="text-sm">Days</div>
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[110px]"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-[#FFD700]">{countdown.hours}</div>
                <div className="text-sm">Hours</div>
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[110px]"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-[#FFD700]">{countdown.minutes}</div>
                <div className="text-sm">Minutes</div>
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[110px]"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-[#FFD700]">{countdown.seconds}</div>
                <div className="text-sm">Seconds</div>
              </motion.div>
            </div>
          )}
          
          {user?.weddingDate && (
            <div className="mt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/20"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Change Date
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Change Wedding Date</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="weddingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Wedding Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                min={new Date().toISOString().split('T')[0]}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="maroon-gradient">
                          Update Date
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WeddingDateBanner;
