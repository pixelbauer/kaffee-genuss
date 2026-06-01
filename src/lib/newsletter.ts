// Direkte Browser-Anbindung an die Rhein-Digital-Newsletter-API (analog Heimwerk).
// Kein Proxy, keine Auth: Mandant über source_key, Anti-Spoofing über Origin-Header
// (vom Browser automatisch gesetzt). Double-Opt-In: Signup → Bestätigungsmail →
// /newsletter/bestaetigen/ löst den Hash über /newsletter/confirm/<hash> ein.
export const NEWSLETTER_API = {
  base: 'https://api.rhein-digital.de',
  // feste Quelle, nie vom Nutzer wählbar (Doku-Vorgabe)
  sourceKey: 'kaffeemaschinen',
} as const;

export const newsletterSignupUrl = () => `${NEWSLETTER_API.base}/newsletter/signup`;
export const newsletterConfirmUrl = (hash: string) =>
  `${NEWSLETTER_API.base}/newsletter/confirm/${encodeURIComponent(hash)}`;
