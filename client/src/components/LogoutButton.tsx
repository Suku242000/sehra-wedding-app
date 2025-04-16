import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };
  
  return (
    <Button variant="destructive" onClick={handleLogout}>
      Logout
    </Button>
  );
};