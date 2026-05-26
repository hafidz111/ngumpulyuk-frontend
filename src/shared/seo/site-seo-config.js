/** @typedef {'index' | 'noindex'} RobotsDirective */

/**
 * @typedef {{
 *   title?: string;
 *   description?: string;
 *   path?: string;
 *   imagePath?: string;
 *   imageAlt?: string;
 *   type?: string;
 *   robots?: RobotsDirective;
 *   keywords?: string;
 *   jsonLd?: Record<string, unknown> | Record<string, unknown>[];
 * }} PageSeoConfig
 */

export const SITE_NAME = 'NgumpulYuk';
export const SITE_LOCALE = 'id_ID';

export const DEFAULT_TITLE = 'NgumpulYuk — Event, Circle, dan Ngumpul Bareng';
export const DEFAULT_DESCRIPTION =
  'Cari event yang lagi rame, join circle yang vibes-nya pas, dan obrolan bareng Ngumpsky. Platform ngumpul untuk komunitas dan kegiatan di Indonesia.';
export const DEFAULT_KEYWORDS =
  'ngumpul, event, komunitas, circle, jakarta, aktivitas, meetup, komunitas online, Ngumpsky';

function resolveSiteUrl() {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'https://ngumpulyuk.com';
}

export const SITE_URL = resolveSiteUrl();

export const DEFAULT_OG_IMAGE_PATH = '/og-image.jpg';
export const DEFAULT_OG_IMAGE_ALT =
  'NgumpulYuk — platform event, circle, dan ngumpul bareng';

/**
 * @param {string} [path]
 */
export function absoluteUrl(path = '/') {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * @param {PageSeoConfig} [overrides]
 * @returns {Required<Pick<PageSeoConfig, 'title' | 'description'>> & PageSeoConfig & {
 *   url: string;
 *   imageUrl: string;
 *   imageAlt: string;
 *   type: string;
 *   robots: RobotsDirective;
 * }}
 */
export function resolvePageSeo(overrides = {}) {
  const path = overrides.path ?? '/';
  const title = overrides.title ?? DEFAULT_TITLE;
  const description = overrides.description ?? DEFAULT_DESCRIPTION;

  return {
    title,
    description,
    path,
    url: absoluteUrl(path),
    imagePath: overrides.imagePath ?? DEFAULT_OG_IMAGE_PATH,
    imageUrl: absoluteUrl(overrides.imagePath ?? DEFAULT_OG_IMAGE_PATH),
    imageAlt: overrides.imageAlt ?? DEFAULT_OG_IMAGE_ALT,
    type: overrides.type ?? 'website',
    robots: overrides.robots ?? 'index',
    keywords: overrides.keywords ?? DEFAULT_KEYWORDS,
    jsonLd: overrides.jsonLd,
  };
}

/** @type {Record<string, PageSeoConfig>} */
export const PAGE_SEO_BY_PATH = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: '/',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'id-ID',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/events?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl('/favicon.svg'),
        description: DEFAULT_DESCRIPTION,
      },
    ],
  },
  '/login': {
    title: `Masuk — ${SITE_NAME}`,
    description:
      'Masuk ke akun NgumpulYuk untuk explore event, circle, dan chat dengan Ngumpsky.',
    path: '/login',
    robots: 'noindex',
  },
  '/register': {
    title: `Daftar — ${SITE_NAME}`,
    description:
      'Buat akun NgumpulYuk gratis. Join event, circle, dan mulai ngumpul bareng.',
    path: '/register',
    robots: 'noindex',
  },
  '/verify-email': {
    title: `Verifikasi Email — ${SITE_NAME}`,
    path: '/verify-email',
    robots: 'noindex',
  },
  '/forgot-password': {
    title: `Lupa Password — ${SITE_NAME}`,
    path: '/forgot-password',
    robots: 'noindex',
  },
  '/onboarding': {
    title: `Lengkapi Profil — ${SITE_NAME}`,
    path: '/onboarding',
    robots: 'noindex',
  },
  '/syarat-ketentuan': {
    title: `Syarat dan Ketentuan — ${SITE_NAME}`,
    description: 'Syarat dan ketentuan penggunaan platform NgumpulYuk.',
    path: '/syarat-ketentuan',
  },
  '/kebijakan-privasi': {
    title: `Kebijakan Privasi — ${SITE_NAME}`,
    description:
      'Kebijakan privasi dan pelindungan data pribadi NgumpulYuk sesuai UU PDP.',
    path: '/kebijakan-privasi',
  },
};

/**
 * @param {string} pathname
 */
export function getPageSeoForPath(pathname) {
  const normalized = pathname.replace(/\/$/, '') || '/';
  if (PAGE_SEO_BY_PATH[normalized]) {
    return resolvePageSeo(PAGE_SEO_BY_PATH[normalized]);
  }

  if (normalized.startsWith('/password-reset-confirm')) {
    return resolvePageSeo({
      title: `Reset Password — ${SITE_NAME}`,
      path: normalized,
      robots: 'noindex',
    });
  }

  return resolvePageSeo({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: normalized,
    robots: 'noindex',
  });
}
