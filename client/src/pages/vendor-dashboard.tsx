import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { VendorBooking, VendorProfile } from '@shared/schema';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CheckIcon, ClockIcon, UserIcon } from 'lucide-react';

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Fetch vendor profile
  const { data: vendorProfile } = useQuery<VendorProfile>({
    queryKey: ['/api/vendors/my-profile'],
    enabled: !!user
  });

  // Fetch vendor bookings
  const { data: bookings = [] } = useQuery<VendorBooking[]>({
    queryKey: ['/api/bookings/vendor'],
    enabled: !!user
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
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div>
                          <div className="font-medium">Client ID: {booking.userId}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(booking.eventDate).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{booking.details}</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={booking.status === 'confirmed' ? "default" : "outline"}>
                            {booking.status}
                          </Badge>
                          <Button variant="outline" size="sm">Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No bookings available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Client Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  No reviews available yet
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default VendorDashboard;