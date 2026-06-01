# MEMORY.md — Kaffee-Genuss.net

> Projekt-Gedächtnis & Statusspeicher. Bei jedem Arbeitsstart lesen, am Ende fortschreiben.
> Was ist entschieden, was läuft, was blockiert, was kommt als Nächstes.

---

## Status (Stand: 2026-06-01)

**Phase:** 3/4 — Astro-Implementierung steht (Setup, Content, Konfigurator, Compliance, SEO).
Build grün (35 Seiten), Typecheck 0 Fehler, Pages Functions ende-zu-ende getestet (Wrangler).
**Blockiert nur noch durch:** echte RGM/GreenArrow-Zugangsdaten (Tim) + finale Rechtstexte.
**Nächster Schritt:** RGM-Secrets in Cloudflare setzen, GTM-ID hinterlegen, Lighthouse-Lauf, Go-Live.

### Was implementiert ist
- Astro 6 SSG + Preact-Islands (Konfigurator, Newsletter, Consent), Tailwind 4 via PostCSS.
- Tokens/Design 1:1 aus DESIGN.md (kantige Radien, Kaffee-Palette, Fraunces+Inter **selbstgehostet**).
- Seiten: Start, Beratung (LP+Wizard), Modelle, Hersteller-Hub + 12 Detailseiten, Wissenswertes-Hub
  + 13 Artikel (8 neue B2B-Spokes + 5 überarbeitete), FAQ, Kontakt, Impressum, Datenschutz, 404.
- 7-Schritte-Konfigurator: Auto-Advance, Inline-Validierung, Honeypot + Zeit-Trap, dataLayer-Hooks,
  Danke-State; POST → `/functions/api/lead.ts`.
- Pages Functions: lead, newsletter (DOI), kontakt (native form, 0 JS). Bot-Schutz + serverseitige
  Validierung + KV-Rate-Limit + RGM-Forwarding (Stub-Modus ohne Secrets, sauber getestet).
- Consent Mode v2 (default denied), Consent-Banner + Re-Open via Footer, GTM nur bei `PUBLIC_GTM_ID`.
- SEO: Sitemap, robots.txt, Canonicals, OG/Twitter, Schema (Organization/WebSite/Brand/BreadcrumbList/
  FAQPage/Article), interne Hub↔Spoke-Verlinkung.
- Cloudflare: `_headers` (Security + Asset-Caching), reines SSG, `trailingSlash: 'always'`.
- Bilder: 10 lizenzfreie Pexels-Motive lokal in `src/assets/img/` (kein Hotlinking), via
  `astro:assets` zu WebP optimiert + responsive `srcset` + lazy (Hero eager). Eingebunden in
  Hero, Vorteile, Wissenswertes-Karten/-Banner, Hersteller-Detail-Banner. Hersteller-Hub-Karten
  bewusst als Monogramm (Markenbezug, keine Stock-Wiederholung). Bildnachweis im Impressum.

### Env-Variablen (in Cloudflare Pages → Settings → Variables setzen)
- `RGM_LEAD_URL`, `RGM_NEWSLETTER_URL`, `RGM_API_KEY`, `RGM_NEWSLETTER_LIST_ID`, optional `CONTACT_FORWARD_URL`
- optional KV-Binding `RATE_LIMIT` (Namespace) für IP-Rate-Limit
- Build-Zeit: `PUBLIC_GTM_ID` (z. B. GTM-XXXXXX) — ohne ID kein Tracking/GTM

---

## Was ist entschieden

- Migration WordPress → **Astro 6 SSG**, Content als **Markdown im Git** (kein CMS)
- Lead- & Newsletter-Handling über bestehende **RGM/GreenArrow-API** (Proxy-Endpoint)
- Lead-Fokus bleibt Kern: **7-Schritte-Konfigurator** (1:1 vom Original-`rm-sliderForm`)
- Design: warme Kaffee-Palette, Fraunces + Inter, **kantige Radien (2/3px)**
- Compliance Pflicht: Consent-Banner + Consent Mode v2 + GTM/GA4 (erst nach Consent)
- Deploy: **Cloudflare Pages** (reines SSG) + **Pages Functions** für Form-Submits (kein Docker/Traefik)

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

