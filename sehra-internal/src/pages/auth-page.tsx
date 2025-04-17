import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useLocation } from 'wouter';
import { useToast } from '@shared/hooks/useToast';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import { UserRole } from '@shared/schema';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ShieldCheck, Store, Building2 } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { login, register, user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<string>(UserRole.VENDOR);
  
  // If already logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (user) {
      if (user.role === UserRole.ADMIN) {
        setLocation('/admin-dashboard');
      } else if (user.role === UserRole.VENDOR) {
        setLocation('/vendor-dashboard');
      } else if (user.role === UserRole.SUPERVISOR) {
        setLocation('/supervisor-dashboard');
      }
    }
  }, [user, setLocation]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await login(loginEmail, loginPassword);
    } catch (error) {
      console.error('Login error:', error);
      // Error handling is done in the auth provider
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword || !registerRole) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await register(
        registerName,
        registerEmail,
        registerPassword,
        registerRole as any
      );
    } catch (error) {
      console.error('Registration error:', error);
      // Error handling is done in the auth provider
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      <header className="bg-white shadow-sm py-4 px-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-serif text-rose-700">Sehra <span className="text-gray-600 text-sm">Internal Portal</span></h1>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row p-4 md:p-0">
        {/* Left section: Authentication form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-center text-rose-700">
                  {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                </CardTitle>
                <CardDescription className="text-center">
                  {activeTab === 'login'
                    ? 'Access Sehra internal platform'
                    : 'Join as a vendor or staff member'}
                </CardDescription>
              </CardHeader>
              
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4 mx-6">
                  <TabsTrigger value="login" className="data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <a
                            href="#"
                            className="text-xs text-rose-700 hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              toast({
                                title: "Password Reset",
                                description: "Please contact your administrator for password resets.",
                              });
                            }}
                          >
                            Forgot your password?
                          </a>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Full Name"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Must be at least 6 characters
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Account Type</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
                          <Button
                            type="button"
                            variant={registerRole === UserRole.VENDOR ? 'default' : 'outline'}
                            className={`flex flex-col items-center justify-center h-24 ${
                              registerRole === UserRole.VENDOR ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''
                            }`}
                            onClick={() => setRegisterRole(UserRole.VENDOR)}
                          >
                            <Store className="h-6 w-6 mb-2" />
                            <span>Vendor</span>
                          </Button>
                          <Button
                            type="button"
                            variant={registerRole === UserRole.SUPERVISOR ? 'default' : 'outline'}
                            className={`flex flex-col items-center justify-center h-24 ${
                              registerRole === UserRole.SUPERVISOR ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''
                            }`}
                            onClick={() => setRegisterRole(UserRole.SUPERVISOR)}
                          >
                            <Building2 className="h-6 w-6 mb-2" />
                            <span>Supervisor</span>
                          </Button>
                          <Button
                            type="button"
                            variant={registerRole === UserRole.ADMIN ? 'default' : 'outline'}
                            className={`flex flex-col items-center justify-center h-24 ${
                              registerRole === UserRole.ADMIN ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''
                            }`}
                            onClick={() => setRegisterRole(UserRole.ADMIN)}
                          >
                            <ShieldCheck className="h-6 w-6 mb-2" />
                            <span>Admin</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </div>
        
        {/* Right section: Hero image and text */}
        <div className="w-full md:w-1/2 bg-rose-50 p-8 md:p-12 flex items-center justify-center hidden md:flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-lg"
          >
            <h2 className="text-3xl font-serif font-bold text-rose-700 mb-4">
              Sehra Internal Platform
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Access your vendor dashboard, manage supervisor assignments, or administer 
              the platform from our secure internal portal.
            </p>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-serif font-bold text-rose-700 mb-3">
                Features by Role
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Store className="h-5 w-5 text-rose-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Vendors:</span> Manage your profile, bookings, availability calendar, and see your performance analytics.
                  </div>
                </li>
                <li className="flex items-start">
                  <Building2 className="h-5 w-5 text-rose-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Supervisors:</span> Monitor client progress, manage client assignments, and track important deadlines.
                  </div>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-5 w-5 text-rose-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Administrators:</span> Manage users, vendor approvals, supervisor assignments, and platform metrics.
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;