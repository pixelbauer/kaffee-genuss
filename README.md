# Kaffee-Genuss.net

Relaunch der Lead-Gen-Seite für Kaffeevollautomaten (Büro & Gastro, DACH) auf **Astro 6 SSG**,
gehostet auf **Cloudflare Pages**. Lead-/Newsletter-Handling über Cloudflare Pages Functions →
RGM/GreenArrow. Konzept siehe `PLAN.md`, Design `DESIGN.md`, Content `CONTENT-PLAN.md`, Status `MEMORY.md`.

## Stack

- Astro 6 (`output: 'static'`), Preact Islands (Konfigurator, Newsletter, Consent)
- Content Collections (Markdown + Zod) — Content im Git
- Tailwind 4 (via PostCSS) + Kaffee-Tokens, selbstgehostete Fonts (Fontsource)
- Cloudflare Pages + Pages Functions (`/functions`)

## Entwicklung

```bash
npm install
npm run dev        # Astro Dev-Server (ohne Pages Functions)
npm run build      # Production-Build nach dist/
npx astro check    # Typecheck
```

### Pages Functions lokal testen (lead/newsletter/kontakt)

```bash
npm run build
npx wrangler pages dev dist --port 8788 --compatibility-date=2025-01-01
```

## Konfiguration (Cloudflare Pages → Settings → Variables & Secrets)

| Variable | Zweck | Pflicht |
|---|---|---|
| `RGM_LEAD_URL` | RGM/GreenArrow-Endpoint für Leads | für echten Lead-Versand |
| `RGM_NEWSLETTER_URL` | RGM-Endpoint Newsletter (DOI) | für Newsletter |
| `RGM_API_KEY` | Auth (als `Authorization: Bearer …`) | je nach RGM |
| `RGM_NEWSLETTER_LIST_ID` | Ziel-Listen-ID Newsletter | für Newsletter |
| `CONTACT_FORWARD_URL` | optionaler Endpoint für Kontaktnachrichten | nein (Fallback: Lead-URL) |
| `PUBLIC_GTM_ID` | GTM-Container (Build-Zeit), z. B. `GTM-XXXXXX` | nein (ohne ID kein Tracking) |
| `RATE_LIMIT` (KV-Binding) | IP-Rate-Limit der Formulare | nein (ohne KV: deaktiviert) |

**Ohne RGM-Variablen** laufen die Functions im **Stub-Modus**: Einsendungen werden validiert,
gegen Bots geprüft und nur geloggt (200) — der Flow ist so ende-zu-ende testbar.

## Build-Output

`dist/` enthält statisches HTML + Assets, `sitemap-index.xml`, `robots.txt`, `_headers`.
Die `functions/`-Verzeichnis wird von Cloudflare Pages separat als Functions deployed.

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Build output directory: `dist`
- Functions: automatisch aus `/functions`
- DNS: `www` als kanonische Variante, Apex → `www` per Pages/DNS-Redirect.
