import { ReactNode } from 'react';
import { AuthProvider as SharedAuthProvider, useAuth as useSharedAuth } from '../../../shared/src/hooks/useAuth';

// Re-export the shared useAuth hook
export const useAuth = useSharedAuth;

// Wrapper for the client application's AuthProvider
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SharedAuthProvider>
      {children}
    </SharedAuthProvider>
  );
}