import type { ImageMetadata } from 'astro';

// Lokale, lizenzfreie Bilder (Quelle: Pexels – Nachweis im Impressum).
// Werden via astro:assets zu AVIF/WebP optimiert + responsive ausgeliefert.
import heroGastro from '@/assets/img/hero-gastro-espresso.jpg';
import officeBreak from '@/assets/img/office-break.jpg';
import officeLaptop from '@/assets/img/office-laptop-coffee.jpg';
import baristaMilk from '@/assets/img/barista-milk.jpg';
import espressoPerson from '@/assets/img/espresso-person.jpg';
import machineCafe from '@/assets/img/machine-cafe.jpg';
import machineShop from '@/assets/img/machine-coffeeshop.jpg';
import beans from '@/assets/img/beans-roasted.jpg';
import cappuccinoOffice from '@/assets/img/cappuccino-office.jpg';
import cupLatte from '@/assets/img/cup-latte.jpg';

export const IMG = {
  heroGastro,
  officeBreak,
  officeLaptop,
  baristaMilk,
  espressoPerson,
  machineCafe,
  machineShop,
  beans,
  cappuccinoOffice,
  cupLatte,
} as const;

// Wissenswertes: Bild je Artikel (Slug). Fallback über Kategorie.
const WISSEN_BY_SLUG: Record<string, ImageMetadata> = {
  'kaffeevollautomat-buero-kaufen-mieten-leasen': officeLaptop,
  'was-kostet-kaffeevollautomat-gewerbe': cappuccinoOffice,
  'vollautomat-groesse-tassen-pro-tag': machineShop,
  'wartung-reinigung-hygiene-haccp': baristaMilk,
  'leasing-vs-kauf-steuer': officeLaptop,
  'mitarbeiterzufriedenheit-kaffee': officeBreak,
  'vollautomat-vs-siebtraeger-vs-kapsel': espressoPerson,
  'checkliste-anbieter-service-vertrag': machineCafe,
  'kaffeekonsum-deutschland': cupLatte,
  'fairtrade-kaffee': beans,
  'ist-kaffee-ungesund': cupLatte,
  'kaffee-und-schlaf': cappuccinoOffice,
  'kaffee-aufbewahrung-dosierung': beans,
};

const WISSEN_BY_CATEGORY: Record<string, ImageMetadata> = {
  'Kosten & Leasing': officeLaptop,
  'Betrieb & Hygiene': baristaMilk,
  Ratgeber: machineShop,
  Wissen: cupLatte,
};

export function wissenImage(slug: string, category: string): ImageMetadata {
  return WISSEN_BY_SLUG[slug] ?? WISSEN_BY_CATEGORY[category] ?? machineCafe;
}

// Hersteller-Detail-Banner nach Segment.
export function herstellerImage(segment: string): ImageMetadata {
  if (segment.includes('Siebträger')) return espressoPerson;
  if (segment.includes('Gewerbe')) return machineShop;
  if (segment.includes('Semi-pro')) return officeBreak;
  return machineCafe;
}
