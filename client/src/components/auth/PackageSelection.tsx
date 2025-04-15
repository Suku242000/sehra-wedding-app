import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { PackageTypeValue, PackageType } from '@shared/schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckIcon } from 'lucide-react';
import { PACKAGES } from '@/types';

const PackageSelection: React.FC = () => {
  const { selectPackage, loading, error } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<PackageTypeValue | null>(null);

  const handlePackageSelect = (packageType: PackageTypeValue) => {
    setSelectedPackage(packageType);
  };

  const handleContinue = async () => {
    if (selectedPackage) {
      await selectPackage(selectedPackage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-5xl flex flex-col md:flex-row overflow-hidden rounded-xl shadow-2xl">
        {/* Left side (decorative) */}
        <motion.div 
          className="w-full md:w-1/2 bg-cover bg-center min-h-[300px] md:min-h-[600px] relative overflow-hidden" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=1471&auto=format&fit=crop')" }}
          variants={fadeIn('right', 'tween', 0.2, 1)}
          initial="hidden"
          animate="show"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#800000]/70 to-[#FFD700]/30"></div>
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
            <motion.h1 
              className="font-serif text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg"
              variants={fadeIn('up', 'tween', 0.3, 0.8)}
            >
              Sehra
            </motion.h1>
            <motion.p 
              className="font-serif italic text-xl md:text-2xl drop-shadow-md"
              variants={fadeIn('up', 'tween', 0.4, 0.8)}
            >
              Creating unforgettable wedding memories
            </motion.p>
            <motion.div 
              className="h-[2px] my-4 w-2/3 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"
              variants={fadeIn('up', 'tween', 0.5, 0.8)}
            ></motion.div>
            <motion.p 
              className="text-sm md:text-base max-w-xs"
              variants={fadeIn('up', 'tween', 0.6, 0.8)}
            >
              Choose the perfect package for your special day
            </motion.p>
          </div>
        </motion.div>
        
        {/* Right side (package selection) */}
        <motion.div 
          className="w-full md:w-1/2 bg-white p-8 transition-all duration-500"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeIn('up', 'tween', 0.2, 0.5)}>
            <h2 className="font-serif text-2xl mb-6 text-center">Select Your Package</h2>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(PACKAGES).map(([key, packageInfo]) => (
                <motion.div
                  key={key}
                  className={`
                    ${selectedPackage === key ? 'border-2 border-[#FFD700] scale-105 shadow-lg' : 'border border-gray-200 hover:border-[#FFD700]'}
                    rounded-lg p-4 text-center cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]
                    relative
                  `}
                  onClick={() => handlePackageSelect(key as PackageTypeValue)}
                  whileHover={{ scale: 1.03 }}
                >
                  {packageInfo.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#FFD700] text-[#800000] text-xs font-bold py-1 px-3 rounded-full">
                      POPULAR
                    </div>
                  )}
                  <div className="text-gray-500 mb-2">
                    {key === PackageType.SILVER ? 'Basic' : key === PackageType.GOLD ? 'Premium' : 'Luxury'}
                  </div>
                  <h3 className="font-serif text-xl mb-1">{packageInfo.name}</h3>
                  <div className="text-[#800000] font-bold mb-3">{packageInfo.price}</div>
                  <ul className="text-sm text-left">
                    {packageInfo.features.map((feature, index) => (
                      <li key={index} className="mb-1 flex items-start">
                        <span className="text-green-500 mt-0.5 mr-1">
                          <CheckIcon className="h-4 w-4" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
            
            <Button 
              onClick={handleContinue} 
              className="w-full bg-gradient-to-r from-[#800000] to-[#a52a2a] hover:from-[#5c0000] hover:to-[#800000] text-white"
              disabled={loading || !selectedPackage}
            >
              {loading ? "Processing..." : "Continue"}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PackageSelection;
