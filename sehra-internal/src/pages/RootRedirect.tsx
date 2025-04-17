import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../lib/auth';

export default function RootRedirect() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setLocation('/login');
      return;
    }

    switch (user.role) {
      case 'vendor':
        setLocation('/vendor-dashboard');
        break;
      case 'supervisor':
        setLocation('/supervisor-dashboard');
        break;
      case 'admin':
        setLocation('/admin-dashboard');
        break;
      default:
        setLocation('/unauthorized');
        break;
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
    </div>
  );
}