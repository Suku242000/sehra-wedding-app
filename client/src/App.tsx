import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import AppWithAuth from './AppWithAuth';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <AppWithAuth />
          <Toaster />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
