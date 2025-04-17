import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth, updateWithAuth } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Check,
  CreditCard,
  Diamond,
  Lock,
  RefreshCw, 
  Sparkles,
  Star
} from 'lucide-react';

// Define package types and prices
const PACKAGES = {
  SILVER: {
    name: 'Silver',
    range: '₹10L - ₹30L',
    price: 0, // Free tier
    features: [
      'Basic task management',
      'Budget tracking',
      'Guest list management',
      'Vendor booking',
      'Email support'
    ],
    icon: <Star className="h-8 w-8 text-gray-400" />
  },
  GOLD: {
    name: 'Gold',
    range: '₹31L - ₹60L',
    price: 999, // ₹999
    features: [
      'Advanced task management',
      'Detailed budget analytics',
      'RSVP management',
      'Priority vendor booking',
      'Seating arrangements',
      'Chat support',
      'Timeline planning'
    ],
    icon: <Sparkles className="h-8 w-8 text-amber-400" />
  },
  PLATINUM: {
    name: 'Platinum',
    range: '₹61L - ₹1Cr+',
    price: 2999, // ₹2,999
    features: [
      'Premium task management',
      'Real-time budget tracking',
      'VIP guest management',
      'Priority vendor access',
      'Advanced seating arrangements',
      'Dedicated support team',
      'Comprehensive timeline planning',
      'Custom wedding website',
      'Professional wedding checklist',
      'Exclusive vendor discounts'
    ],
    icon: <Diamond className="h-8 w-8 text-purple-400" />
  }
};

