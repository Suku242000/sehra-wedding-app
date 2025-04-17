import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../lib/auth';

export default function RootRedirect() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation('/login');
      } else if (user.role === 'vendor') {
        setLocation('/vendor-dashboard');
      } else if (user.role === 'supervisor') {
        setLocation('/supervisor-dashboard');
      } else if (user.role === 'admin') {
        setLocation('/admin-dashboard');
      } else {
        // Default fallback
        setLocation('/login');
      }
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
    </div>
  );
}