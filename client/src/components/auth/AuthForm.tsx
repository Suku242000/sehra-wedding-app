import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserRole, UserRoleType } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// Register form schema
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum([
    UserRole.BRIDE, 
    UserRole.GROOM, 
    UserRole.FAMILY, 
    UserRole.VENDOR
  ]),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthForm: React.FC = () => {
  const { login, register, loading, error, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('login');

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: UserRole.BRIDE,
    },
  });

  // Submit login form
  const onLoginSubmit = async (values: LoginFormValues) => {
    await login(values.email, values.password);
  };

  // Submit register form
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    await register(values.name, values.email, values.password, values.role as UserRoleType);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    clearError();
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
              Your complete Indian wedding management platform for every step of your special journey
            </motion.p>
          </div>
        </motion.div>
        
        {/* Right side (auth forms) */}
        <motion.div 
          className="w-full md:w-1/2 bg-white p-8 transition-all duration-500"
          variants={staggerContainer()}
          initial="hidden"
          animate="show"
        >
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className={activeTab === 'login' ? 'border-b-2 border-[#800000] text-[#800000]' : ''}>Login</TabsTrigger>
              <TabsTrigger value="register" className={activeTab === 'register' ? 'border-b-2 border-[#800000] text-[#800000]' : ''}>Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-0">
              <motion.div variants={fadeIn('up', 'tween', 0.2, 0.5)}>
                <h2 className="font-serif text-2xl mb-6 text-center">Welcome Back</h2>
                
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end mt-1">
                      <a href="#" className="text-xs text-[#800000] hover:text-[#FFD700] transition-colors">
                        Forgot password?
                      </a>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-[#800000] to-[#a52a2a] hover:from-[#5c0000] hover:to-[#800000] text-white"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Login
                    </Button>
                  </form>
                </Form>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="register" className="mt-0">
              <motion.div variants={fadeIn('up', 'tween', 0.2, 0.5)}>
                <h2 className="font-serif text-2xl mb-6 text-center">Create Your Account</h2>
                
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Full Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I am a:</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={UserRole.BRIDE}>Bride</SelectItem>
                              <SelectItem value={UserRole.GROOM}>Groom</SelectItem>
                              <SelectItem value={UserRole.FAMILY}>Family Member</SelectItem>
                              <SelectItem value={UserRole.VENDOR}>Vendor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-[#800000] to-[#a52a2a] hover:from-[#5c0000] hover:to-[#800000] text-white"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Register
                    </Button>
                  </form>
                </Form>
              </motion.div>
            </TabsContent>
          </Tabs>
          
          {/* Back to Home and Internal Staff Login Links */}
          <div className="text-center mt-8">
            <div className="mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm text-[#800000] hover:bg-[#800000]/10 flex items-center gap-1"
                onClick={() => window.location.href = '/'}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Home Page
              </Button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 mb-2">For Sehra Staff Only</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs border-[#800000] text-[#800000] hover:bg-[#800000]/10"
                onClick={() => window.location.href = '/internal-login'}
              >
                Internal Staff Portal
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthForm;
