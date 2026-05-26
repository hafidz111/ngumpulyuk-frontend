import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function htmlSeoEnvPlugin(env) {
  const siteUrl = (env.VITE_SITE_URL || 'https://ngumpulyuk.com').replace(
    /\/$/,
    '',
  );
  const ogImage = `${siteUrl}/og-image.jpg`;
  return {
    name: 'html-seo-env',
    transformIndexHtml(html) {
      return html
        .replaceAll('https://ngumpulyuk.com', siteUrl)
        .replaceAll('https://ngumpulyuk.com/og-image.jpg', ogImage);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  return {
    plugins: [react(), htmlSeoEnvPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
