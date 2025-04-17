import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ToastWrapper from '@shared/components/ui/toaster';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastWrapper>
      <App />
    </ToastWrapper>
  </React.StrictMode>
);