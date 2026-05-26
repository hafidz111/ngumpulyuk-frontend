import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { applyPageSeo } from '@/shared/seo/apply-page-seo';
import { getPageSeoForPath } from '@/shared/seo/site-seo-config';

/** Perbarui title & meta (OG, Twitter, canonical) saat navigasi SPA. */
export function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    applyPageSeo(getPageSeoForPath(pathname));
  }, [pathname]);

  return null;
}
