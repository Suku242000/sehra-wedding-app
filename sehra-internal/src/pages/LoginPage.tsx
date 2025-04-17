import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@shared/hooks/useAuth';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['vendor', 'supervisor', 'admin']),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  // Redirect if already logged in
  if (user) {
    switch (user.role) {
      case 'vendor':
        setLocation('/vendor/dashboard');
        break;
      case 'supervisor':
        setLocation('/supervisor/dashboard');
        break;
      case 'admin':
        setLocation('/admin/dashboard');
        break;
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'vendor',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setFormError(null);
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
        role: data.role,
      });
      
      // Redirect based on role
      switch (data.role) {
        case 'vendor':
          setLocation('/vendor/dashboard');
          break;
        case 'supervisor':
          setLocation('/supervisor/dashboard');
          break;
        case 'admin':
          setLocation('/admin/dashboard');
          break;
      }
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left column - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold sehra-internal-heading">Sehra Internal</h1>
            <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
              {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className={`flex items-center p-3 border rounded-md cursor-pointer ${selectedRole === 'vendor' ? 'border-primary bg-primary/5' : 'border-gray-300'}`}>
                  <input
                    type="radio"
                    value="vendor"
                    {...register('role')}
                    className="sr-only"
                  />
                  <span className={`${selectedRole === 'vendor' ? 'text-primary font-medium' : 'text-gray-700'}`}>Vendor</span>
                </label>
                <label className={`flex items-center p-3 border rounded-md cursor-pointer ${selectedRole === 'supervisor' ? 'border-primary bg-primary/5' : 'border-gray-300'}`}>
                  <input
                    type="radio"
                    value="supervisor"
                    {...register('role')}
                    className="sr-only"
                  />
                  <span className={`${selectedRole === 'supervisor' ? 'text-primary font-medium' : 'text-gray-700'}`}>Supervisor</span>
                </label>
                <label className={`flex items-center p-3 border rounded-md cursor-pointer ${selectedRole === 'admin' ? 'border-primary bg-primary/5' : 'border-gray-300'}`}>
                  <input
                    type="radio"
                    value="admin"
                    {...register('role')}
                    className="sr-only"
                  />
                  <span className={`${selectedRole === 'admin' ? 'text-primary font-medium' : 'text-gray-700'}`}>Admin</span>
                </label>
              </div>
              {errors.role && <p className="text-red-600 text-sm">{errors.role.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <div className="text-center mt-4">
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Right column - Banner */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-purple-800 text-white">
        <div className="flex flex-col justify-center px-12 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6">Welcome to Sehra Internal Portal</h2>
            <p className="text-lg opacity-90 mb-4">
              Manage your wedding services, customer interactions, and business operations all in one place.
            </p>
            <div className="space-y-4 mt-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white/20 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">For Vendors</h3>
                  <p className="opacity-90">Manage bookings, update your profile, and track performance analytics.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white/20 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">For Supervisors</h3>
                  <p className="opacity-90">Oversee client relationships, coordinate with vendors, and monitor planning progress.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white/20 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">For Admins</h3>
                  <p className="opacity-90">Access comprehensive system controls, user management, and business analytics.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <p className="text-sm opacity-75">© {new Date().getFullYear()} Sehra. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}