- [x] **URL-Struktur**: `www` wird aufgenommen — Handling via Cloudflare Pages + DNS
- [x] **Hosting-Ziel**: Cloudflare Pages. Form-Proxy → **Pages Functions** (`/functions`). Astro reines SSG.
- [x] **Content-Inventur**: abgeschlossen → `CONTENT-PLAN.md`
- [x] **Impressumsdaten**: von Live-Seite übernommen → Zeitgeistmanufaktur GmbH, Honnefer Str. 39, 53572 Unkel,
  GF Tim Bauer, HRB 30180 (AG Montabaur), USt-IdNr. DE325151683, kontakt@zeitgeistmanufaktur.de
- [x] **Bilder**: 10 lizenzfreie Pexels-Motive lokalisiert (WebP via astro:assets); Telefonnummern entfernt
- [ ] **RGM-Lead-Endpoint**: URL, Payload-Schema, Auth — *Tim kümmert sich*
- [ ] **Newsletter**: Listen-ID + Double-Opt-In-Flow — *Tim kümmert sich*
- [ ] **GTM-Container-ID** (`PUBLIC_GTM_ID`) für GA4/Tracking
- [ ] **Datenschutz final** datenschutzrechtlich abnehmen (Text auf neuen Stack umgeschrieben)
- [ ] **Go-Live**: Cloudflare-Projekt + Secrets/KV, DNS (Apex→www), URL-Abgleich/301, Lighthouse, RGM-E2E

## Nächste Schritte (geplant)

1. Cloudflare-Pages-Projekt anlegen, Env-Secrets (RGM) + optional KV `RATE_LIMIT` setzen
2. `PUBLIC_GTM_ID` hinterlegen, Consent-/Tracking-Gating live prüfen
3. Bestands-URLs gegen Live abgleichen; falls Abweichung → 301-Map; Search-Console-Reindex
4. Lighthouse (CWV mobil) + Lead-/Newsletter-E2E gegen echtes RGM
5. Optional: AVIF-Ausgabe (`<Picture>`), Hersteller-Logos, echtes OG-Bild

---

## Entscheidungs-Log

| Datum | Entscheidung | Begründung |
|-------|-------------|-----------|
| 2026-06-01 | Astro SSG statt Symfony SSR | Seite faktisch statisch, leichtgewichtig gewünscht |
| 2026-06-01 | Markdown im Repo statt CMS | wenig Pflege, volle Git-Kontrolle |
| 2026-06-01 | Radien kantig 2/3px | Designwunsch — sachlicher, weniger verspielt |
| 2026-06-01 | Tailwind 4 via **PostCSS** statt `@tailwindcss/vite` | `@tailwindcss/vite` inkompatibel mit Rolldown-Vite in Astro 6 (`tsconfigPaths`-Bindingfehler) |
| 2026-06-01 | Fonts **selbstgehostet** (Fontsource), ESM-Import im Layout | DSGVO (kein Google-Fonts-IP-Transfer); ESM-Import nötig, da Tailwind-`@import` Vites Asset-Pipeline umgeht |
| 2026-06-01 | Kontaktformular nativ (0 JS) → 303-Redirect | Content-Seite ohne Island; Bot-Schutz serverseitig |
| 2026-06-01 | Telefonnummern komplett entfernt (Anzeige + Formularfelder) | Wunsch Tim; Kontakt nur noch via E-Mail/Formular |
| 2026-06-01 | Impressum/Datenschutz: reale Daten von Live-Seite | echte Betreiberdaten (Zeitgeistmanufaktur GmbH) statt Platzhalter |
| 2026-06-01 | Bilder von Pexels (lizenzfrei), lokal + WebP | Fremd-Bilder nicht hotlinken; DSGVO/CWV; Nachweis im Impressum |
| 2026-06-01 | Detail-Bild als Article-Hero (Bg + Overlay) statt frei stehendem Banner | wirkte isoliert; greift Hero-Bildsprache auf |
| 2026-06-01 | Lesespalte zentriert, 820px | war linksbündig/unausbalanciert im 1180er-Wrapper |

## Notizen

- Konventionen & Leitplanken: siehe `CLAUDE.md`
- Commit-Prefix für Claude-Commits: `AS:`
