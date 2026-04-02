import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AuthProvider } from './presentation/auth/providers/auth-provider';
import { Toaster } from './presentation/components/ui/sonner';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster position='top-center' richColors closeButton={false} duration={4000} />
    </AuthProvider>
  </StrictMode>,
);
