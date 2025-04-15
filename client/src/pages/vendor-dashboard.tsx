import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorBooking, VendorProfile, User } from '@shared/schema';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarIcon, CheckIcon, ClockIcon, UserIcon, 
  ImageIcon, PlusIcon, StarIcon, TrashIcon, 
  ThumbsUpIcon, UploadIcon, XIcon, MoreHorizontalIcon,
  MapPinIcon, DollarSignIcon, BriefcaseIcon, MessageSquareIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';

// Portfolio Item Component
interface PortfolioItemProps {
  imageUrl: string;
  onDelete: () => void;
}

const PortfolioItem: React.FC<PortfolioItemProps> = ({ imageUrl, onDelete }) => {
  return (
    <div className="relative group rounded-md overflow-hidden">
      <img 
        src={imageUrl} 
        alt="Portfolio item" 
        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <Button 
          variant="destructive" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onDelete}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Review Card Component
interface ReviewProps {
  author: string;
  date: string;
  rating: number;
  comment: string;
}

const ReviewCard: React.FC<ReviewProps> = ({ author, date, rating, comment }) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between mb-2">
          <div className="font-medium">{author}</div>
          <div className="text-sm text-gray-500">{date}</div>
        </div>
        <div className="flex items-center mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon 
              key={i} 
              className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <p className="text-gray-700">{comment}</p>
      </CardContent>
    </Card>
  );
};

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [bookingDetailsId, setBookingDetailsId] = useState<number | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch vendor profile
  const { data: vendorProfile } = useQuery<VendorProfile>({
    queryKey: ['/api/vendors/my-profile'],
    enabled: !!user,
    onSuccess: (data) => {
      if (data && data.portfolio) {
        setPortfolioImages(data.portfolio);
      }
    }
  });

  // Fetch vendor bookings with client info
  const { data: bookings = [] } = useQuery<VendorBooking[]>({
    queryKey: ['/api/bookings/vendor'],
    enabled: !!user
  });

  // Fetch client info for bookings
  const { data: clients = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user && !!bookings.length
  });

  // Mutation for accepting bookings
  const acceptBookingMutation = useMutation({
    mutationFn: (bookingId: number) => 
      apiRequest('PATCH', `/api/bookings/${bookingId}`, { status: 'confirmed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/vendor'] });
      toast({
        title: 'Booking confirmed',
        description: 'You have successfully confirmed this booking',
      });
    }
  });

  // Mutation for declining bookings
  const declineBookingMutation = useMutation({
    mutationFn: (bookingId: number) => 
      apiRequest('PATCH', `/api/bookings/${bookingId}`, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/vendor'] });
      toast({
        title: 'Booking declined',
        description: 'You have declined this booking request',
      });
    }
  });

  // Mutation for updating portfolio
  const updatePortfolioMutation = useMutation({
    mutationFn: (portfolio: string[]) => 
      apiRequest('PATCH', `/api/vendors/${vendorProfile?.id}`, { portfolio }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors/my-profile'] });
      toast({
        title: 'Portfolio updated',
        description: 'Your portfolio has been updated successfully',
      });
    }
  });

  // Filter bookings for selected date
  const filteredBookings = bookings.filter(booking => {
    if (!date) return false;
    const bookingDate = new Date(booking.eventDate);
    return (
      bookingDate.getDate() === date.getDate() &&
      bookingDate.getMonth() === date.getMonth() &&
      bookingDate.getFullYear() === date.getFullYear()
    );
  });

  // Dates with bookings for the calendar
  const bookedDates = bookings.map(booking => new Date(booking.eventDate));

  // Handler for file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  // Upload portfolio image
  const handleUploadImage = () => {
    if (!uploadFile) return;

    // In a real app, you would upload to a server/storage
    // For this demo, we'll use a base64 conversion
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newPortfolio = [...portfolioImages, base64String];
      setPortfolioImages(newPortfolio);
      updatePortfolioMutation.mutate(newPortfolio);
      setUploadFile(null);
      setIsUploadOpen(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(uploadFile);
  };

  // Delete portfolio image
  const handleDeleteImage = (index: number) => {
    const newPortfolio = [...portfolioImages];
    newPortfolio.splice(index, 1);
    setPortfolioImages(newPortfolio);
    updatePortfolioMutation.mutate(newPortfolio);
  };

  // Find client by ID
  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : `Client #${clientId}`;
  };

  // Get booking details
  const getBookingDetails = (bookingId: number | null) => {
    if (!bookingId) return null;
    return bookings.find(b => b.id === bookingId) || null;
  };

  const selectedBooking = getBookingDetails(bookingDetailsId);

  return (
    <Layout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="p-4 md:p-8"
      >
        <motion.div
          variants={fadeIn('up', 'tween', 0.2, 0.5)}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-2">Vendor Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.name}. Manage your vendor services and bookings here.
              </p>
            </div>
            <Button variant="outline" className="mt-4 md:mt-0">
              Edit Profile
            </Button>
          </div>
        </motion.div>

        {/* Vendor Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Vendor Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-4">
                  {vendorProfile?.businessName || user?.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {vendorProfile?.description || "No description available"}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">Vendor Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {vendorProfile?.vendorType || "Not specified"}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">Location:</span>
                    <span>{vendorProfile?.location || "Not specified"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">Price Range:</span>
                    <span>{vendorProfile?.priceRange || "Not specified"}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg mb-4">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-[#800000]">
                      {bookings.length}
                    </div>
                    <div className="text-gray-600">Total Bookings</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-[#800000]">
                      {bookings.filter(b => b.status === 'confirmed').length}
                    </div>
                    <div className="text-gray-600">Confirmed</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-[#800000]">
                      {bookings.filter(b => b.status === 'pending').length}
                    </div>
                    <div className="text-gray-600">Pending</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-[#800000]">
                      {bookings.filter(b => {
                        const now = new Date();
                        const bookingDate = new Date(b.eventDate);
                        return bookingDate > now;
                      }).length}
                    </div>
                    <div className="text-gray-600">Upcoming</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="calendar" className="mt-8">
          <TabsList className="mb-4">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="bookings">All Bookings</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Booking Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                      modifiers={{
                        booked: bookedDates
                      }}
                      modifiersStyles={{
                        booked: {
                          backgroundColor: 'rgba(128, 0, 0, 0.1)',
                          fontWeight: 'bold'
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">
                      {date ? (
                        <span className="flex items-center">
                          <CalendarIcon className="mr-2 h-5 w-5" />
                          Bookings for {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      ) : (
                        "Select a date to view bookings"
                      )}
                    </h3>
                    {filteredBookings.length > 0 ? (
                      <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                          <div key={booking.id} className="border rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                              <h4 className="font-medium">Client ID: {booking.userId}</h4>
                              <Badge
                                variant={booking.status === 'confirmed' ? "default" : "outline"}
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{booking.details}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              <span>
                                {new Date(booking.eventDate).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                              <Button variant="outline" size="sm">View Details</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No bookings for this date
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookings">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>Manage your bookings and events</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <UserIcon className="mr-2 h-4 w-4" />
                    View Clients
                  </Button>
                  <Button size="sm" className="hidden sm:flex">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Export Calendar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="pending" className="flex-1">
                      <div className="flex items-center">
                        <ClockIcon className="mr-2 h-4 w-4" />
                        Pending ({bookings.filter(b => b.status === 'pending').length})
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="confirmed" className="flex-1">
                      <div className="flex items-center">
                        <CheckIcon className="mr-2 h-4 w-4" />
                        Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="flex-1">
                      <div className="flex items-center">
                        <XIcon className="mr-2 h-4 w-4" />
                        Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
                      </div>
                    </TabsTrigger>
                  </TabsList>
                
                  <TabsContent value="pending">
                    {bookings.filter(b => b.status === 'pending').length > 0 ? (
                      <div className="space-y-4">
                        {bookings
                          .filter(b => b.status === 'pending')
                          .map((booking) => (
                            <motion.div 
                              key={booking.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm"
                            >
                              <div className="flex items-start gap-4">
                                <div className="bg-[#800000]/10 rounded-full p-3 hidden sm:flex">
                                  <CalendarIcon className="h-6 w-6 text-[#800000]" />
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <h3 className="font-medium">{getClientName(booking.userId)}</h3>
                                    <Badge className="ml-2" variant="outline">Pending</Badge>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">Event Date:</span> {format(new Date(booking.eventDate), 'PPP')}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <span className="font-semibold">Details:</span> {booking.details || 'No details provided'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex-1 sm:flex-none"
                                  onClick={() => declineBookingMutation.mutate(booking.id)}
                                  disabled={declineBookingMutation.isPending}
                                >
                                  <XIcon className="mr-2 h-4 w-4" />
                                  Decline
                                </Button>
                                <Button 
                                  size="sm"
                                  className="flex-1 sm:flex-none"
                                  onClick={() => acceptBookingMutation.mutate(booking.id)}
                                  disabled={acceptBookingMutation.isPending}
                                >
                                  <CheckIcon className="mr-2 h-4 w-4" />
                                  Accept
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        No pending bookings available
                      </div>
                    )}
                  </TabsContent>
                
                  <TabsContent value="confirmed">
                    {bookings.filter(b => b.status === 'confirmed').length > 0 ? (
                      <div className="space-y-4">
                        {bookings
                          .filter(b => b.status === 'confirmed')
                          .map((booking) => (
                            <motion.div 
                              key={booking.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm"
                            >
                              <div className="flex items-start gap-4">
                                <div className={`rounded-full p-3 hidden sm:flex ${
                                  isFuture(new Date(booking.eventDate)) 
                                    ? 'bg-green-100' 
                                    : 'bg-blue-100'
                                }`}>
                                  <CalendarIcon className={`h-6 w-6 ${
                                    isFuture(new Date(booking.eventDate)) 
                                      ? 'text-green-600' 
                                      : 'text-blue-600'
                                  }`} />
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <h3 className="font-medium">{getClientName(booking.userId)}</h3>
                                    <Badge className="ml-2" variant="default">Confirmed</Badge>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">Event Date:</span> {format(new Date(booking.eventDate), 'PPP')}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <span className="font-semibold">Details:</span> {booking.details || 'No details provided'}
                                  </div>
                                  {isFuture(new Date(booking.eventDate)) && (
                                    <div className="text-xs text-green-600 mt-1 flex items-center">
                                      <ClockIcon className="mr-1 h-3 w-3" />
                                      {differenceInDays(new Date(booking.eventDate), new Date())} days remaining
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex-1 sm:flex-none"
                                  onClick={() => setBookingDetailsId(booking.id)}
                                >
                                  <MessageSquareIcon className="mr-2 h-4 w-4" />
                                  Contact
                                </Button>
                                <Button 
                                  size="sm"
                                  className="flex-1 sm:flex-none"
                                  onClick={() => setBookingDetailsId(booking.id)}
                                >
                                  <MoreHorizontalIcon className="mr-2 h-4 w-4" />
                                  Details
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        No confirmed bookings available
                      </div>
                    )}
                  </TabsContent>
                
                  <TabsContent value="cancelled">
                    {bookings.filter(b => b.status === 'cancelled').length > 0 ? (
                      <div className="space-y-4">
                        {bookings
                          .filter(b => b.status === 'cancelled')
                          .map((booking) => (
                            <motion.div 
                              key={booking.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm opacity-70"
                            >
                              <div className="flex items-start gap-4">
                                <div className="bg-gray-100 rounded-full p-3 hidden sm:flex">
                                  <CalendarIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <h3 className="font-medium">{getClientName(booking.userId)}</h3>
                                    <Badge className="ml-2" variant="outline">Cancelled</Badge>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">Event Date:</span> {format(new Date(booking.eventDate), 'PPP')}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <span className="font-semibold">Details:</span> {booking.details || 'No details provided'}
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="mt-4 sm:mt-0"
                                onClick={() => setBookingDetailsId(booking.id)}
                              >
                                <MoreHorizontalIcon className="mr-2 h-4 w-4" />
                                Details
                              </Button>
                            </motion.div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        No cancelled bookings available
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Booking Details Dialog */}
            <Dialog open={!!bookingDetailsId} onOpenChange={(open) => !open && setBookingDetailsId(null)}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Booking Details</DialogTitle>
                  <DialogDescription>
                    View complete information about this booking
                  </DialogDescription>
                </DialogHeader>
                
                {selectedBooking && (
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-lg">{getClientName(selectedBooking.userId)}</div>
                      <Badge variant={selectedBooking.status === 'confirmed' ? "default" : selectedBooking.status === 'pending' ? "outline" : "secondary"}>
                        {selectedBooking.status}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Event Date</div>
                        <div className="font-medium">{format(new Date(selectedBooking.eventDate), 'PPP')}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Time</div>
                        <div className="font-medium">
                          {format(new Date(selectedBooking.eventDate), 'h:mm a')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Booked On</div>
                        <div className="font-medium">{format(new Date(selectedBooking.createdAt || ''), 'PPP')}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Booking ID</div>
                        <div className="font-medium">{selectedBooking.id}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Details</div>
                      <div className="p-3 bg-gray-50 rounded-md text-sm">
                        {selectedBooking.details || "No additional details provided."}
                      </div>
                    </div>
                    
                    {selectedBooking.status === 'pending' && (
                      <div className="flex space-x-3 mt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            declineBookingMutation.mutate(selectedBooking.id);
                            setBookingDetailsId(null);
                          }}
                          disabled={declineBookingMutation.isPending}
                        >
                          <XIcon className="mr-2 h-4 w-4" />
                          Decline
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => {
                            acceptBookingMutation.mutate(selectedBooking.id);
                            setBookingDetailsId(null);
                          }}
                          disabled={acceptBookingMutation.isPending}
                        >
                          <CheckIcon className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex space-x-3 mt-4">
                      <Button variant="outline" className="flex-1">
                        Contact Client
                      </Button>
                      {selectedBooking.status === 'confirmed' && (
                        <Button className="flex-1">
                          Send Reminder
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Client Reviews & Ratings</CardTitle>
                <CardDescription>
                  See what clients are saying about your services
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Example reviews - in a real app, these would come from the API */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-[#800000] text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      4.8
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`h-4 w-4 ${i < 5 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">Based on 12 reviews</div>
                    </div>
                  </div>
                </div>
                
                <ReviewCard 
                  author="Priya Sharma"
                  date="March 15, 2025"
                  rating={5}
                  comment="Amazing service! Our wedding photos turned out absolutely stunning. The team was professional and captured all the special moments perfectly."
                />
                
                <ReviewCard 
                  author="Raj Patel"
                  date="February 28, 2025"
                  rating={4}
                  comment="Great attention to detail and very accommodating to our special requests. Would recommend to others."
                />
                
                <ReviewCard 
                  author="Anjali Gupta"
                  date="January 10, 2025"
                  rating={5}
                  comment="The decoration was beyond our expectations. Everyone complimented how beautiful everything looked!"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default VendorDashboard;