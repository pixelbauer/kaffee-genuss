/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Google Tag Manager Container-ID (z. B. GTM-XXXXXX). Optional – nur wenn Tracking aktiv. */
  readonly PUBLIC_GTM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// gtag/dataLayer auf window (im Browser durch Inline-Script gesetzt)
interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
}

// Selbstgehostete Fonts (Fontsource liefert keine Typdeklarationen für CSS-Side-Effect-Imports)
declare module '@fontsource-variable/fraunces';
declare module '@fontsource-variable/inter';
