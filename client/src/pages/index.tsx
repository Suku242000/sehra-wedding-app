import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { Heart, Star, Users, Calendar, DollarSign, Sparkles, Check } from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-[#800000]" />,
      title: 'Comprehensive Planning',
      description: 'From venue selection to menu planning, manage every aspect of your wedding in one place'
    },
    {
      icon: <Users className="h-8 w-8 text-[#800000]" />,
      title: 'Guest Management',
      description: 'Track RSVPs, manage seating arrangements, and maintain your guest list effortlessly'
    },
    {
      icon: <DollarSign className="h-8 w-8 text-[#800000]" />,
      title: 'Budget Tracking',
      description: 'Set your budget, track expenses, and ensure you stay within your financial plan'
    },
    {
      icon: <Sparkles className="h-8 w-8 text-[#800000]" />,
      title: 'Premium Vendors',
      description: 'Connect with our curated list of trusted vendors for all your wedding needs'
    }
  ];

  const packages = [
    {
      name: 'Silver',
      price: '₹25,000',
      features: ['Guest Management', 'Task Tracking', 'Budget Basics'],
      popular: false,
      color: 'bg-gray-50 border-gray-200'
    },
    {
      name: 'Gold',
      price: '₹65,000',
      features: ['All Silver Features', 'Premium Vendor Access', 'Dedicated Supervisor'],
      popular: true,
      color: 'bg-yellow-50 border-[#FFD700]'
    },
    {
      name: 'Platinum',
      price: '₹125,000',
      features: ['All Gold Features', 'Elite Venue Options', 'Full Event Coordination'],
      popular: false,
      color: 'bg-slate-50 border-slate-200'
    }
  ];

  const testimonials = [
    {
      name: 'Priya & Rahul',
      role: 'Gold Package',
      content: 'Sehra made our wedding planning stress-free! The coordination with vendors and supervisor support was outstanding.',
      image: null,
      rating: 5
    },
    {
      name: 'Ananya & Vikram',
      role: 'Platinum Package',
      content: 'The platinum package was worth every rupee. Our supervisor handled everything perfectly, from venue coordination to the smallest decorative details.',
      image: null,
      rating: 5
    },
    {
      name: 'Meera & Arjun',
      role: 'Silver Package',
      content: 'Even with the basic package, Sehra provided excellent service. The task management system kept us on track throughout our planning journey.',
      image: null,
      rating: 4
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-cover bg-center py-20 md:py-32" style={{ backgroundImage: "linear-gradient(to right, rgba(128, 0, 0, 0.9), rgba(128, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1617789160764-b8620252c6e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center"
            variants={fadeIn('up', 'tween', 0.2, 0.7)}
            initial="hidden"
            animate="show"
          >
            <Badge className="bg-[#FFD700] text-[#800000] mb-4">Indian Wedding Management</Badge>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Plan Your Perfect <br /> Wedding with <span className="text-[#FFD700] font-script">Sehra</span></h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Your complete wedding management platform for an unforgettable Indian wedding celebration
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-[#FFD700] text-[#800000] hover:bg-[#FFD700]/90">
                <Link href="/auth">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="#packages">View Packages</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F5F5F5] to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            variants={fadeIn('up', 'tween', 0.2, 0.7)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#800000] mb-4">Wedding Planning Made Simple</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive suite of planning tools helps you manage every aspect of your special day
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={fadeIn('up', 'tween', 0.4, 0.7)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {features.map((feature, index) => (
              <Card key={index} className="border border-[#FFD700]/20 hover:border-[#FFD700] transition-all duration-300 hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="rounded-full w-16 h-16 bg-[#FFC0CB]/20 flex items-center justify-center mb-4 mx-auto">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#800000] mb-2 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-16 md:py-24 bg-[#FFC0CB]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            variants={fadeIn('up', 'tween', 0.2, 0.7)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#800000] mb-4">Choose Your Perfect Package</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Select from our carefully crafted packages designed to suit different wedding needs and budgets
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={fadeIn('up', 'tween', 0.4, 0.7)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                className={`rounded-lg border ${pkg.color} p-8 relative ${pkg.popular ? 'transform md:scale-105 shadow-lg' : ''}`}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#FFD700] text-[#800000] text-xs font-bold py-1 px-3 rounded-full">
                    POPULAR
                  </div>
                )}
                <div className="text-gray-500 mb-2 text-center">{index === 0 ? 'Basic' : index === 1 ? 'Premium' : 'Luxury'}</div>
                <h3 className="font-serif text-2xl mb-2 text-center font-bold text-[#800000]">{pkg.name}</h3>
                <div className="text-2xl font-bold text-center mb-6">{pkg.price}</div>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-gradient-to-r from-[#800000] to-[#a52a2a] hover:from-[#5c0000] hover:to-[#800000] text-white">
                  <Link href="/auth">Get Started</Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            variants={fadeIn('up', 'tween', 0.2, 0.7)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#800000] mb-4">Happy Couples</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Read about the wonderful experiences of couples who planned their wedding with Sehra
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={fadeIn('up', 'tween', 0.4, 0.7)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border border-[#FFD700]/20 hover:border-[#FFD700] transition-all duration-300 hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-[#FFD700] fill-[#FFD700]' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 text-center italic">"{testimonial.content}"</p>
                  <div className="flex flex-col items-center">
                    <div className="rounded-full w-16 h-16 bg-[#FFC0CB]/20 flex items-center justify-center mb-2">
                      <Heart className="h-8 w-8 text-[#800000]" />
                    </div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#800000] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeIn('up', 'tween', 0.2, 0.7)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready to Begin Your Wedding Journey?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join Sehra today and take the first step towards your dream wedding
            </p>
            <Button asChild size="lg" className="bg-[#FFD700] text-[#800000] hover:bg-[#FFD700]/90">
              <Link href="/auth">Create Your Account</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C2C2C] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[#800000] font-script text-xl">S</span>
                </div>
                <span className="ml-2 font-serif text-xl text-[#FFD700]">Sehra</span>
              </div>
              <p className="text-white/80 text-sm">Your complete Indian wedding management platform for every step of your special journey</p>
            </div>
            
            <div>
              <h3 className="text-[#FFD700] font-medium mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/auth">
                    <a className="text-white/80 hover:text-[#FFD700] transition-colors">Sign Up</a>
                  </Link>
                </li>
                <li>
                  <Link href="#packages">
                    <a className="text-white/80 hover:text-[#FFD700] transition-colors">Packages</a>
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">Features</a>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">Testimonials</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-[#FFD700] font-medium mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">Terms of Service</a>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">Cookie Policy</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-[#FFD700] font-medium mb-3">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  <a href="mailto:info@sehra.com" className="hover:text-[#FFD700]">info@sehra.com</a>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                  </svg>
                  <a href="tel:+919876543210" className="hover:text-[#FFD700]">+91 9876 543 210</a>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                  </svg>
                  Delhi, Mumbai, Bangalore
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-white/60 text-sm">
            &copy; {new Date().getFullYear()} Sehra Wedding Management. All rights reserved.
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default HomePage;
