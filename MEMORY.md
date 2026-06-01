# MEMORY.md — Kaffee-Genuss.net

> Projekt-Gedächtnis & Statusspeicher. Bei jedem Arbeitsstart lesen, am Ende fortschreiben.
> Was ist entschieden, was läuft, was blockiert, was kommt als Nächstes.

---

## Status (Stand: 2026-06-01)

**Phase:** 0 — Konzeption & Design abgeschlossen, Setup steht an.
**Nächster Schritt:** Astro-Grundgerüst + Startseiten-/Wizard-Prototyp.

---

## Was ist entschieden

- Migration WordPress → **Astro 6 SSG**, Content als **Markdown im Git** (kein CMS)
- Lead- & Newsletter-Handling über bestehende **RGM/GreenArrow-API** (Proxy-Endpoint)
- Lead-Fokus bleibt Kern: **7-Schritte-Konfigurator** (1:1 vom Original-`rm-sliderForm`)
- Design: warme Kaffee-Palette, Fraunces + Inter, **kantige Radien (2/3px)**
- Compliance Pflicht: Consent-Banner + Consent Mode v2 + GTM/GA4 (erst nach Consent)
- Deploy: Docker / Nginx / Traefik

## Artefakte (erstellt)

- `PLAN.md` — Architektur, IA, Konfigurator-Logik, Phasenplan
- `DESIGN.md` — Design-System (Tokens, Typo, Komponenten, Wizard-UX, A11y)
- `design-card.html` — Key-Visual-Übersicht (v2 kantig, abgenommen)
- `CLAUDE.md` — Repo-Arbeitsanweisung
- `CONTENT-PLAN.md` — Content-Inventur & Redaktionsfahrplan (B2B-Fokus)

## Ist-Zustand der Altseite (Analyse)

- WordPress 6.6.5 + Hestia + `rm-sliderForm` (Lead-Wizard) + Cookie-Plugin
- Geschäftsmodell: qualifizierte KVA-Leads (Büro/Gastro) + Newsletter
- Schwächen: WP-Overhead, Fremd-Bilder von `kaffeevollautomat-mieten.de`,
  Content veraltet (2016), Consent-Mode-Verdrahtung unklar
- Content-Bereiche: Hersteller (AEG, DeLonghi, Faema, Gaggia, Jura, Kaffee-Partner,
  Krups, Melitta, Miele, Saeco, Siemens, WMF), Wissenswertes, FAQ

## Konfigurator-Schritte (Referenz)

1. Geräteart · 2. Einsatzort · 3. Tagesverbrauch · 4. Getränke (multi) ·
5. Anzahl Automaten · 6. PLZ+Land · 7. Kontaktdaten + Consent → Submit

---

## Offen / Blockiert (Input nötig)

- [x] **URL-Struktur**: `www` wird aufgenommen (Anfragen müssen angenommen werden) — Handling via Cloudflare Pages + DNS
- [x] **Hosting-Ziel**: Cloudflare Pages. Form-Proxy → **Pages Functions** (`/functions`), nicht Astro-Endpoint/PHP. Astro bleibt reines SSG.
- [ ] **RGM-Lead-Endpoint**: URL, Payload-Schema, Auth — *Tim kümmert sich*
- [ ] **Newsletter**: Listen-ID + Double-Opt-In-Flow — *Tim kümmert sich*
- [x] **Content-Inventur**: abgeschlossen → `CONTENT-PLAN.md`

## Nächste Schritte (geplant)

1. Astro-Init, Tokens aus DESIGN.md, Layout, Docker/Traefik, CI
2. Startseite + Konfigurator-Island als klickbarer Prototyp (ohne echten Submit)
3. RGM-Mapping verdrahten, sobald Endpoint-Infos da sind
4. Content-Migration (Markdown), Bilder lokalisieren + AVIF/WebP
5. Consent + GTM/GA4, dann SEO (Schema, Sitemap, Canonicals), dann QA

---

## Entscheidungs-Log

| Datum | Entscheidung | Begründung |
|-------|-------------|-----------|
| 2026-06-01 | Astro SSG statt Symfony SSR | Seite faktisch statisch, leichtgewichtig gewünscht |
| 2026-06-01 | Markdown im Repo statt CMS | wenig Pflege, volle Git-Kontrolle |
| 2026-06-01 | Radien kantig 2/3px | Designwunsch — sachlicher, weniger verspielt |

## Notizen

- Konventionen & Leitplanken: siehe `CLAUDE.md`
- Commit-Prefix für Claude-Commits: `AS:`
