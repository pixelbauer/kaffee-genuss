// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// Kaffee-Genuss.net — reines SSG, Hosting auf Cloudflare Pages.
// www-Variante ist kanonisch (Bestands-URLs 1:1 spiegeln, siehe CONTENT-PLAN.md).
export default defineConfig({
  site: 'https://www.kaffee-genuss.net',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    preact({ compat: false }),
    sitemap({
      i18n: undefined,
      changefreq: 'monthly',
      priority: 0.7,
      // System-/Post-Submit-Seiten nicht indexieren (DOI-Bestätigung).
      filter: (page) => !page.includes('/newsletter/bestaetigen'),
    }),
  ],
  image: {
    // lokale Assets, keine Fremd-Domains hotlinken
    domains: [],
  },
});