// Format currency in Indian Rupees
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const PackageUpgrade: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: ''
  });
  const [upiId, setUpiId] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch user's current package
  const { data: userPackage, isLoading } = useQuery({
    queryKey: ['/api/users/package'],
    queryFn: () => fetchWithAuth('/api/users/package'),
    enabled: !!user,
  });

  // Handle package upgrade
  const upgradeMutation = useMutation({
    mutationFn: (packageType: string) => 
      updateWithAuth('/api/users/package', { package: packageType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/package'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      
      // Reset states after successful payment
      setPaymentSuccess(true);
      setIsProcessing(false);
      
      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setPaymentSuccess(false);
        setCurrentStep(1);
        
        toast({
          title: "Package Upgraded Successfully",
          description: `Your account has been upgraded to ${selectedPackage} package.`,
        });
      }, 2000);
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      toast({
        title: "Upgrade Failed",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive"
      });
    }
  });

  // Handle payment submission
  const handlePaymentSubmit = () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Process payment and upgrade package
      upgradeMutation.mutate(selectedPackage);
    }, 2000);
  };

  // Get current package details
  const getCurrentPackageDetails = () => {
    if (isLoading || !userPackage) return PACKAGES.SILVER;
    
    const packageName = userPackage.package || 'SILVER';
    return PACKAGES[packageName as keyof typeof PACKAGES] || PACKAGES.SILVER;
  };

  // Check if package is available for upgrade
  const isPackageAvailable = (packageName: string) => {
    if (isLoading || !userPackage) return true;
    
    const currentPackage = userPackage.package || 'SILVER';
    
    // If user is on SILVER, both GOLD and PLATINUM are available
    if (currentPackage === 'SILVER') {
      return packageName !== 'SILVER';
    }
    
    // If user is on GOLD, only PLATINUM is available
    if (currentPackage === 'GOLD') {
      return packageName === 'PLATINUM';
    }
    
    // If user is already on PLATINUM, no upgrades available
    return false;
  };

  const renderPackageCard = (packageKey: keyof typeof PACKAGES) => {
    const packageInfo = PACKAGES[packageKey];
    const isCurrentPackage = userPackage?.package === packageKey;
    const isAvailable = isPackageAvailable(packageKey);
    
    return (
      <Card className={`relative overflow-hidden border-2 ${
        isCurrentPackage 
          ? 'border-[#800000] bg-[#fff8f8]' 
          : isAvailable 
            ? 'border-gray-200 hover:border-[#800000] transition-all'
            : 'border-gray-200 opacity-75'
      }`}>
        {isCurrentPackage && (
          <div className="absolute top-0 right-0 bg-[#800000] text-white px-3 py-1 text-xs font-semibold">
            CURRENT PLAN
          </div>
        )}
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">{packageInfo.name}</CardTitle>
              <CardDescription>Budget range: {packageInfo.range}</CardDescription>
            </div>
            <div className="bg-gray-100 p-2 rounded-full">
              {packageInfo.icon}
            </div>
          </div>
          <div className="mt-4">
            {packageInfo.price === 0 ? (
              <div className="text-3xl font-bold">Free</div>
            ) : (
              <div>
                <span className="text-3xl font-bold">₹{packageInfo.price}</span>
                <span className="text-gray-500 ml-1">one-time</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {packageInfo.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          {isCurrentPackage ? (
            <Button className="w-full bg-[#800000] hover:bg-[#5c0000]" disabled>
              Current Package
            </Button>
          ) : isAvailable ? (
            <Button 
              className="w-full bg-[#800000] hover:bg-[#5c0000]"
              onClick={() => {
                setSelectedPackage(packageKey);
                setIsPaymentModalOpen(true);
              }}
            >
              Upgrade Now
            </Button>
          ) : (
            <Button className="w-full" disabled>
              <Lock className="h-4 w-4 mr-2" /> Not Available
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  const renderPaymentStep = () => {
    if (!selectedPackage) return null;
    
    const packageInfo = PACKAGES[selectedPackage as keyof typeof PACKAGES];
    
    // If the package is free, skip payment
    if (packageInfo.price === 0) {
      return (
        <div className="text-center py-6">
          <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Payment Required</h3>
          <p className="text-gray-600 mb-4">The Silver package is completely free!</p>
          <Button 
            onClick={() => handlePaymentSubmit()}
            className="bg-[#800000] hover:bg-[#5c0000]"
          >
            Confirm Upgrade
          </Button>
        </div>
      );
    }
    
    if (currentStep === 1) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Select Payment Method</h3>
          <RadioGroup defaultValue="card" value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex-1 cursor-pointer">Credit/Debit Card</Label>
              <div className="flex items-center space-x-1">
                <div className="h-6 w-10 bg-blue-500 rounded"></div>
                <div className="h-6 w-10 bg-red-500 rounded"></div>
                <div className="h-6 w-10 bg-green-500 rounded"></div>
              </div>
            </div>
            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi" className="flex-1 cursor-pointer">UPI</Label>
              <div className="h-6 w-10 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">UPI</div>
            </div>
          </RadioGroup>
          <div className="pt-4">
            <Button 
              onClick={() => setCurrentStep(2)} 
              className="w-full bg-[#800000] hover:bg-[#5c0000]"
            >
              Continue
            </Button>
          </div>
        </div>
      );
    }
    
    if (currentStep === 2) {
      if (paymentMethod === 'card') {
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enter Card Details</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Name on Card</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="number">Card Number</Label>
                <Input 
                  id="number" 
                  placeholder="4242 4242 4242 4242" 
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input 
                    id="expiry" 
                    placeholder="MM/YY" 
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input 
                    id="cvc" 
                    placeholder="123" 
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handlePaymentSubmit} 
                className="flex-1 bg-[#800000] hover:bg-[#5c0000]"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>Pay {formatCurrency(packageInfo.price)}</>
                )}
              </Button>
            </div>
          </div>
        );
      }
      
      if (paymentMethod === 'upi') {
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pay via UPI</h3>
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input 
                id="upiId" 
                placeholder="yourname@upi" 
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Enter your UPI ID (e.g., name@okicici, name@paytm)</p>
            </div>
            <div className="pt-4 flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handlePaymentSubmit} 
                className="flex-1 bg-[#800000] hover:bg-[#5c0000]"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>Pay {formatCurrency(packageInfo.price)}</>
                )}
              </Button>
            </div>
          </div>
        );
      }
    }
    
    return null;
  };

  return (
    <Layout>
      <motion.div
        variants={fadeIn('up', 'tween', 0.1, 0.8)}
        initial="hidden"
        animate="show"
        className="container mx-auto px-4 py-12"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#800000] mb-2">
            Upgrade Your Wedding Planning Experience
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose the right package for your wedding budget and unlock premium features
            to make your special day even more magical.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {renderPackageCard('SILVER')}
          {renderPackageCard('GOLD')}
          {renderPackageCard('PLATINUM')}
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-16">
          <h2 className="text-2xl font-bold text-[#800000] mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What's included in each package?</AccordionTrigger>
              <AccordionContent>
                Each package offers different features to help with your wedding planning. 
                The Silver package is our basic tier with essential planning tools. 
                Gold adds more advanced features like detailed analytics and priority support. 
                Platinum is our premium offering with all features unlocked, plus exclusive benefits and vendor discounts.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I upgrade my package later?</AccordionTrigger>
              <AccordionContent>
                Yes, you can upgrade your package at any time. Your new features will be available immediately after payment is processed.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Are the payments secure?</AccordionTrigger>
              <AccordionContent>
                Yes, all payments are processed securely. We use industry-standard encryption to protect your payment information.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I get a refund if I'm not satisfied?</AccordionTrigger>
              <AccordionContent>
                We offer a 7-day money-back guarantee for all package upgrades. If you're not satisfied with your upgrade, 
                contact our support team within 7 days of purchase for a full refund.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How is the budget range determined?</AccordionTrigger>
              <AccordionContent>
                The budget ranges for each package are based on typical wedding budgets in India. 
                Silver covers weddings with budgets from ₹10 lakhs to ₹30 lakhs, Gold from ₹31 lakhs to ₹60 lakhs, and Platinum for weddings with budgets above ₹61 lakhs.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {/* Payment Modal */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {paymentSuccess ? "Payment Successful" : "Upgrade to " + (selectedPackage ? PACKAGES[selectedPackage as keyof typeof PACKAGES].name : "") + " Package"}
              </DialogTitle>
              <DialogDescription>
                {paymentSuccess 
                  ? "Your package has been upgraded successfully." 
                  : "Complete your payment to upgrade your wedding planning experience."}
              </DialogDescription>
            </DialogHeader>
            
            {paymentSuccess ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                <p className="text-center text-gray-600">
                  Your package has been upgraded successfully. Enjoy your new features!
                </p>
              </div>
            ) : (
              <div>
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="flex justify-between mb-1">
                    <span>Package:</span>
                    <span className="font-medium">{selectedPackage ? PACKAGES[selectedPackage as keyof typeof PACKAGES].name : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">
                      {selectedPackage 
                        ? (PACKAGES[selectedPackage as keyof typeof PACKAGES].price === 0 
                          ? "Free" 
                          : formatCurrency(PACKAGES[selectedPackage as keyof typeof PACKAGES].price))
                        : ""}
                    </span>
                  </div>
                </div>
                
                {renderPaymentStep()}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </Layout>
  );
};

export default PackageUpgrade;