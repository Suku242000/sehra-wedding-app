import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { useToast } from '@shared/hooks/useToast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@shared/lib/utils';

// UI Components
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@shared/components/ui/form';
import { Input } from '@shared/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import { Loader2, LogIn, KeyRound, User, ShieldCheck, Store, Building2 } from 'lucide-react';

// Define role type
type InternalRole = 'admin' | 'supervisor' | 'vendor';

// Form validation schema
const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const InternalLogin: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<InternalRole>('vendor');
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { login, user } = useAuth();
  const { toast } = useToast();

  // Initialize react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const roleRoute = user.role === 'admin' 
        ? '/internal/admin/dashboard' 
        : user.role === 'supervisor' 
          ? '/internal/supervisor/dashboard' 
          : '/internal/vendor/dashboard';
      
      navigate(roleRoute);
    }
  }, [user, navigate]);

  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      // No need to set navigate here as the useEffect will handle it
    } catch (error) {
      // Error handling is done in the auth provider
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render role icon based on selected role
  const renderRoleIcon = () => {
    switch (selectedRole) {
      case 'admin':
        return <ShieldCheck className="h-5 w-5 mr-2" />;
      case 'supervisor':
        return <Building2 className="h-5 w-5 mr-2" />;
      case 'vendor':
        return <Store className="h-5 w-5 mr-2" />;
      default:
        return <User className="h-5 w-5 mr-2" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b shadow-sm py-4 px-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-serif text-rose-700 dark:text-rose-400">Sehra</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
            Sehra Operations Portal — Internal Use Only
          </p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Login Card with Backdrop Blur */}
          <Card className="border-none shadow-xl backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <span className="text-2xl font-serif text-rose-700 dark:text-rose-400">S</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-serif text-center text-rose-700 dark:text-rose-400">
                Internal Login
              </CardTitle>
              <CardDescription className="text-center">
                Access your Sehra operations account
              </CardDescription>
            </CardHeader>
            
            {/* Role Tabs */}
            <Tabs 
              value={selectedRole} 
              onValueChange={(value) => setSelectedRole(value as InternalRole)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4 mx-6">
                <TabsTrigger 
                  value="vendor" 
                  className={cn(
                    "data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700",
                    "dark:data-[state=active]:bg-rose-900/20 dark:data-[state=active]:text-rose-400"
                  )}
                >
                  <Store className="w-4 h-4 mr-2" />
                  Vendor
                </TabsTrigger>
                <TabsTrigger 
                  value="supervisor" 
                  className={cn(
                    "data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700",
                    "dark:data-[state=active]:bg-rose-900/20 dark:data-[state=active]:text-rose-400"
                  )}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Supervisor
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className={cn(
                    "data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700",
                    "dark:data-[state=active]:bg-rose-900/20 dark:data-[state=active]:text-rose-400"
                  )}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
              </TabsList>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedRole}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value={selectedRole} className="mt-0">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <CardContent className="space-y-4">
                          <div className="rounded-lg bg-rose-50/50 dark:bg-rose-900/10 p-3 flex items-center">
                            {renderRoleIcon()}
                            <span className="text-sm">
                              Logging in as <span className="font-medium capitalize">{selectedRole}</span>
                            </span>
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={`${selectedRole}@sehra.com`} 
                                    type="email" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between">
                                  <FormLabel>Password</FormLabel>
                                  <a
                                    href="#"
                                    className="text-xs text-rose-700 dark:text-rose-400 hover:underline"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toast({
                                        title: "Password Reset",
                                        description: "Please contact your administrator for password resets.",
                                      });
                                    }}
                                  >
                                    Forgot password?
                                  </a>
                                </div>
                                <FormControl>
                                  <Input 
                                    placeholder="••••••••" 
                                    type="password" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                        
                        <CardFooter>
                          <Button 
                            type="submit" 
                            className="w-full bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                              </>
                            ) : (
                              <>
                                <LogIn className="mr-2 h-4 w-4" />
                                Sign In
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </form>
                    </Form>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
            
            <div className="px-6 pb-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                By logging in, you agree to the <a href="#" className="text-rose-700 dark:text-rose-400 hover:underline">Terms of Service</a>
              </p>
            </div>
          </Card>
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Sehra Wedding Management. All rights reserved.
      </footer>
    </div>
  );
};

export default InternalLogin;