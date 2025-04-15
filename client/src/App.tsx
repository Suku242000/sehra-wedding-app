import { AuthProvider } from '@/context/AuthContext';
import AppWithAuth from './AppWithAuth';

function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

export default App;
