import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  Heart, 
  Star, 
  Users, 
  Calendar, 
  DollarSign, 
  Check, 
  MapPin, 
  Phone, 
  Clock, 
  UserCheck,
  Gift,
  Palette,
  Camera,
  Utensils,
  Music,
  Mail
} from 'lucide-react';

// Import wedding images
import weddingLights from '@assets/55108fbd-fa8c-45c3-93c3-7db28631ff72_1744735052150.jpg';
import moroccanDecor from '@assets/Moroccan Arabian Nights Decor_1744735065406.jpg';
import pinkFlowerDecor from '@assets/Pink Flower Decor 🩷✨_1744735079925.jpg';
import traditionalWedding from '@assets/d5ee3a09-8df7-45ae-a484-2370559882e2_1744735071301.jpg';
import royalWedding from '@assets/e35ef38c-56f1-43a2-adde-9ea5aaf3c7f9_1744735060085.jpg';
import gardenWedding from '@assets/download_1744735076613.jpg';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  const goToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Features section content
  const features = [
    {
      icon: <Calendar className="h-10 w-10 text-[#800000]" />,
      title: 'End-to-End Planning',
      description: 'Comprehensive planning from engagement to reception, with every detail managed seamlessly'
    },
    {
      icon: <DollarSign className="h-10 w-10 text-[#800000]" />,
      title: 'Budget Calculator',
      description: 'Advanced tools to plan and track your expenses, helping you stay on budget without compromise'
    },
    {
      icon: <UserCheck className="h-10 w-10 text-[#800000]" />,
      title: 'Verified Vendors',
      description: 'Access to our curated network of verified wedding professionals and service providers'
    },
    {
      icon: <Users className="h-10 w-10 text-[#800000]" />,
      title: 'Personalized Support',
      description: 'Dedicated wedding supervisors available to guide you through every step of your journey'
    },
    {
      icon: <Clock className="h-10 w-10 text-[#800000]" />,
      title: 'Progress Tracker',
      description: 'Visual timeline and task management to ensure nothing is missed as you approach your big day'
    },
    {
      icon: <Gift className="h-10 w-10 text-[#800000]" />,
      title: 'Gift Registry',
      description: 'Create and manage your wedding registry with ease, sharing it with all your guests'
    }
  ];

  // Vendor categories
  const vendorCategories = [
    { icon: <Camera className="h-6 w-6" />, name: 'Photography' },
    { icon: <Palette className="h-6 w-6" />, name: 'Decoration' },
    { icon: <Utensils className="h-6 w-6" />, name: 'Catering' },
    { icon: <Music className="h-6 w-6" />, name: 'Music & DJ' }
  ];

  // Packages
  const packages = [
    {
      name: 'Silver',
      price: '₹10L - ₹30L',
      description: 'Perfect for couples looking for essential planning support',
      emoji: '💰',
      features: [
        'Guest Management (up to 200 guests)',
        'Task Tracking with Reminders',
        'Budget Management Tools',
        'Basic Vendor Recommendations',
        'Email Support'
      ],
      popular: false,
      color: 'bg-gray-50 border-gray-200'
    },
    {
      name: 'Gold',
      price: '₹31L - ₹60L',
      description: 'Our most popular package with enhanced features',
      emoji: '💰💰',
      features: [
        'All Silver Features',
        'Guest Management (up to 500 guests)',
        'Premium Vendor Network Access',
        'Dedicated Wedding Supervisor',
        'Custom Wedding Website',
        'Priority Email & Phone Support'
      ],
      popular: true,
      color: 'bg-yellow-50 border-[#FFD700]'
    },
    {
      name: 'Platinum',
      price: '₹61L - ₹1Cr+',
      description: 'The ultimate luxury wedding experience',
      emoji: '💰💰💰',
      features: [
        'All Gold Features',
        'Unlimited Guest Management',
        'Elite Venue Recommendations',
        'Full-Service Event Coordination',
        'Multiple Wedding Supervisors',
        'VIP Vendor Discounts',
        '24/7 Concierge Support'
      ],
      popular: false,
      color: 'bg-slate-50 border-slate-200'
    }
  ];

  // Decor Showcase data
  const decorStyles = [
    {
      id: 1,
      name: "Royal Mandap",
      image: royalWedding,
      description: "Elegant and opulent traditional mandap with rich fabrics and intricate detailing",
      features: ["Traditional Elegance", "Gold Accents", "Rich Fabrics", "Intricate Carvings"],
      popular: true
    },
    {
      id: 2,
      name: "Moroccan Nights",
      image: moroccanDecor,
      description: "Exotic and vibrant decor inspired by Moroccan architecture and patterns",
      features: ["Lanterns & Candles", "Jewel Tones", "Geometric Patterns", "Plush Seating"],
      popular: false
    },
    {
      id: 3,
      name: "Garden Romance",
      image: gardenWedding,
      description: "Fresh and natural setting with abundant floral arrangements and greenery",
      features: ["Fresh Flowers", "Natural Elements", "Soft Lighting", "Outdoor Setting"],
      popular: false
    },
    {
      id: 4,
      name: "Pastel Perfection",
      image: pinkFlowerDecor,
      description: "Soft and romantic ambiance with delicate pastel color palette and floral accents",
      features: ["Pastel Tones", "Crystal Elements", "Floating Candles", "Dreamy Fabric Drapes"],
      popular: true
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Priya & Rahul',
      role: 'Gold Package',
      content: 'Sehra made our wedding planning completely stress-free! The coordination with vendors and supervisor support was outstanding. We could actually enjoy our engagement period instead of drowning in wedding details.',
      image: null,
      rating: 5
    },
    {
      name: 'Ananya & Vikram',
      role: 'Platinum Package',
      content: 'Worth every rupee! Our supervisors handled everything perfectly, from venue coordination to the smallest decorative details. Our guests are still talking about how seamless and magical our wedding was.',
      image: null,
      rating: 5
    },
    {
      name: 'Meera & Arjun',
      role: 'Silver Package',
      content: 'Even with the basic package, Sehra provided excellent service. The task management system kept us on track throughout our planning journey, and we were able to stay perfectly within our budget!',
      image: null,
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen relative" style={{ 
      backgroundImage: `url(${traditionalWedding})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Semi-transparent overlay for better readability */}
      <div className="absolute inset-0 bg-white/75 z-0"></div>
      
      {/* Content container */}
      <div className="relative z-10">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative h-screen flex items-center">
          {/* Hero background with overlay */}
          <div className="absolute inset-0 bg-black/60 z-0"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center z-[-1]"
            style={{ backgroundImage: `url(${weddingLights})` }}
          ></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="bg-[#FFD700] text-[#800000] mb-4 py-1 px-4 text-sm font-medium">Premium Indian Wedding Management</Badge>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
                Your Wedding, <br /> 
                Our <span className="text-[#FFD700] font-script">Responsibility</span>
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                Experience the perfect blend of tradition and innovation with Sehra's 
                comprehensive wedding planning platform
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {isAuthenticated ? (
                  <>
                    <Button 
                      onClick={() => goToDashboard()} 
                      size="lg" 
                      className="bg-[#FFD700] text-[#800000] hover:bg-[#FFD700]/90 px-8 font-semibold"
                    >
                      Go to Dashboard
                    </Button>
                    <div className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-md border border-white/30 flex items-center">
                      <span className="mr-2">Welcome back,</span>
                      <span className="font-bold">{user?.name || 'User'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg" className="bg-[#FFD700] text-[#800000] hover:bg-[#FFD700]/90 px-8 font-semibold">
                      <Link href="/auth">Get Started</Link>
                    </Button>
                    <Button 
                      size="lg" 
                      className="bg-white text-[#800000] hover:bg-white/90 border-2 border-white px-8 font-semibold"
                      onClick={() => scrollToSection('packages')}
                    >
                      View Packages
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/75 to-transparent"></div>
        </section>

        {/* About Section */}
        <section className="py-20 md:py-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
              >
                <Badge className="bg-[#FFC0CB]/30 text-[#800000] mb-4">About Sehra</Badge>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#800000] mb-6">
                  Crafting Memorable Wedding Experiences
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  At Sehra, we understand that your wedding day is one of the most significant milestones in your life. 
                  Our mission is to transform your dreams into reality while preserving the rich cultural traditions 
                  that make Indian weddings truly special.
                </p>
                <p className="text-lg text-gray-700 mb-8">
                  We combine digital innovation with personalized support to create a seamless planning experience. 
                  From venue selection to guest management, our comprehensive platform ensures no detail is overlooked.
                </p>
                <div className="flex flex-wrap gap-3">
                  {vendorCategories.map((category, index) => (
                    <div 
                      key={index}
                      className="flex items-center bg-[#FFC0CB]/10 px-4 py-2 rounded-full text-[#800000]"
                    >
                      {category.icon}
                      <span className="ml-2 font-medium">{category.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className="relative"
              >
                <div className="relative mx-auto w-full max-w-md">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
                    <img 
                      src={moroccanDecor} 
                      alt="Elegant wedding decor" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-lg overflow-hidden shadow-xl hidden md:block">
                    <img 
                      src={pinkFlowerDecor} 
                      alt="Wedding flowers" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -right-5 -top-5 bg-[#800000] text-white p-4 rounded-lg shadow-lg z-10 hidden md:block">
                    <div className="text-2xl font-bold">800+</div>
                    <div className="text-sm">Weddings Planned</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="bg-[#FFD700]/30 text-[#800000] mb-4">Features</Badge>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#800000] mb-4">
                Comprehensive Wedding Planning Tools
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our suite of planning tools helps you manage every aspect of your special day,
                from guest lists to vendor coordination
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="h-full border border-[#FFD700]/20 hover:border-[#FFD700] transition-all duration-300 hover:shadow-lg">
                    <CardContent className="pt-6 h-full flex flex-col">
                      <div className="rounded-full w-20 h-20 bg-[#FFC0CB]/20 flex items-center justify-center mb-6 mx-auto">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-[#800000] mb-3 text-center">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-center flex-grow">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Decor Showcase Section */}
        <section id="decor-showcase" className="py-20 md:py-28 bg-[#FFFAF0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="bg-[#800000]/20 text-[#800000] mb-4">Decoration Styles</Badge>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#800000] mb-4">
                Exquisite Decor for Your Special Day
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Browse our stunning decor themes and find the perfect style to transform your wedding venue
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {decorStyles.map((style, index) => (
                <motion.div
                  key={style.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="relative h-[350px] overflow-hidden rounded-xl">
                    <img 
                      src={style.image} 
                      alt={style.name}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    
                    {style.popular && (
                      <div className="absolute top-4 right-4 bg-[#FFD700] text-[#800000] rounded-full px-3 py-1 text-xs font-semibold">
                        POPULAR CHOICE
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-serif font-bold mb-2">
                        {style.name}
                      </h3>
                      <p className="text-white/80 mb-4">
                        {style.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {style.features.map((feature, fIndex) => (
                          <span 
                            key={fIndex}
                            className="bg-white/20 backdrop-blur-sm text-white rounded-full px-3 py-1 text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-[#800000] hover:bg-[#800000]/90 text-white shadow-lg"
                      onClick={() => isAuthenticated ? goToDashboard() : window.location.href = '/auth'}
                    >
                      {isAuthenticated ? 'Add to My Wedding' : 'Get Started'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <Button
                variant="outline"
                size="lg"
                className="border-[#800000] text-[#800000] hover:bg-[#800000]/10"
                onClick={() => isAuthenticated ? goToDashboard() : window.location.href = '/auth'}
              >
                {isAuthenticated ? 'Explore More Styles in Dashboard' : 'View All Decoration Themes'}
              </Button>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section id="packages" className="py-20 md:py-28 bg-[#FFC0CB]/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="bg-[#800000] text-white mb-4">Pricing</Badge>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#800000] mb-4">
                Choose Your Perfect Package
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Select from our carefully crafted packages designed to suit different wedding needs and budgets
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="flex"
                >
                  <div className={`rounded-xl border ${pkg.color} p-8 relative flex flex-col w-full ${
                    pkg.popular ? 'transform md:scale-105 shadow-xl' : ''
                  }`}>
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#FFD700] text-[#800000] text-xs font-bold py-1 px-4 rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    <div className="text-center mb-8">
                      <div className="text-3xl mb-1">{pkg.emoji}</div>
                      <h3 className="font-serif text-2xl font-bold text-[#800000]">{pkg.name}</h3>
                      <div className="text-2xl font-bold mt-2">{pkg.price}</div>
                      <p className="text-gray-600 mt-2 text-sm">{pkg.description}</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-grow">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {isAuthenticated ? (
                      <Button 
                        onClick={() => goToDashboard()}
                        className={`w-full ${
                          pkg.popular 
                            ? 'bg-[#800000] hover:bg-[#800000]/90 text-white' 
                            : 'bg-white border-2 border-[#800000] text-[#800000] hover:bg-[#800000]/10'
                        }`}
                      >
                        Go to Dashboard
                      </Button>
                    ) : (
                      <Button asChild className={`w-full ${
                        pkg.popular 
                          ? 'bg-[#800000] hover:bg-[#800000]/90 text-white' 
                          : 'bg-white border-2 border-[#800000] text-[#800000] hover:bg-[#800000]/10'
                      }`}>
                        <Link href="/auth">Get Started</Link>
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="bg-[#FFC0CB]/30 text-[#800000] mb-4">Testimonials</Badge>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#800000] mb-4">
                From Happy Couples
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Hear from couples who created their dream weddings with Sehra
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="border border-[#FFD700]/20 hover:border-[#FFD700] transition-all duration-300 hover:shadow-lg h-full">
                    <CardContent className="pt-6 h-full flex flex-col">
                      <div className="flex justify-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < testimonial.rating ? 'text-[#FFD700] fill-[#FFD700]' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-6 text-center italic flex-grow">"{testimonial.content}"</p>
                      <div className="flex flex-col items-center mt-auto">
                        <div className="rounded-full w-16 h-16 bg-[#FFC0CB]/20 flex items-center justify-center mb-2">
                          <Heart className="h-8 w-8 text-[#800000]" />
                        </div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 md:py-28 bg-[#FFC0CB]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
              >
                <Badge className="bg-[#FFD700]/30 text-[#800000] mb-4">Contact Us</Badge>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#800000] mb-6">
                  Let's Start Planning Your Perfect Wedding
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                  Have questions about our services? Want to know more about how Sehra can help make your wedding dreams come true? 
                  Reach out to our team of wedding experts today.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="rounded-full w-12 h-12 bg-[#FFC0CB]/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <MapPin className="h-6 w-6 text-[#800000]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-[#800000]">Our Location</h3>
                      <p className="text-gray-600">123 Wedding Plaza, Mumbai, Maharashtra 400001</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="rounded-full w-12 h-12 bg-[#FFC0CB]/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <Mail className="h-6 w-6 text-[#800000]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-[#800000]">Email Us</h3>
                      <p className="text-gray-600">info@sehra.com</p>
                      <p className="text-gray-600">support@sehra.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="rounded-full w-12 h-12 bg-[#FFC0CB]/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <Phone className="h-6 w-6 text-[#800000]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-[#800000]">Call Us</h3>
                      <p className="text-gray-600">+91 9876 543 210</p>
                      <p className="text-gray-600">+91 9876 543 211</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
              >
                <div className="bg-white rounded-lg shadow-lg p-8 h-full">
                  <h3 className="text-2xl font-serif font-bold text-[#800000] mb-6">Send Us a Message</h3>
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                        placeholder="John & Jane Doe"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                        placeholder="johnjane@example.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                        placeholder="Tell us about your wedding plans and how we can help..."
                      />
                    </div>
                    
                    <Button className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white">
                      Send Message
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#800000] text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Sehra</h3>
                <p className="text-white/70 mb-6">
                  Making your dream wedding a reality with our comprehensive planning services and dedicated team of experts.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-white hover:text-[#FFD700] transition-colors">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-white hover:text-[#FFD700] transition-colors">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.808.06 1.064.05 1.79.218 2.427.465.66.254 1.216.598 1.772 1.153.555.556.9 1.113 1.154 1.772.247.637.415 1.363.465 2.427.047 1.024.058 1.379.058 3.808 0 2.43-.01 2.784-.058 3.808-.05 1.064-.218 1.79-.465 2.427a4.902 4.902 0 01-1.153 1.772c-.556.555-1.113.9-1.772 1.154-.637.247-1.363.415-2.427.465-1.024.047-1.379.058-3.808.058-2.43 0-2.784-.01-3.808-.058-1.064-.05-1.79-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.637-.415-1.363-.465-2.427-.047-1.024-.058-1.379-.058-3.808 0-2.43.01-2.784.058-3.808.05-1.064.218-1.79.465-2.427.254-.66.598-1.216 1.153-1.772.556-.555 1.113-.9 1.772-1.154.637-.247 1.363-.415 2.427-.465 1.024-.047 1.379-.058 3.808-.058zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-white hover:text-[#FFD700] transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors">Home</a></li>
                  <li><a href="#packages" className="text-white/70 hover:text-white transition-colors">Packages</a></li>
                  <li><a href="#testimonials" className="text-white/70 hover:text-white transition-colors">Testimonials</a></li>
                  <li><a href="#contact" className="text-white/70 hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Our Services</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors">Wedding Planning</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors">Vendor Management</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors">Budget Planning</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors">Guest Management</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors">Timeline Creation</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Subscribe</h3>
                <p className="text-white/70 mb-4">Subscribe to our newsletter for wedding planning tips and exclusive offers.</p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="px-4 py-2 w-full rounded-l-md focus:outline-none text-gray-800"
                  />
                  <button className="bg-[#800000] px-4 py-2 rounded-r-md hover:bg-[#800000]/90">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/60 text-sm">
              <p>&copy; {new Date().getFullYear()} Sehra Wedding Management. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;