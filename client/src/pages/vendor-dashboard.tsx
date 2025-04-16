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
            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-4 md:mt-0">
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