import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, CrownIcon, StarIcon, SparklesIcon } from 'lucide-react';
import { PackageType, type PackageTypeValue } from '@shared/schema';

interface PackageCardProps {
  title: string;
  icon: React.ReactNode;
  badge: React.ReactNode;
  description: string;
  price: string;
  moneyIcon?: string;
  features: string[];
  accentColor: string;
  selected: boolean;
  onSelect: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({
  title,
  icon,
  badge,
  description,
  price,
  moneyIcon = '💰',
  features,
  accentColor,
  selected,
  onSelect,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className={`relative h-full overflow-hidden transition-all duration-300 ${
          selected ? `border-2 shadow-lg` : 'border border-gray-200'
        } ${selected ? `border-${accentColor}` : ''}`}
      >
        {selected && (
          <div className={`absolute top-0 right-0 p-2 text-white rounded-bl-lg ${accentColor === 'indigo-600' ? 'bg-indigo-600' : accentColor === 'amber-600' ? 'bg-amber-600' : 'bg-rose-600'}`}>
            <CheckIcon className="h-4 w-4" />
          </div>
        )}
        <div
          className={`absolute top-0 left-0 w-full h-2 ${accentColor === 'indigo-600' ? 'bg-indigo-600' : accentColor === 'amber-600' ? 'bg-amber-600' : 'bg-rose-600'}`}
        />
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            {badge}
            {icon}
          </div>
          <CardTitle className={`text-xl font-serif ${accentColor === 'indigo-600' ? 'text-indigo-600' : accentColor === 'amber-600' ? 'text-amber-600' : 'text-rose-600'}`}>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-gray-500">Budget Range</p>
            <p className="text-2xl font-bold flex items-center">
              <span className="mr-2">{moneyIcon}</span> 
              {price}
            </p>
          </div>
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start"
              >
                <CheckIcon className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${accentColor === 'indigo-600' ? 'text-indigo-600' : accentColor === 'amber-600' ? 'text-amber-600' : 'text-rose-600'}`} />
                <span className="text-sm">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            onClick={onSelect}
            className={`w-full ${
              selected
                ? `${accentColor === 'indigo-600' ? 'bg-indigo-600 hover:bg-indigo-700' : accentColor === 'amber-600' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'}`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            variant={selected ? 'default' : 'outline'}
          >
            {selected ? 'Selected' : 'Choose Plan'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const SelectPackagePage: React.FC = () => {
  const { user, selectPackage } = useAuth();
  const [selectedPackage, setSelectedPackage] = React.useState<string | null>(
    user?.package || null
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSelectPackage = async () => {
    if (!selectedPackage) {
      toast({
        title: 'Please select a package',
        description: 'You need to select a package to continue',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await selectPackage(selectedPackage as PackageTypeValue);
      
      const packageDisplayName = selectedPackage.charAt(0).toUpperCase() + selectedPackage.slice(1);
      
      toast({
        title: `You've selected the ${packageDisplayName} Plan!`,
        description: "Let's create magic for your special day!",
        variant: 'default',
      });
      
      setLocation('/dashboard');
    } catch (error) {
      console.error("Package selection error:", error);
      toast({
        title: 'Error',
        description: 'Failed to select package. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Define package details
  const packages = [
    {
      id: PackageType.SILVER,
      title: 'Silver',
      badge: <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">Basic</Badge>,
      icon: <StarIcon className="h-6 w-6 text-indigo-600" />,
      description: 'Perfect for local or nearby city weddings',
      price: '₹10L - ₹30L',
      moneyIcon: '💰',
      accentColor: 'indigo-600',
      features: [
        'Guest Management',
        'Task Tracking',
        'Budget Basics',
        'Basic Support',
        'Simple Timeline'
      ],
    },
    {
      id: PackageType.GOLD,
      title: 'Gold',
      badge: <Badge className="bg-amber-100 text-amber-800 border-amber-300">Premium</Badge>,
      icon: <SparklesIcon className="h-6 w-6 text-amber-600" />,
      description: 'Ideal for inter-city upscale weddings',
      price: '₹31L - ₹60L',
      moneyIcon: '💰💰',
      accentColor: 'amber-600',
      features: [
        'All Silver Features',
        'Premium Vendor Access',
        'Dedicated Supervisor',
        'Priority Support',
        'Enhanced Planning Tools'
      ],
    },
    {
      id: PackageType.PLATINUM,
      title: 'Platinum',
      badge: <Badge className="bg-rose-100 text-rose-800 border-rose-300">Luxury</Badge>,
      icon: <CrownIcon className="h-6 w-6 text-rose-600" />,
      description: 'For destination & luxury weddings',
      price: '₹61L - ₹1Cr+',
      moneyIcon: '💰💰💰',
      accentColor: 'rose-600',
      features: [
        'All Gold Features',
        'Elite Venue Options',
        'Full Event Coordination',
        'VIP Concierge Service',
        'Premium Vendor Network'
      ],
    },
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-serif font-bold mb-4 text-rose-700"
          >
            Your Dream Wedding Awaits
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-700 max-w-2xl mx-auto text-lg"
          >
            Choose the perfect package that complements your celebration.
            Each option is tailored to create unforgettable moments on your special day.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-rose-600 mt-2 text-sm font-medium"
          >
            You can always upgrade your package later as your wedding plans evolve.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              title={pkg.title}
              badge={pkg.badge}
              icon={pkg.icon}
              description={pkg.description}
              price={pkg.price}
              features={pkg.features}
              accentColor={pkg.accentColor}
              selected={selectedPackage === pkg.id}
              onSelect={() => setSelectedPackage(pkg.id)}
            />
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleSelectPackage}
            disabled={isLoading || !selectedPackage}
            className="px-10 py-6 text-lg bg-rose-600 hover:bg-rose-700 text-white shadow-lg"
          >
            {isLoading ? 'Processing...' : 'Confirm Package Selection'}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center border-t border-gray-200 pt-8"
        >
          <p className="text-gray-600 font-medium mb-2">
            Need help deciding which package is right for you?
          </p>
          <p className="text-gray-500 text-sm">
            Our wedding consultants are here to assist you at{' '}
            <span className="text-rose-600 font-semibold">support@sehra.com</span>
          </p>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default SelectPackagePage;