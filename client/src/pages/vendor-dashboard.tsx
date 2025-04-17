import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'wouter';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorBooking, VendorProfile, User, UserRole, VendorAnalytics } from '@shared/schema';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/LogoutButton';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarIcon, CheckIcon, ClockIcon, UserIcon, 
  ImageIcon, PlusIcon, StarIcon, TrashIcon, 
  ThumbsUpIcon, UploadIcon, XIcon, MoreHorizontalIcon,
  MapPinIcon, DollarSignIcon, BriefcaseIcon, MessageSquareIcon,
  ShieldIcon, UserCheckIcon, AlertTriangleIcon, BellIcon,
  TrendingUpIcon, BarChart2Icon, PieChartIcon, 
  EyeIcon, UserPlusIcon, ActivityIcon, RefreshCwIcon,
  CheckSquareIcon, PercentIcon, ClockIcon as ClockIconFilled
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, differenceInDays, isPast as isDatePast, isFuture, parseISO, subDays } from 'date-fns';
import {
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [bookingDetailsId, setBookingDetailsId] = useState<number | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [profileForm, setProfileForm] = useState({
    businessName: '',
    description: '',
    location: '',
    priceRange: '',
    vendorType: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch vendor profile
  const { data: vendorProfile } = useQuery<VendorProfile>({
    queryKey: ['/api/vendors/my-profile'],
    enabled: !!user,
    onSuccess: (data: VendorProfile | undefined) => {
      if (data) {
        if (data.portfolio) {
          setPortfolioImages(data.portfolio);
        }
        
        // Populate profile form with current data
        setProfileForm({
          businessName: data.businessName || '',
          description: data.description || '',
          location: data.location || '',
          priceRange: data.priceRange || '',
          vendorType: data.vendorType || ''
        });
      }
    }
  } as any);

  // Fetch vendor analytics data
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery<VendorAnalytics>({
    queryKey: ['/api/vendors/analytics'],
    enabled: !!user && !!vendorProfile,
    refetchOnWindowFocus: false
  });

  // Calculate analytics refresh
  const refreshAnalyticsMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/vendors/analytics/calculate'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors/analytics'] });
      toast({
        title: 'Analytics updated',
        description: 'Your vendor analytics data has been recalculated',
      });
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
    mutationFn: (portfolio: string[]) => {
      if (!vendorProfile || typeof vendorProfile === 'undefined') {
        throw new Error('Vendor profile not found');
      }
      return apiRequest('PATCH', `/api/vendors/${(vendorProfile as any).id}`, { portfolio });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors/my-profile'] });
      toast({
        title: 'Portfolio updated',
        description: 'Your portfolio has been updated successfully',
      });
    }
  });
  
  // Mutation for updating vendor profile
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: typeof profileForm) => {
      if (!vendorProfile || typeof vendorProfile === 'undefined') {
        throw new Error('Vendor profile not found');
      }
      return apiRequest('PATCH', `/api/vendors/${(vendorProfile as any).id}`, profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors/my-profile'] });
      toast({
        title: 'Profile updated',
        description: 'Your vendor profile has been updated successfully',
      });
      setIsEditProfileOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.toString(),
        variant: 'destructive'
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
  
  // Get assigned supervisor, if any
  const { data: assignedSupervisor } = useQuery<User>({
    queryKey: ['/api/vendors/assigned-supervisor'],
    enabled: !!user,
  });
  
  // Categorize bookings
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
  
  // Check if a booking is in the past
  const isPastBooking = (eventDate: string): boolean => {
    return isDatePast(new Date(eventDate));
  };

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
            <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
              <LogoutButton />
              <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Vendor Profile</DialogTitle>
                    <DialogDescription>
                      Update your vendor information to attract more clients
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid w-full gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="businessName" className="text-sm font-medium">Business Name</label>
                        <Input 
                          id="businessName" 
                          value={profileForm.businessName}
                          onChange={(e) => setProfileForm({...profileForm, businessName: e.target.value})}
                          placeholder="Your business name"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="vendorType" className="text-sm font-medium">Vendor Type</label>
                        <select 
                          id="vendorType" 
                          value={profileForm.vendorType}
                          onChange={(e) => setProfileForm({...profileForm, vendorType: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Select vendor type</option>
                          <option value="hotel">Hotel & Venue</option>
                          <option value="photographer">Photography</option>
                          <option value="videographer">Videography</option>
                          <option value="catering">Catering</option>
                          <option value="makeup">Makeup Artist</option>
                          <option value="hairdresser">Hairdresser</option>
                          <option value="decoration">Decoration</option>
                          <option value="mehandi">Mehandi</option>
                          <option value="dj">DJ & Music</option>
                          <option value="lighting">Lighting</option>
                        </select>
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="description" className="text-sm font-medium">Description</label>
                        <textarea 
                          id="description" 
                          rows={3}
                          value={profileForm.description}
                          onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                          placeholder="Describe your services"
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="location" className="text-sm font-medium">Location</label>
                        <Input 
                          id="location" 
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                          placeholder="Your business location"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="priceRange" className="text-sm font-medium">Price Range</label>
                        <Input 
                          id="priceRange" 
                          value={profileForm.priceRange}
                          onChange={(e) => setProfileForm({...profileForm, priceRange: e.target.value})}
                          placeholder="e.g. ₹25,000 - ₹50,000"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditProfileOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => updateProfileMutation.mutate(profileForm)}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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
                  {(vendorProfile as any)?.businessName || user?.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {(vendorProfile as any)?.description || "No description available"}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">Vendor Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {(vendorProfile as any)?.vendorType || "Not specified"}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">Location:</span>
                    <span>{(vendorProfile as any)?.location || "Not specified"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">Price Range:</span>
                    <span>{(vendorProfile as any)?.priceRange || "Not specified"}</span>
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
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolio">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle>Your Portfolio</CardTitle>
                  <CardDescription>
                    Showcase your best work to attract more clients
                  </CardDescription>
                </div>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Add Images
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Images</DialogTitle>
                      <DialogDescription>
                        Add images to your portfolio to showcase your work
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="dropzone-file"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, WEBP or SVG (MAX. 2MB)
                            </p>
                          </div>
                          <input
                            id="dropzone-file"
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      {uploadFile && (
                        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                          Selected file: {uploadFile.name}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setUploadFile(null);
                          setIsUploadOpen(false);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUploadImage}
                        disabled={!uploadFile || updatePortfolioMutation.isPending}
                      >
                        {updatePortfolioMutation.isPending ? 'Uploading...' : 'Upload'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {portfolioImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {portfolioImages.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <PortfolioItem 
                          imageUrl={image} 
                          onDelete={() => handleDeleteImage(index)} 
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-gray-100 rounded-full p-6">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">No portfolio items yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Add photos of your past work to showcase your skills and attract more clients.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadOpen(true)}
                      className="mt-4"
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add Your First Photo
                    </Button>
                  </div>
                )}
                
                {/* Portfolio Tips */}
                {portfolioImages.length > 0 && (
                  <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Tips for a great portfolio:</h4>
                    <ul className="space-y-1 text-sm text-gray-500 list-disc pl-5">
                      <li>Upload high-quality images that showcase your best work</li>
                      <li>Include diverse examples to display your range of skills</li>
                      <li>Add images that match with different wedding themes and seasons</li>
                      <li>Consider including before/after photos if applicable</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
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
                          fontWeight: 'bold',
                          color: '#800000'
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {filteredBookings.length > 0 ? 
                        `Events on ${date && format(date, 'PPP')}` : 
                        `No events on ${date && format(date, 'PPP')}`
                      }
                    </h3>
                    
                    <div className="space-y-3">
                      {filteredBookings.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                          <div className="flex flex-col sm:flex-row">
                            <div className={`p-4 w-full sm:w-2 ${
                              booking.status === 'confirmed' ? 'bg-green-100' :
                              booking.status === 'cancelled' ? 'bg-red-100' : 'bg-yellow-100'
                            }`}>
                            </div>
                            <CardContent className="p-4 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <h4 className="font-medium">
                                    {getClientName(booking.userId)}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {format(new Date(booking.eventDate), 'h:mm a')} - Event: {booking.eventType}
                                  </p>
                                </div>
                                <div className="mt-2 sm:mt-0">
                                  <Badge className={
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                                    'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                  }>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              
                              {booking.status === 'pending' && (
                                <div className="mt-3 flex space-x-2">
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => acceptBookingMutation.mutate(booking.id)}
                                    disabled={acceptBookingMutation.isPending}
                                  >
                                    <CheckIcon className="mr-1 h-4 w-4" />
                                    Accept
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => declineBookingMutation.mutate(booking.id)}
                                    disabled={declineBookingMutation.isPending}
                                  >
                                    <XIcon className="mr-1 h-4 w-4" />
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                      
                      {filteredBookings.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <h3 className="text-gray-500 font-medium">No bookings scheduled</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            You have no events scheduled for this date
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Requests</CardTitle>
                <CardDescription>Manage all your booking requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-gray-500 font-medium">No bookings yet</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Your bookings will appear here once clients make requests
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {bookings.map((booking) => {
                        const isPendingRequest = booking.status === 'pending';
                        const eventDate = new Date(booking.eventDate);
                        const isUpcoming = isFuture(eventDate);
                        const isPast = isPast(eventDate);
                        
                        return (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="overflow-hidden">
                              <div className="flex flex-col sm:flex-row">
                                <div className={`p-4 w-full sm:w-2 ${
                                  booking.status === 'confirmed' ? 'bg-green-100' :
                                  booking.status === 'cancelled' ? 'bg-red-100' : 'bg-yellow-100'
                                }`}></div>
                                <CardContent className="p-6 flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                    <div>
                                      <h4 className="text-lg font-medium">
                                        {getClientName(booking.userId)}
                                      </h4>
                                      <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <CalendarIcon className="mr-1 h-4 w-4" />
                                        {format(eventDate, 'PPP')}
                                        <span className="mx-2">•</span>
                                        <ClockIcon className="mr-1 h-4 w-4" />
                                        {format(eventDate, 'p')}
                                      </div>
                                    </div>
                                    <div className="mt-3 sm:mt-0 flex items-center">
                                      <Badge className={`mr-2 ${
                                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                                        'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                      }`}>
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                      </Badge>
                                      {isUpcoming && (
                                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                                          {differenceInDays(eventDate, new Date())} days left
                                        </Badge>
                                      )}
                                      {isPast && (
                                        <Badge variant="outline" className="border-gray-200 text-gray-700">
                                          Completed
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">Event Type</span>
                                      <span className="text-sm">{booking.eventType}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">Location</span>
                                      <span className="text-sm">{booking.location || 'Not specified'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">Budget</span>
                                      <span className="text-sm">
                                        {new Intl.NumberFormat('en-IN', {
                                          style: 'currency',
                                          currency: 'INR',
                                          maximumFractionDigits: 0
                                        }).format(booking.budget)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {booking.notes && (
                                    <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 mb-4">
                                      <div className="font-medium text-xs text-gray-500 mb-1">Notes</div>
                                      {booking.notes}
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-2">
                                    <Dialog
                                      open={bookingDetailsId === booking.id}
                                      onOpenChange={(open) => setBookingDetailsId(open ? booking.id : null)}
                                    >
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          <MessageSquareIcon className="mr-1 h-4 w-4" />
                                          View Details
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                          <DialogTitle>Booking Details</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium">Client Name</span>
                                            <span>{getClientName(booking.userId)}</span>
                                          </div>
                                          <Separator />
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium">Event Date</span>
                                            <span>{format(new Date(booking.eventDate), 'PPP')}</span>
                                          </div>
                                          <Separator />
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium">Event Time</span>
                                            <span>{format(new Date(booking.eventDate), 'p')}</span>
                                          </div>
                                          <Separator />
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium">Event Type</span>
                                            <span>{booking.eventType}</span>
                                          </div>
                                          <Separator />
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium">Location</span>
                                            <span>{booking.location || 'Not specified'}</span>
                                          </div>
                                          <Separator />
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium">Budget</span>
                                            <span>
                                              {new Intl.NumberFormat('en-IN', {
                                                style: 'currency',
                                                currency: 'INR',
                                                maximumFractionDigits: 0
                                              }).format(booking.budget)}
                                            </span>
                                          </div>
                                          <Separator />
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium">Status</span>
                                            <Badge className={
                                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                              'bg-yellow-100 text-yellow-800'
                                            }>
                                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </Badge>
                                          </div>
                                          {booking.notes && (
                                            <>
                                              <Separator />
                                              <div>
                                                <div className="font-medium mb-2">Notes</div>
                                                <div className="bg-gray-50 p-3 rounded-md text-sm">
                                                  {booking.notes}
                                                </div>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                        {isPendingRequest && (
                                          <DialogFooter>
                                            <Button 
                                              variant="outline" 
                                              className="text-red-600 border-red-600 hover:bg-red-50"
                                              onClick={() => {
                                                declineBookingMutation.mutate(booking.id);
                                                setBookingDetailsId(null);
                                              }}
                                              disabled={declineBookingMutation.isPending}
                                            >
                                              <XIcon className="mr-1 h-4 w-4" />
                                              Decline
                                            </Button>
                                            <Button 
                                              className="bg-green-600 hover:bg-green-700"
                                              onClick={() => {
                                                acceptBookingMutation.mutate(booking.id);
                                                setBookingDetailsId(null);
                                              }}
                                              disabled={acceptBookingMutation.isPending}
                                            >
                                              <CheckIcon className="mr-1 h-4 w-4" />
                                              Accept
                                            </Button>
                                          </DialogFooter>
                                        )}
                                      </DialogContent>
                                    </Dialog>
                                    {isPendingRequest && (
                                      <>
                                        <Button 
                                          variant="default" 
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => acceptBookingMutation.mutate(booking.id)}
                                          disabled={acceptBookingMutation.isPending}
                                        >
                                          <CheckIcon className="mr-1 h-4 w-4" />
                                          Accept
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          className="text-red-600 border-red-600 hover:bg-red-50"
                                          onClick={() => declineBookingMutation.mutate(booking.id)}
                                          disabled={declineBookingMutation.isPending}
                                        >
                                          <XIcon className="mr-1 h-4 w-4" />
                                          Decline
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </CardContent>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Client Reviews</CardTitle>
                <CardDescription>
                  See what clients say about your services
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* For this example, we'll use mock reviews */}
                <ReviewCard 
                  author="Deepak Sharma"
                  date="April 10, 2025"
                  rating={5}
                  comment="Absolutely outstanding service. The photographer was punctual, professional, and delivered stunning images that captured every special moment of our wedding day."
                />
                <ReviewCard 
                  author="Priya Patel"
                  date="March 28, 2025"
                  rating={4}
                  comment="Great service overall. The photos were beautiful and the team was very accommodating. Would have given 5 stars if we had received the edited photos a bit earlier."
                />
                <ReviewCard 
                  author="Arjun Singh"
                  date="March 15, 2025"
                  rating={5}
                  comment="Exceeded our expectations! They went above and beyond to capture our wedding day perfectly. Highly recommend to anyone looking for a professional photography service."
                />
                
                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ThumbsUpIcon className="h-5 w-5 text-[#800000] mr-2" />
                    <span className="font-medium">Tips for getting great reviews:</span>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-500 mt-2 list-disc pl-5">
                    <li>Always exceed client expectations</li>
                    <li>Communicate clearly and promptly</li>
                    <li>Be flexible with unexpected changes</li>
                    <li>Follow up after the event to ensure satisfaction</li>
                    <li>Deliver final products on time or earlier if possible</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Vendor Analytics</CardTitle>
                  <CardDescription>
                    Track your performance metrics and business growth
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refreshAnalyticsMutation.mutate()}
                  disabled={refreshAnalyticsMutation.isPending}
                >
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  {refreshAnalyticsMutation.isPending ? 'Updating...' : 'Refresh Data'}
                </Button>
              </CardHeader>
              <CardContent>
                {isAnalyticsLoading ? (
                  <div className="w-full py-12 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : !analyticsData ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-gray-100 rounded-full p-6">
                        <BarChart2Icon className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">No analytics data available</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      We're collecting data on your vendor performance. Check back soon for insights.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => refreshAnalyticsMutation.mutate()}
                      className="mt-4"
                      disabled={refreshAnalyticsMutation.isPending}
                    >
                      <RefreshCwIcon className="mr-2 h-4 w-4" />
                      Recalculate Analytics
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <EyeIcon className="mx-auto h-5 w-5 text-[#800000] mb-1" />
                        <div className="text-2xl font-bold">
                          {analyticsData.profileViews || 0}
                        </div>
                        <div className="text-xs text-gray-500">Profile Views</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <MessageSquareIcon className="mx-auto h-5 w-5 text-[#800000] mb-1" />
                        <div className="text-2xl font-bold">
                          {analyticsData.inquiryCount || 0}
                        </div>
                        <div className="text-xs text-gray-500">Inquiries</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <CheckSquareIcon className="mx-auto h-5 w-5 text-[#800000] mb-1" />
                        <div className="text-2xl font-bold">
                          {analyticsData.bookingCount || 0}
                        </div>
                        <div className="text-xs text-gray-500">Bookings</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <PercentIcon className="mx-auto h-5 w-5 text-[#800000] mb-1" />
                        <div className="text-2xl font-bold">
                          {analyticsData.conversionRate ? `${analyticsData.conversionRate.toFixed(1)}%` : '0%'}
                        </div>
                        <div className="text-xs text-gray-500">Conversion Rate</div>
                      </div>
                    </div>
                    
                    {/* Response Time */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="font-medium mb-3 flex items-center">
                        <ClockIconFilled className="h-4 w-4 mr-2 text-[#800000]" />
                        Average Response Time
                      </h3>
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl font-bold text-[#800000]">
                          {analyticsData.averageResponseTime ? `${analyticsData.averageResponseTime.toFixed(1)} hrs` : 'N/A'}
                        </div>
                        <Progress 
                          value={analyticsData.averageResponseTime ? Math.min(100 - (analyticsData.averageResponseTime / 24 * 100), 100) : 0} 
                          className="h-2 w-40"
                        />
                        <div className="text-xs text-gray-500">
                          {analyticsData.averageResponseTime && analyticsData.averageResponseTime < 6 
                            ? 'Excellent' 
                            : analyticsData.averageResponseTime && analyticsData.averageResponseTime < 12
                              ? 'Good'
                              : analyticsData.averageResponseTime && analyticsData.averageResponseTime < 24
                                ? 'Average'
                                : 'Needs Improvement'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Monthly Statistics Chart */}
                    {analyticsData.monthlyStats && analyticsData.monthlyStats.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-3">Monthly Performance</h3>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={analyticsData.monthlyStats}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Area 
                                type="monotone" 
                                dataKey="views" 
                                stackId="1"
                                stroke="#8884d8" 
                                fill="#8884d8" 
                                name="Profile Views"
                              />
                              <Area 
                                type="monotone" 
                                dataKey="inquiries" 
                                stackId="2"
                                stroke="#82ca9d" 
                                fill="#82ca9d" 
                                name="Inquiries"
                              />
                              <Area 
                                type="monotone" 
                                dataKey="bookings" 
                                stackId="3"
                                stroke="#ffc658" 
                                fill="#ffc658" 
                                name="Bookings"
                              />
                              <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stackId="4"
                                stroke="#ff8042" 
                                fill="#ff8042" 
                                name="Revenue (₹K)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    
                    {/* Daily Statistics if available */}
                    {analyticsData.dailyStats && analyticsData.dailyStats.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-3">Daily Activity (Last 7 Days)</h3>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={analyticsData.dailyStats}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Bar 
                                dataKey="views" 
                                fill="#8884d8" 
                                name="Profile Views" 
                              />
                              <Bar 
                                dataKey="inquiries" 
                                fill="#82ca9d" 
                                name="Inquiries" 
                              />
                              <Bar 
                                dataKey="bookings" 
                                fill="#ffc658" 
                                name="Bookings" 
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    
                    {/* Analytics Tips */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <TrendingUpIcon className="h-5 w-5 text-[#800000] mr-2" />
                        Tips to Improve Your Performance
                      </h3>
                      <ul className="space-y-1 text-sm text-gray-500 list-disc pl-5">
                        <li>Respond to inquiries within 6 hours to improve conversion rates</li>
                        <li>Add high-quality photos to your portfolio to increase profile views</li>
                        <li>Keep your calendar up-to-date with your availability</li>
                        <li>Request reviews from satisfied clients to build credibility</li>
                        <li>Optimize your pricing based on seasonal demand trends</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Booking Details Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setBookingDetailsId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Client Name</span>
                  <span>{getClientName(selectedBooking.userId)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Event Date</span>
                  <span>{format(new Date(selectedBooking.eventDate), 'PPP')}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Event Time</span>
                  <span>{format(new Date(selectedBooking.eventDate), 'p')}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Event Type</span>
                  <span>{selectedBooking.eventType}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Location</span>
                  <span>{selectedBooking.location || 'Not specified'}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Budget</span>
                  <span>
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(selectedBooking.budget)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status</span>
                  <Badge className={
                    selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    selectedBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </Badge>
                </div>
                {selectedBooking.notes && (
                  <>
                    <Separator />
                    <div>
                      <div className="font-medium mb-2">Notes</div>
                      <div className="bg-gray-50 p-3 rounded-md text-sm">
                        {selectedBooking.notes}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {selectedBooking && selectedBooking.status === 'pending' && (
              <DialogFooter>
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => {
                    declineBookingMutation.mutate(selectedBooking.id);
                    setBookingDetailsId(null);
                  }}
                  disabled={declineBookingMutation.isPending}
                >
                  <XIcon className="mr-1 h-4 w-4" />
                  Decline
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    acceptBookingMutation.mutate(selectedBooking.id);
                    setBookingDetailsId(null);
                  }}
                  disabled={acceptBookingMutation.isPending}
                >
                  <CheckIcon className="mr-1 h-4 w-4" />
                  Accept
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </Layout>
  );
};

export default VendorDashboard;