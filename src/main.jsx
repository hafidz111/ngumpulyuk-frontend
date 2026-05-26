import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AuthProvider } from './presentation/auth/providers/auth-provider';
import { Toaster } from './presentation/components/ui/sonner';
import { applyPageSeo } from '@/shared/seo/apply-page-seo';
import { getPageSeoForPath } from '@/shared/seo/site-seo-config';
import App from './App.jsx';
import './index.css';

applyPageSeo(getPageSeoForPath(window.location.pathname));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position='top-center'
        richColors
        closeButton={false}
        duration={4000}
      />
    </AuthProvider>
  </StrictMode>,
);
