import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchWithAuth, createWithAuth, invalidateQueries } from '@/lib/api';
import { VendorProfile } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { fadeIn, itemVariants } from '@/lib/motion';
import { VENDOR_CATEGORIES } from '@/types';
import { formatCurrency, truncateText } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, MessageCircle, Star, MapPin, DollarSign, Clock, BookOpen, Home, Camera, Video, Utensils, Wand2, Scissors, Sparkles, Hand, Music, Lightbulb } from 'lucide-react';

// Booking form schema
const bookingSchema = z.object({
  vendorId: z.number(),
  eventDate: z.string().min(1, 'Event date is required'),
  details: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const VendorList: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Fetch all vendors
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['/api/vendors'],
  });
  
  // Fetch bookings to check if vendor already booked
  const { data: bookings = [] } = useQuery({
    queryKey: ['/api/bookings'],
  });
  
  // Booking form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vendorId: 0,
      eventDate: '',
      details: '',
    },
  });
  
  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (bookingData: BookingFormValues) => createWithAuth('/api/bookings', bookingData),
    onSuccess: () => {
      invalidateQueries('/api/bookings');
      toast({ 
        title: "Booking Requested", 
        description: "Your booking request has been sent to the vendor." 
      });
      form.reset();
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Booking Failed", 
        description: error.message || "Failed to create booking.", 
        variant: "destructive" 
      });
    }
  });

  // Get filtered vendors
  const filteredVendors = selectedCategory === 'all' 
    ? vendors 
    : vendors.filter((vendor: VendorProfile) => vendor.vendorType === selectedCategory);
  
  // Check if vendor is already booked
  const isVendorBooked = (vendorId: number) => {
    return bookings.some((booking: any) => booking.vendorId === vendorId);
  };
  
  // Open booking dialog
  const openBookingDialog = (vendor: VendorProfile) => {
    setSelectedVendor(vendor);
    form.reset({
      vendorId: vendor.id,
      eventDate: '',
      details: '',
    });
    setOpenDialog(true);
  };
  
  // Handle booking submit
  const onSubmit = (data: BookingFormValues) => {
    createBookingMutation.mutate(data);
  };
  
  // Get vendor icon
  const getVendorIcon = (vendorType: string) => {
    switch (vendorType) {
      case 'hotel': return <Home className="h-5 w-5" />;
      case 'photographer': return <Camera className="h-5 w-5" />;
      case 'videographer': return <Video className="h-5 w-5" />;
      case 'catering': return <Utensils className="h-5 w-5" />;
      case 'makeup': return <Wand2 className="h-5 w-5" />;
      case 'hairdresser': return <Scissors className="h-5 w-5" />;
      case 'decoration': return <Sparkles className="h-5 w-5" />;
      case 'mehandi': return <Hand className="h-5 w-5" />;
      case 'dj': return <Music className="h-5 w-5" />;
      case 'lighting': return <Lightbulb className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };
  
  return (
    <motion.div
      variants={fadeIn('up', 'tween', 0.2, 0.5)}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-serif font-semibold text-[#800000]">Find the Perfect Vendors</h2>
        <p className="text-gray-600">Browse our curated list of premium wedding vendors to make your special day perfect.</p>
      </div>
      
      {/* Category Tabs */}
      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <TabsList className="flex flex-wrap gap-2 h-auto">
          <TabsTrigger value="all">All Categories</TabsTrigger>
          {VENDOR_CATEGORIES.map((category) => (
            <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-1">
              {getVendorIcon(category.value)}
              <span className="hidden sm:inline">{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={selectedCategory} className="pt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-100 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-9 bg-gray-200 rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-[#800000]/50 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">No Vendors Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any vendors in this category. Please try another category or check back later.
              </p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={fadeIn('up', 'tween', 0.2, 0.5)}
            >
              {filteredVendors.map((vendor: VendorProfile) => (
                <motion.div
                  key={vendor.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="h-full"
                >
                  <Card className="h-full flex flex-col border-[#FFD700]/20 hover:border-[#FFD700] transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-[#800000]">{vendor.businessName}</CardTitle>
                        <Badge className="bg-[#FFC0CB] text-[#800000] hover:bg-[#FFC0CB]/80">
                          {VENDOR_CATEGORIES.find(c => c.value === vendor.vendorType)?.label || vendor.vendorType}
                        </Badge>
                      </div>
                      <CardDescription>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < (vendor.rating || 0) ? 'text-[#FFD700] fill-[#FFD700]' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-1 text-xs text-gray-600">({vendor.rating}/5)</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 mb-4 text-sm">
                        {truncateText(vendor.description || 'Premier wedding service provider offering exceptional quality and memorable experiences.', 120)}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#800000]" />
                          <span>{vendor.location || 'India'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-[#800000]" />
                          <span>{vendor.priceRange || 'Contact for pricing'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#800000]" />
                          <span>
                            {vendor.availability && vendor.availability.length > 0 
                              ? `Available on ${vendor.availability.length} dates` 
                              : 'Contact for availability'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => openBookingDialog(vendor)}
                        className="w-full maroon-gradient"
                        disabled={isVendorBooked(vendor.id)}
                      >
                        {isVendorBooked(vendor.id) ? 'Already Booked' : 'Book Now'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Booking Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book {selectedVendor?.businessName}</DialogTitle>
            <DialogDescription>
              Fill out the details to request a booking with this vendor.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          disabled={(date) => date < new Date() || (selectedVendor?.availability ? !selectedVendor.availability.includes(format(date, 'yyyy-MM-dd')) : false)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide any specific requirements or notes for the vendor"
                        className="h-24"
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
                  Request Booking
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default VendorList;
