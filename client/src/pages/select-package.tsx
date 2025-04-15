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
import { PackageType, PackageTypeValue } from '@shared/schema';

interface PackageCardProps {
  title: string;
  icon: React.ReactNode;
  badge: React.ReactNode;
  description: string;
  price: string;
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
          selected ? `border-2 border-${accentColor} shadow-lg` : 'border border-gray-200'
        }`}
      >
        {selected && (
          <div className={`absolute top-0 right-0 p-2 bg-${accentColor} text-white rounded-bl-lg`}>
            <CheckIcon className="h-4 w-4" />
          </div>
        )}
        <div
          className={`absolute top-0 left-0 w-full h-2 bg-${accentColor}`}
        />
        <CardHeader className={`text-${accentColor}`}>
          <div className="flex justify-between items-center mb-2">
            {badge}
            {icon}
          </div>
          <CardTitle className="text-xl font-serif">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-gray-500">Budget Range</p>
            <p className="text-2xl font-bold">{price}</p>
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
                <CheckIcon className={`h-5 w-5 mr-2 text-${accentColor} mt-0.5 flex-shrink-0`} />
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
                ? `bg-${accentColor} hover:bg-${accentColor}/90`
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
      badge: <Badge variant="outline" className="bg-pink-50">Essential</Badge>,
      icon: <StarIcon className="h-6 w-6 text-pink-400" />,
      description: 'Perfect for local or nearby city weddings',
      price: '₹10L - ₹30L',
      accentColor: 'pink-400',
      features: [
        'Venue coordination',
        '2 vendors (basic)',
        'Guest list manager',
        'Task checklist',
        'Basic support'
      ],
    },
    {
      id: PackageType.GOLD,
      title: 'Gold',
      badge: <Badge variant="outline" className="bg-amber-50">Premium</Badge>,
      icon: <SparklesIcon className="h-6 w-6 text-amber-400" />,
      description: 'Ideal for inter-city upscale weddings',
      price: '₹31L - ₹60L',
      accentColor: 'amber-400',
      features: [
        'All Silver features',
        'Makeup & stylist coordination',
        '4 vendor connections',
        'Budget calculator',
        'Supervisor allocation',
        'Priority support'
      ],
    },
    {
      id: PackageType.PLATINUM,
      title: 'Platinum',
      badge: <Badge variant="outline" className="bg-red-50">Luxury</Badge>,
      icon: <CrownIcon className="h-6 w-6 text-red-600" />,
      description: 'For destination & luxury weddings',
      price: '₹61L - ₹1Cr+',
      accentColor: 'red-600',
      features: [
        'All Gold features',
        'Pre-wedding shoot',
        '6+ premium vendors',
        'Hotel booking assistance',
        'Travel coordination',
        'Live concierge',
        'VIP support 24/7'
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
            className="text-3xl font-serif font-bold mb-4"
          >
            Choose Your Wedding Package
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Select the perfect package that suits your wedding dreams and budget.
            You can always upgrade later if your needs change.
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
            className="px-8 py-6 text-lg"
          >
            {isLoading ? 'Processing...' : 'Confirm Package Selection'}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>
            Need help deciding? Contact our wedding consultants at{' '}
            <span className="text-pink-500">support@sehra.com</span>
          </p>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default SelectPackagePage;