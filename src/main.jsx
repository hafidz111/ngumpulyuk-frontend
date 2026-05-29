import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/infrastructure/query/query-client';
import { AuthProvider } from './presentation/auth/providers/auth-provider';
import { Toaster } from './presentation/components/ui/sonner';
import { applyPageSeo } from '@/shared/seo/apply-page-seo';
import { getPageSeoForPath } from '@/shared/seo/site-seo-config';
import App from './App.jsx';
import './index.css';

applyPageSeo(getPageSeoForPath(window.location.pathname));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster
          position='top-center'
          richColors
          closeButton={false}
          duration={4000}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
