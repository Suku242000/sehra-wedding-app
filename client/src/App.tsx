import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import AppWithAuth from './AppWithAuth';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppWithAuth />
        <Toaster />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
