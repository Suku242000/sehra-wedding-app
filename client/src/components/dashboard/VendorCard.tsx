import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { VendorProfile } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
  Home,
  Camera,
  Video,
  Utensils,
  Wand2,
  Scissors,
  Sparkles,
  Hand,
  Music,
  Lightbulb,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VendorCardProps {
  limit?: number;
}

const VendorCard: React.FC<VendorCardProps> = ({ limit = 3 }) => {
  // Fetch bookings
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['/api/bookings'],
  });
  
  // Fetch vendor profiles
  const { data: vendors = [], isLoading: isLoadingVendors } = useQuery({
    queryKey: ['/api/vendors'],
  });
  
  // Map vendor types to icons
  const getVendorIcon = (vendorType: string) => {
    switch (vendorType) {
      case 'hotel':
        return <Home className="w-5 h-5" />;
      case 'photographer':
        return <Camera className="w-5 h-5" />;
      case 'videographer':
        return <Video className="w-5 h-5" />;
      case 'catering':
        return <Utensils className="w-5 h-5" />;
      case 'makeup':
        return <Wand2 className="w-5 h-5" />;
      case 'hairdresser':
        return <Scissors className="w-5 h-5" />;
      case 'decoration':
        return <Sparkles className="w-5 h-5" />;
      case 'mehandi':
        return <Hand className="w-5 h-5" />;
      case 'dj':
        return <Music className="w-5 h-5" />;
      case 'lighting':
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };
  
  // Helper to get vendor name by vendor ID
  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find((v: VendorProfile) => v.id === vendorId);
    return vendor ? vendor.businessName : 'Unknown Vendor';
  };
  
  // Get vendor type display name
  const getVendorTypeDisplay = (vendorType: string) => {
    switch (vendorType) {
      case 'hotel':
        return 'Venue & Catering';
      case 'photographer':
        return 'Photography';
      case 'videographer':
        return 'Videography';
      case 'catering':
        return 'Catering';
      case 'makeup':
        return 'Makeup Artist';
      case 'hairdresser':
        return 'Hairdresser';
      case 'decoration':
        return 'Decoration';
      case 'mehandi':
        return 'Mehandi';
      case 'dj':
        return 'DJ & Music';
      case 'lighting':
        return 'Lighting';
      default:
        return vendorType.charAt(0).toUpperCase() + vendorType.slice(1);
    }
  };
  
  // Filter vendors based on booking status
  const bookedVendors = vendors.filter((vendor: VendorProfile) => 
    bookings.some((booking: any) => booking.vendorId === vendor.id && booking.status === 'confirmed')
  );
  
  const pendingVendors = vendors.filter((vendor: VendorProfile) => 
    bookings.some((booking: any) => booking.vendorId === vendor.id && booking.status === 'pending')
  );
  
  // Combine and limit
  const limitedVendors = [...bookedVendors, ...pendingVendors].slice(0, limit);
  
  // Get booking status for a vendor
  const getBookingStatus = (vendorId: number) => {
    const booking = bookings.find((b: any) => b.vendorId === vendorId);
    return booking ? booking.status : null;
  };
  
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden"
      variants={fadeIn('up', 'tween', 0.6, 0.5)}
      initial="hidden"
      animate="show"
    >
      <div className="bg-[#800000] py-3 px-4 border-b border-[#5c0000]">
        <h2 className="text-white font-medium">Your Vendors</h2>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {isLoadingVendors || isLoadingBookings ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-3 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : limitedVendors.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No vendors booked yet. Find and book vendors to make your wedding spectacular!</p>
            </div>
          ) : (
            limitedVendors.map((vendor: VendorProfile) => {
              const status = getBookingStatus(vendor.id);
              
              return (
                <motion.div 
                  key={vendor.id}
                  className="border border-gray-100 rounded-lg p-3 flex items-center"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#FFC0CB]/20 flex items-center justify-center text-[#800000]">
                    {getVendorIcon(vendor.vendorType)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="font-medium">{vendor.businessName}</div>
                    <div className="text-xs text-gray-500">{getVendorTypeDisplay(vendor.vendorType)}</div>
                  </div>
                  <div className="flex-shrink-0">
                    {status === 'confirmed' ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>
                    ) : status === 'pending' ? (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
                    ) : null}
                  </div>
                </motion.div>
              );
            })
          )}
          
          <Button 
            asChild 
            className="mt-2 w-full text-[#800000] border border-[#800000] rounded-md py-2 text-sm hover:bg-[#800000] hover:text-white transition-colors"
            variant="outline"
          >
            <Link href="/dashboard?tab=vendors">
              Find More Vendors
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default VendorCard;
