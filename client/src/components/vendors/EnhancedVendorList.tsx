import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchWithAuth, createWithAuth, updateWithAuth, invalidateQueries } from '@/lib/api';
import { VendorProfile } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { fadeIn, staggerContainer, itemVariants } from '@/lib/motion';
import { VENDOR_CATEGORIES } from '@/types';
import { formatCurrency, truncateText } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { 
  CalendarIcon, MessageCircle, Star, MapPin, DollarSign, Clock, BookOpen, Bookmark, Filter, 
  Search, Home, Camera, Video, Utensils, Wand2, Scissors, Sparkles, Hand, Music, Lightbulb, 
  Heart, Check, ThumbsUp, ThumbsDown, Smile, Frown, Meh, Send, Image
} from 'lucide-react';

// Message schema
const messageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

type MessageFormValues = z.infer<typeof messageSchema>;

// Booking form schema
const bookingSchema = z.object({
  vendorId: z.number(),
  eventDate: z.string().min(1, 'Event date is required'),
  eventType: z.string().optional(),
  details: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const EnhancedVendorList: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openChatDialog, setOpenChatDialog] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteVendors, setFavoriteVendors] = useState<number[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Fetch all vendors
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['/api/vendors'],
  });
  
  // Fetch bookings to check if vendor already booked
  const { data: bookings = [] } = useQuery({
    queryKey: ['/api/bookings'],
  });

  // Query to get supervisor suggested vendors
  const { data: suggestedVendors = [] } = useQuery({
    queryKey: ['/api/client/assigned-vendors'],
  });
  
  // Booking form
  const bookingForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vendorId: 0,
      eventDate: '',
      eventType: '',
      details: '',
    },
  });
  
  // Message form
  const messageForm = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: '',
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
      bookingForm.reset();
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

  // Create message mutation (mock)
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: MessageFormValues) => 
      // Mock API call - would connect to real backend
      Promise.resolve({ success: true }),
    onSuccess: () => {
      toast({ 
        title: "Message Sent", 
        description: "Your message has been sent to the vendor." 
      });
      messageForm.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Message Failed", 
        description: error.message || "Failed to send message.", 
        variant: "destructive" 
      });
    }
  });

  // Toggle favorite
  const toggleFavorite = (vendorId: number) => {
    setFavoriteVendors(prev => 
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
    
    toast({
      title: favoriteVendors.includes(vendorId) ? "Removed from Favorites" : "Added to Favorites",
      description: favoriteVendors.includes(vendorId) 
        ? "Vendor removed from your favorites"
        : "Vendor added to your favorites",
    });
  };

  // Filter vendors based on criteria
  const filteredVendors = vendors
    .filter((vendor: VendorProfile) => {
      // Filter by category
      if (selectedCategory !== 'all' && vendor.vendorType !== selectedCategory) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !(
        vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.vendorType.toLowerCase().includes(searchQuery.toLowerCase())
      )) {
        return false;
      }
      
      // Filter by price range (mock implementation)
      const vendorPriceLevel = vendor.priceRange 
        ? (vendor.priceRange.includes('Budget') ? 1 : 
           vendor.priceRange.includes('Mid') ? 2 : 
           vendor.priceRange.includes('Premium') ? 3 : 
           vendor.priceRange.includes('Luxury') ? 4 : 2)
        : 2;
        
      if (vendorPriceLevel < priceRange[0] || vendorPriceLevel > priceRange[1]) {
        return false;
      }
      
      // Filter by favorites
      if (showFavoritesOnly && !favoriteVendors.includes(vendor.id)) {
        return false;
      }
      
      return true;
    })
    // Sort suggested vendors to top
    .sort((a: VendorProfile, b: VendorProfile) => {
      const aIsSuggested = suggestedVendors.some((sv: any) => sv.id === a.id);
      const bIsSuggested = suggestedVendors.some((sv: any) => sv.id === b.id);
      
      if (aIsSuggested && !bIsSuggested) return -1;
      if (!aIsSuggested && bIsSuggested) return 1;
      return 0;
    });
  
  // Check if vendor is already booked
  const isVendorBooked = (vendorId: number) => {
    return bookings.some((booking: any) => booking.vendorId === vendorId);
  };
  
  // Open booking dialog
  const openBookingDialog = (vendor: VendorProfile) => {
    setSelectedVendor(vendor);
    bookingForm.reset({
      vendorId: vendor.id,
      eventDate: '',
      eventType: '',
      details: '',
    });
    setOpenDialog(true);
  };
  
  // Open chat dialog
  const openVendorChat = (vendor: VendorProfile) => {
    setSelectedVendor(vendor);
    messageForm.reset({ message: '' });
    setOpenChatDialog(true);
  };
  
  // Handle booking submit
  const onSubmitBooking = (data: BookingFormValues) => {
    createBookingMutation.mutate(data);
  };
  
  // Handle message submit
  const onSubmitMessage = (data: MessageFormValues) => {
    sendMessageMutation.mutate(data);
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

  // Format price range for display
  const formatPriceRangeLabel = (value: number) => {
    switch(value) {
      case 1: return 'Budget';
      case 2: return 'Mid-range';
      case 3: return 'Premium';
      case 4: return 'Luxury';
      case 5: return 'Ultra-luxury';
      default: return 'Any';
    }
  };
  
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header Section */}
      <motion.div 
        className="flex flex-col space-y-4"
        variants={fadeIn('up', 'tween', 0.2, 0.5)}
      >
        <h2 className="text-2xl font-serif font-semibold text-[#800000]">Find the Perfect Vendors</h2>
        <p className="text-gray-600">Browse our curated list of premium wedding vendors to make your special day perfect.</p>
      </motion.div>
      
      {/* Search and Filter Bar */}
      <motion.div 
        className="flex flex-col md:flex-row gap-4"
        variants={fadeIn('up', 'tween', 0.3, 0.5)}
      >
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search vendors..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Vendors</DialogTitle>
              <DialogDescription>
                Refine your vendor search with these filters
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Price Range</h4>
                <div className="px-3">
                  <Slider
                    defaultValue={priceRange}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="my-6"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatPriceRangeLabel(priceRange[0])}</span>
                    <span>to</span>
                    <span>{formatPriceRangeLabel(priceRange[1])}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Show Only</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-favorites"
                    checked={showFavoritesOnly}
                    onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className="rounded text-[#800000] focus:ring-[#800000]"
                  />
                  <label htmlFor="show-favorites" className="text-sm">Favorite Vendors</label>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Availability</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <Calendar
                    mode="single"
                    selected={undefined}
                    onSelect={() => {}}
                    className="mx-auto"
                    disabled={(date) => date < new Date()}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setPriceRange([0, 5]);
                setShowFavoritesOnly(false);
              }}>
                Reset
              </Button>
              <Button className="bg-[#800000] hover:bg-[#5c0000]">
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
      
      {/* Category Tabs */}
      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <ScrollArea className="w-full">
          <TabsList className="flex h-auto mb-2 p-1 w-max">
            <TabsTrigger value="all">All Categories</TabsTrigger>
            {VENDOR_CATEGORIES.map((category) => (
              <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-1">
                {getVendorIcon(category.value)}
                <span>{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
        
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
                We couldn't find any vendors matching your filters. Please try adjusting your search criteria.
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
                  <Card className="h-full flex flex-col border-[#FFD700]/20 hover:border-[#FFD700] transition-colors relative overflow-hidden">
                    {/* Favorite Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white h-8 w-8 rounded-full p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(vendor.id);
                      }}
                    >
                      <Heart 
                        className={`h-4 w-4 ${favoriteVendors.includes(vendor.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                      />
                    </Button>
                    
                    {/* Supervisor Suggested Badge */}
                    {suggestedVendors.some((sv: any) => sv.id === vendor.id) && (
                      <div className="absolute top-0 left-0 bg-[#800000] text-white text-xs py-1 px-2 rounded-br-md">
                        <span className="flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Supervisor Pick
                        </span>
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-b from-transparent to-black/60 absolute inset-x-0 bottom-0 h-1/3 z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <CardHeader className="pb-2 relative">
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
                    
                    {vendor.portfolio && vendor.portfolio.images && vendor.portfolio.images.length > 0 ? (
                      <div className="px-4 pt-0 pb-3">
                        <div className="h-40 overflow-hidden rounded-md mb-3 bg-gray-100">
                          <img 
                            src={vendor.portfolio.images[0]} 
                            alt={vendor.businessName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 pt-0 pb-3">
                        <div className="h-40 flex items-center justify-center rounded-md mb-3 bg-gray-100">
                          {getVendorIcon(vendor.vendorType)}
                          <span className="ml-2 text-gray-400">No images</span>
                        </div>
                      </div>
                    )}
                    
                    <CardContent className="flex-grow py-0">
                      <p className="text-gray-600 mb-4 text-sm">
                        {truncateText(vendor.description || 'Premier wedding service provider offering exceptional quality and memorable experiences.', 100)}
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
                    
                    <CardFooter className="pt-4 grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline"
                        className="w-full border-[#800000]/30 text-[#800000] hover:bg-[#800000]/10"
                        onClick={() => openVendorChat(vendor)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
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
          
          <Form {...bookingForm}>
            <form onSubmit={bookingForm.handleSubmit(onSubmitBooking)} className="space-y-4">
              <FormField
                control={bookingForm.control}
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
                control={bookingForm.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="">Select event type</option>
                        <option value="sangeet">Sangeet</option>
                        <option value="mehendi">Mehendi</option>
                        <option value="haldi">Haldi</option>
                        <option value="wedding">Wedding Ceremony</option>
                        <option value="reception">Reception</option>
                        <option value="other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={bookingForm.control}
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
      
      {/* Chat Dialog */}
      <Dialog open={openChatDialog} onOpenChange={setOpenChatDialog}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getVendorIcon(selectedVendor?.vendorType || 'decoration')}
              <span>Chat with {selectedVendor?.businessName}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-grow overflow-y-auto mb-4 bg-gray-50 rounded-md p-4 space-y-4">
            {/* System message */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-200 text-gray-600 rounded-full px-4 py-1 text-xs">
                Chat started with {selectedVendor?.businessName}
              </div>
            </div>
            
            {/* Vendor message */}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-[#800000]/10 flex items-center justify-center text-xs text-[#800000] font-medium">
                {selectedVendor?.businessName?.charAt(0)}
              </div>
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%]">
                <p className="text-sm">Hello! Thanks for contacting {selectedVendor?.businessName}. How can I help you with your wedding?</p>
                <div className="text-xs text-gray-400 mt-1">11:25 AM</div>
              </div>
            </div>
            
            {/* User message - placeholder for demo */}
            <div className="flex items-start gap-2 justify-end">
              <div className="bg-[#800000] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%] text-white">
                <p className="text-sm">Hi! I'm interested in your services for my wedding. Do you have availability in December?</p>
                <div className="text-xs text-white/70 mt-1">11:30 AM</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#800000] flex items-center justify-center text-xs text-white font-medium">
                You
              </div>
            </div>
            
            {/* Vendor response - placeholder for demo */}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-[#800000]/10 flex items-center justify-center text-xs text-[#800000] font-medium">
                {selectedVendor?.businessName?.charAt(0)}
              </div>
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%]">
                <p className="text-sm">Yes, we do have some dates available in December! Would you like to book a consultation to discuss your requirements?</p>
                <div className="text-xs text-gray-400 mt-1">11:32 AM</div>
              </div>
            </div>
            
            {/* Quick reactions */}
            <div className="flex justify-center gap-3 my-4">
              <Button variant="outline" size="sm" className="rounded-full px-4">
                <ThumbsUp className="h-4 w-4 mr-1" /> Interested
              </Button>
              <Button variant="outline" size="sm" className="rounded-full px-4">
                <Calendar className="h-4 w-4 mr-1" /> Availability?
              </Button>
              <Button variant="outline" size="sm" className="rounded-full px-4">
                <DollarSign className="h-4 w-4 mr-1" /> Pricing?
              </Button>
            </div>
          </div>
          
          <Form {...messageForm}>
            <form onSubmit={messageForm.handleSubmit(onSubmitMessage)} className="flex items-end gap-2">
              <Button type="button" variant="ghost" size="icon">
                <Image className="h-5 w-5 text-gray-500" />
              </Button>
              
              <FormField
                control={messageForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Textarea
                        placeholder="Type your message..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" size="icon" className="bg-[#800000] hover:bg-[#5c0000] h-10 w-10">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default EnhancedVendorList;