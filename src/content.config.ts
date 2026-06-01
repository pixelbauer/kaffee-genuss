import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { glob } from 'astro/loaders';

// Hersteller-Seiten (CONTENT-PLAN Block 1). Firmengeschichte raus, B2B-Nutzen rein.
const hersteller = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hersteller' }),
  schema: z.object({
    title: z.string(),
    name: z.string(),
    lead: z.string(),
    segment: z.enum(['Gewerbe', 'Semi-pro/Gewerbe', 'Semi-pro', 'Privat/Semi-pro', 'Privat', 'Privat/Einbau', 'Gewerbe (Vermieter)', 'Gewerbe (Siebträger)', 'Gewerbe (Professional)']),
    prioritaet: z.enum(['hoch', 'mittel', 'niedrig']),
    tags: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
  }),
});

// Wissenswertes (CONTENT-PLAN Block 2): B2B-SEO-Satelliten.
const wissenswertes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/wissenswertes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lead: z.string(),
    tags: z.array(z.string()).default([]),
    category: z.enum(['Ratgeber', 'Kosten & Leasing', 'Betrieb & Hygiene', 'Wissen']).default('Wissen'),
    related: z.array(z.string()).default([]),
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .default([]),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    order: z.number().default(50),
  }),
});

// FAQ-Einträge (eigene Collection, gerendert auf /faq/).
const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    order: z.number().default(50),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { hersteller, wissenswertes, faq };
