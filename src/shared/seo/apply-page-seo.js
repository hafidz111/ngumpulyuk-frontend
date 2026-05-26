const JSON_LD_SELECTOR = 'script[data-seo-jsonld]';

/**
 * @param {string} attr
 * @param {string} key
 * @param {string} content
 */
function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('data-seo-managed', 'true');
  el.setAttribute('content', content);
}

/**
 * @param {ReturnType<import('./site-seo-config').resolvePageSeo>} seo
 */
export function applyPageSeo(seo) {
  if (typeof document === 'undefined') return;

  document.title = seo.title;
  document.documentElement.lang = 'id';

  upsertMeta('name', 'description', seo.description);
  upsertMeta('name', 'keywords', seo.keywords ?? '');
  upsertMeta(
    'name',
    'robots',
    seo.robots === 'noindex' ? 'noindex, nofollow' : 'index, follow',
  );
  upsertMeta('name', 'author', 'NgumpulYuk');
  upsertMeta('name', 'theme-color', '#FF8000');

  upsertMeta('property', 'og:site_name', 'NgumpulYuk');
  upsertMeta('property', 'og:locale', 'id_ID');
  upsertMeta('property', 'og:type', seo.type);
  upsertMeta('property', 'og:title', seo.title);
  upsertMeta('property', 'og:description', seo.description);
  upsertMeta('property', 'og:url', seo.url);
  upsertMeta('property', 'og:image', seo.imageUrl);
  upsertMeta('property', 'og:image:secure_url', seo.imageUrl);
  upsertMeta('property', 'og:image:alt', seo.imageAlt);
  upsertMeta('property', 'og:image:width', '1200');
  upsertMeta('property', 'og:image:height', '800');

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', seo.title);
  upsertMeta('name', 'twitter:description', seo.description);
  upsertMeta('name', 'twitter:image', seo.imageUrl);
  upsertMeta('name', 'twitter:image:alt', seo.imageAlt);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('data-seo-canonical', 'true');
  canonical.setAttribute('href', seo.url);

  document.head.querySelectorAll(JSON_LD_SELECTOR).forEach((node) => node.remove());
  if (seo.jsonLd) {
    const items = Array.isArray(seo.jsonLd) ? seo.jsonLd : [seo.jsonLd];
    for (const item of items) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
    }
  }
}
