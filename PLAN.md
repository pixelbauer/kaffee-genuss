# Relaunch Kaffee-Genuss.net — PLAN.md

> Migration WordPress → Astro SSG. Fokus: Lead-Generierung (KVA für Büro & Gastro),
> leichtgewichtig, statisch ausgeliefert, starkes automatisiertes Backend.
> Lead- & Newsletter-Handling über bestehende RGM/GreenArrow-API.

---

## 1. Ziele & Leitplanken

| Ziel | Umsetzung |
|------|-----------|
| Lead-Gen bleibt Kern | Mehrstufiger KVA-Konfigurator (Preact Island) → RGM-API |
| Leichtgewichtig | Astro 6 SSG, 0 JS auf Content-Seiten, Islands nur wo nötig |
| Flexibel/automatisiert | Markdown-Content im Git, CI-Build, Form→API entkoppelt |
| Compliance | Consent-Banner (Consent Mode v2), DSGVO, Impressum/DS |
| SEO | SSR-HTML, Schema.org, saubere interne Verlinkung, Core Web Vitals grün |
| Tracking | GTM + GA4, erst nach Consent (Consent Mode v2 default denied) |

**Nicht-Ziele:** kein CMS, kein WordPress, keine Server-Runtime für Content (rein statisch + ein schlanker API-Proxy nur für Form-Submits).

---

## 2. Tech-Stack

- **Astro 6** (SSG, `output: 'static'`)
- **Preact Islands** — nur für: Konfigurator-Wizard, Newsletter-Form, Consent-Banner
- **Content Collections** (Markdown + Zod-Schema) für Hersteller, Modelle, Wissenswertes, FAQ
- **Tailwind CSS** (kaffee-eigene Design-Tokens, keine generischen Grays) — umgesetzt via Tailwind 4 / PostCSS
- **Cloudflare Pages** (Hosting, reines SSG) — ersetzt das ursprünglich angedachte Docker/Nginx/Traefik-Pattern
- **Form-Proxy:** **Cloudflare Pages Functions** (`/functions/api/*`), die Lead/Newsletter/Kontakt an RGM/GreenArrow weiterreichen — Secrets serverseitig, nie im Client.

---

## 3. Informationsarchitektur (Migration 1:1 + Cleanup)

```
/                         → Hero + Konfigurator-CTA + Trust + Newsletter
/beratung/                → Beratungsseite (Lead-CTA)
/modelle/                 → Modellübersicht
/hersteller/             → Hub
  /hersteller/[slug]/     → AEG, DeLonghi, Faema, Gaggia, Jura, Kaffee-Partner,
                            Krups, Melitta, Miele, Saeco, Siemens, WMF
/wissenswertes/          → Hub (Spoke-Content, SEO)
  /wissenswertes/[slug]/  → Fairtrade, Geschichte, Ist Kaffee ungesund?,
                            Weckt Kaffee?, Kaffee & Schlaf, Aufbewahrung & Dosierung
/faq/
/kontakt/  /impressum/  /datenschutz/
```

**Cleanup:** Fremd-Bilder von `kaffeevollautomat-mieten.de` lokal einbinden + auf WebP/AVIF konvertieren. Stockfotos ersetzen/optimieren. Content-Refresh der 2016er-Texte (E-E-A-T).

---

## 4. Lead-Konfigurator (Herzstück)

Mehrstufiger Wizard (Preact Island), Schritte 1:1 vom Bestand übernommen:

1. Geräteart (Tisch / Stand / Weiß nicht)
2. Einsatzort (Kleingastro / Gastro-Hotellerie / Büro / Privat)
3. Tagesverbrauch (bis 50 / 50–100 / 100–150 / >150 Tassen)
4. Getränke (Mehrfachauswahl)
5. Anzahl Automaten (1 / 2 / 3+ / Weiß nicht)
6. PLZ + Land (DE/AT/CH/Sonstige)
7. Kontaktdaten (Anrede, Name, E-Mail, Tel) → Submit

**Verarbeitung:**
- Client validiert, sammelt State (kein localStorage in Artefakt-Sinn — in-memory).
- Submit → POST an `/api/lead` (Proxy) → mappt Payload → RGM/GreenArrow.
- Honeypot + Rate-Limit + Server-Side-Validation gegen Bot-Leads
  (analog deiner `hosting=true AND proxy=false`-Logik / Burst-Erkennung).
- Double-Opt-In falls von RGM gefordert; Danke-State im Wizard.

**Newsletter** (separater, schlanker Island): E-Mail → `/api/newsletter` → RGM.
Abmeldung über RGM-Unsubscribe-Link/-Endpoint.

