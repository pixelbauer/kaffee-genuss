# CLAUDE.md — Kaffee-Genuss.net

> Arbeitsanweisung für Claude in diesem Repo. Kurz halten, an Konventionen halten.
> Begleitdokumente: `PLAN.md` (Architektur & Phasen), `DESIGN.md` (Design-System), `MEMORY.md` (Projektstatus).

---

## Projekt in einem Satz

Relaunch der Lead-Gen-Seite für Kaffeevollautomaten (Büro & Gastro, DACH) von WordPress auf **Astro 6 SSG** — leichtgewichtig, statisch, mit automatisiertem Lead-/Newsletter-Flow über die bestehende **RGM/GreenArrow-API**.

## Stack

- **Astro 6** (`output: 'static'`), **Preact Islands** nur für Konfigurator / Newsletter / Consent
- **Content Collections** (Markdown + Zod) — Content lebt im Git, kein CMS
- **Tailwind** mit Kaffee-Tokens (siehe DESIGN.md), keine generischen Grays
- **Docker / Nginx / Traefik** (Deploy-Pattern wie familienreise-kreuzfahrt.de)
- Form-Submits → schlanker Server-Endpoint → RGM/GreenArrow (Secrets serverseitig)

## Konventionen

- **Sprache:** DE für UI-Texte, Content & Konversation · EN für Code, Identifier, Commits
- **Stil:** direkt, knapp, lowercase, action-orientiert
- **Filenames:** kebab-case · Markdown-Content mit YAML-Frontmatter (title/tags/created)
- **Git-Commits:** Claude-authored Commits IMMER mit Prefix `AS:`
- **Iterativ statt One-Shot** — kleine Schritte, früh zeigen, dann verfeinern
- **Radien kantig** (2/3px), siehe DESIGN.md — bewusst nicht rund

## Architektur-Leitplanken

- Content-Seiten: **0 JS**. Islands sparsam und nur wo Interaktion nötig ist.
- Konfigurator ist das Herzstück (7 Schritte, siehe PLAN.md §4 / DESIGN.md §6) → State in-memory, kein localStorage.
- Lead-/Newsletter-Payload NIE im Client mappen — immer über den Proxy-Endpoint.
- Bot-Schutz: Honeypot + Rate-Limit + serverseitige Validierung (Logik analog `hosting=true AND proxy=false`).
- Consent vor Tracking: Consent Mode v2 default `denied`, GTM/GA4 erst nach Zustimmung.

## Verzeichnis (Soll)

```
src/
  pages/        index, beratung, modelle, faq, kontakt, impressum, datenschutz
    hersteller/[slug].astro   wissenswertes/[slug].astro
    api/        lead.ts, newsletter.ts   (Proxy zu RGM)
  content/      hersteller/*.md, wissenswertes/*.md, faq.md + config.ts (Zod)
  components/   Configurator.tsx, Newsletter.tsx, Consent.tsx (Islands)
  layouts/  styles/
public/         Bilder optimiert (AVIF/WebP)
```

## Definition of Done (pro Feature)

- Lighthouse CWV grün (mobil), 0 Render-Block-JS auf Content-Seiten
- Consent-Gating geprüft (kein Tracking vor Zustimmung, kein CLS)
- Lead-/Newsletter-Submit end-to-end in RGM getestet
- Semantisches HTML, Alt-Texte, sichtbarer Fokus, WCAG AA
- Bestands-URLs gespiegelt oder 301-Map gepflegt (kein Ranking-Verlust)

## Nicht tun

- Kein WordPress, kein CMS, keine Server-Runtime für Content
- Keine Secrets/API-Keys im Client oder Repo
- Keine Fremd-Bilder hotlinken (von `kaffeevollautomat-mieten.de` lokalisieren)
- Keine generischen Tailwind-Grays, keine runden Pill-Radien

## Offene Punkte (Stand: siehe MEMORY.md)

- RGM-Lead-Endpoint + Payload-Schema + Auth
- Newsletter-Listen-ID + Double-Opt-In-Flow
- `www`-URL-Struktur 1:1 erhalten?
- Content-Inventur Hersteller/Modelle (was bleibt, was raus)
