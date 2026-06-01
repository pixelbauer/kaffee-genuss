// Zentrale Site-Konstanten – ein Ort für Navigation, Marke, Trust-Daten.

export const SITE = {
  name: 'Kaffee-Genuss.net',
  url: 'https://www.kaffee-genuss.net',
  // knappe, B2B-orientierte Default-Beschreibung
  description:
    'Kaffeevollautomaten für Büro & Gastronomie vergleichen – kostenlos & unverbindlich. Bis zu 3 Angebote passender Anbieter in DE, AT und CH.',
  locale: 'de_DE',
  lang: 'de',
} as const;

export type NavItem = { label: string; href: string };

export const NAV_MAIN: NavItem[] = [
  { label: 'Beratung', href: '/beratung/' },
  { label: 'Modelle', href: '/modelle/' },
  { label: 'Hersteller', href: '/hersteller/' },
  { label: 'Wissenswertes', href: '/wissenswertes/' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'Kontakt', href: '/kontakt/' },
];

export const NAV_LEGAL: NavItem[] = [
  { label: 'Impressum', href: '/impressum/' },
  { label: 'Datenschutz', href: '/datenschutz/' },
];

// USP-Badges (DESIGN.md §5 Trust-Elemente)
export const USPS = [
  'kostenlos',
  'unverbindlich',
  'bis zu 3 Angebote',
  'DE · AT · CH',
] as const;

// Hersteller-Reihenfolge & Anzeigenamen (CONTENT-PLAN Block 1).
// slug = Bestands-URL, 1:1 gespiegelt.
export const HERSTELLER_ORDER = [
  'wmf',
  'jura',
  'kaffee-partner',
  'melitta',
  'siemens',
  'saeco',
  'faema',
  'delonghi',
  'krups',
  'gaggia',
  'aeg',
  'miele',
] as const;

// Kontakt-/Impressumsdaten (Betreiber laut Live-Impressum).
export const COMPANY = {
  legalName: 'Zeitgeistmanufaktur GmbH',
  street: 'Honnefer Straße 39',
  zip: '53572',
  city: 'Unkel',
  country: 'Deutschland',
  email: 'kontakt@zeitgeistmanufaktur.de',
  managingDirector: 'Tim Bauer',
  register: 'HRB 30180',
  registerCourt: 'Amtsgericht Montabaur',
  taxNumber: '2732/677/01102',
  vatId: 'DE325151683',
} as const;