---

## 5. Compliance & Tracking (unverzichtbar)

- **Consent-Banner** (eigener Preact-Island oder Klaro/CookieConsent):
  Kategorien Funktional (immer) / Statistik / Marketing.
- **Google Consent Mode v2**: default `denied`, Update bei Zustimmung.
- **GTM**: Container im `<head>`, dataLayer-Push für Wizard-Schritte
  (`lead_step`, `lead_submit`) und Newsletter (`newsletter_signup`).
- **GA4** ausschließlich über GTM, nur nach Consent.
- DSGVO: Datenschutzerklärung mit RGM/GreenArrow als Auftragsverarbeiter,
  Doppel-Opt-In dokumentiert, Form-Consent-Checkbox mit DS-Link.

---

## 6. SEO-Signale

- SSG → vollständiges HTML, schnelle TTFB.
- `@astrojs/sitemap`, `robots.txt`, Canonicals (von `www`-Variante beibehalten).
- Schema.org: `Organization`, `FAQPage` (FAQ-Seite), `Product`/`Brand` (Hersteller),
  `BreadcrumbList`.
- OpenGraph/Twitter-Cards, sprechende Slugs (Bestands-URLs 1:1 → keine Redirects nötig,
  sonst 301-Map).
- Interne Verlinkung Hub→Spoke (Hersteller-Hub ↔ Modelle ↔ Wissenswertes).
- Core Web Vitals: AVIF/WebP, `loading=lazy`, font-display swap, kein Render-Block-JS.

---

## 7. Design-Tokens (Vorschlag)

```
Espresso  #3B2417   (Primärtext/Dunkel)
Crema     #C8A26A   (Akzent/CTA)
Bohne     #6F4E37   (Sekundär)
Milch     #F7F3EC   (Background)
Signal    #E08A2B   (CTA-Hover / Konversion)
Fonts: Headline → "Fraunces"/"Outfit", Body → "Inter"/"Nunito Sans"
```

---

## 8. Repo-Struktur

```
kaffee-genuss/
├─ src/
│  ├─ pages/            (index, beratung, modelle, faq, kontakt, …)
│  │  ├─ hersteller/[slug].astro
│  │  ├─ wissenswertes/[slug].astro
│  │  └─ api/           (lead.ts, newsletter.ts — Proxy zu RGM)
│  ├─ content/          (hersteller/*.md, wissenswertes/*.md, faq.md) + config.ts (Zod)
│  ├─ components/       (islands: Configurator.tsx, Newsletter.tsx, Consent.tsx)
│  ├─ layouts/  styles/ (tokens)
│  ├─ assets/img/        (lokale, lizenzfreie Bilder → astro:assets WebP)
├─ functions/api/        (lead.ts, newsletter.ts, kontakt.ts — Pages Functions → RGM)
├─ public/  (_headers, robots.txt, favicon, og)
├─ astro.config.mjs  postcss.config.mjs
└─ DESIGN.md  PLAN.md
```

---

## 9. Migrations- & Umsetzungs-Phasen

1. **Setup** — Astro-Init, Tokens, Layout, Cloudflare-Pages-Build, CI.
2. **Content-Migration** — WP-Inhalte → Markdown (Hersteller, Wissenswertes, FAQ), Bilder lokalisieren+optimieren, Texte E-E-A-T-Refresh.
3. **Konfigurator** — Wizard-Island nachbauen, RGM-Mapping, Validierung/Bot-Schutz.
4. **Compliance/Tracking** — Consent-Banner + Consent Mode v2 + GTM/GA4.
5. **SEO** — Schema, Sitemap, Canonicals, 301-Map (falls URL-Änderungen), interne Links.
6. **QA** — Lighthouse (CWV grün), Lead-End-to-End-Test in RGM, Consent-Gating prüfen.
7. **Go-Live** — Cloudflare-DNS (Apex→www), alte WP abschalten, Search-Console-Reindex.

---

## 10. Offene Punkte (Input nötig)

- RGM/GreenArrow: genaues Lead-Endpoint + Payload-Schema + Auth (API-Key-Header?). *(offen — Tim)*
- Newsletter-Liste-ID & Double-Opt-In-Flow in RGM. *(offen — Tim)*
- GTM-Container-ID + finale Abnahme der Datenschutzerklärung. *(offen)*
- ~~URL-Struktur `www`~~ → geklärt (www kanonisch, Cloudflare + DNS, URLs 1:1 gespiegelt).
- ~~Hersteller/Modelle-Inventur~~ → abgeschlossen (CONTENT-PLAN.md, 12 Hersteller).
