# CONTENT-PLAN.md — Kaffee-Genuss.net

> Ergebnis der Content-Inventur. Pro Seite: Aktion (behalten/umbauen/neu/streichen),
> Struktur und SEO-Ausrichtung. Basis für Migration & Redaktionspipeline.

---

## Leitlinie

- **Lead-Fokus** über alles: jede Seite verlinkt sichtbar zum Konfigurator.
- **B2B/Gewerbe-Ausrichtung** (Büro, Gastro, Hotellerie, Leasing, TCO).
- **Hersteller** = Trust- & SEO-Anker, Gewerbe-Nutzen statt Firmengeschichte.
- **Wissenswertes** = B2B-SEO-Satellit für Top-of-Funnel-Reichweite → intern zum Konfigurator.
- Redaktionspipeline: Gemini (Research/Draft) → Claude Sonnet (Tonalität) → Markdown.

---

## Block 1 — Hersteller (12 · alle behalten + umbauen)

**Einheitliche Struktur je Seite:**
H1 → Lead → Stärken im Büro/Gastro-Einsatz → typische Modellklassen (Verbrauch/Tassen)
→ Service & Wartung → CTA-Box „Passenden Automaten finden" → verwandte Hersteller.
**Firmengeschichte raus.** YAML-Frontmatter: title, tags, segment, created.

| Hersteller | Segment | Priorität | Anmerkung |
|-----------|---------|-----------|-----------|
| WMF | Gewerbe | hoch | Vollgewerbe, starkes Suchvolumen |
| Jura | Semi-pro/Gewerbe | hoch | Büro-Klassiker |
| Kaffee-Partner | Gewerbe (Vermieter) | hoch | reiner B2B-Anbieter, Leasing-Story |
| Melitta | Gewerbe (Professional) | hoch | Professional-Linie betonen |
| Siemens | Semi-pro | mittel | Büro-tauglich |
| Saeco | Gewerbe (Professional) | mittel | Professional-Linie |
| Faema | Gewerbe (Siebträger) | mittel | Gastro/Barista |
| DeLonghi | Privat/Semi-pro | mittel | kleines Büro |
| Krups | Privat | niedrig | knapp halten |
| Gaggia | Privat/Semi-pro | niedrig | knapp halten |
| AEG | Privat | niedrig | knapp halten |
| Miele | Privat/Einbau | niedrig | knapp halten |

> Hohe Priorität = ausführlich (Gewerbe-Nutzen). Niedrig = kompakt, aber konsistent.

---

## Block 2 — Wissenswertes (B2B-SEO-Satellit, Ausbau)

**Bestand retten/neu schreiben:**
- Kaffeekonsum Deutschland → **mit aktuellen Zahlen neu** (2014 → aktuell), B2B-Framing.
- Vorhandene B2C-Wissensartikel (Fairtrade, Gesundheit, Schlaf, Aufbewahrung) →
  überarbeiten und je einen Bezug zum gewerblichen Einsatz einbauen.

**Neue B2B-Spokes (Redaktionsfahrplan, Lead-nah):**
1. Kaffeevollautomat fürs Büro — kaufen vs. mieten/leasen (TCO-Rechnung)
2. Was kostet ein Kaffeevollautomat im Gewerbe? (Anschaffung, Leasingrate, Verbrauch)
3. Vollautomat-Größe nach Tassen/Tag — Dimensionierung für Büro & Gastro
4. Wartung, Reinigung, Hygiene (HACCP) im gewerblichen Betrieb
5. Steuerliche Behandlung: Leasing vs. Kauf für Unternehmen
6. Mitarbeiterzufriedenheit & Produktivität durch guten Kaffee (Studienlage, aktuell)
7. Vollautomat vs. Siebträger vs. Kapsel im Gewerbe
8. Checkliste: den richtigen Anbieter/Service-Vertrag wählen

Jeder Spoke: Frontmatter, FAQ-Abschnitt, interne Links zu Herstellern + CTA → Konfigurator.

---

## Block 3 — Kern- & Funktionsseiten

| Seite | Aktion | Struktur / Hinweis |
|-------|--------|--------------------|
| **Startseite** | behalten + auffrischen | Hero + Konfigurator + Vorteile (kaufen/leasen) + Hersteller-Trust + Newsletter |
| **Beratung** | eigene Lead-LP **+** Konfigurator | LP rahmt den Konfigurator mit Ablauf/Trust/„so funktioniert's", kein Duplikat |
| **Modelle** | redaktionelle Übersicht (1 Seite) | Modellklassen erklärt, keine Einzel-Datensätze; verlinkt Hersteller + Konfigurator |
| **FAQ** | behalten | Akkordeon (details/summary, 0 JS) + FAQPage-Schema |
| **Kontakt** | behalten | Formular → Pages Function (kein Lead-Wizard) |
| **Impressum** | behalten | aktualisieren |
| **Datenschutz** | neu fassen | RGM/GreenArrow + Cloudflare + GTM/GA4 als Verarbeiter, DOI dokumentiert |

---

## URL- & SEO-Hinweise

- **`www` wird aufgenommen** (Anfragen müssen angenommen werden) — Routing/Redirect über Cloudflare Pages + DNS.
- Bestands-URLs der Hersteller/Wissensseiten **1:1 spiegeln**, sonst 301-Map → kein Ranking-Verlust.
- Schema.org: Organization, FAQPage, BreadcrumbList, Hersteller als Brand/Product.
- Interne Verlinkung: Hub (Hersteller / Wissenswertes) ↔ Spokes ↔ Konfigurator.

---

## Redaktions-Pipeline (Automatisierung)

1. Themen-/Keyword-Liste (B2B-Fokus) → Gemini Research-Draft
2. Claude Sonnet: Tonalität, E-E-A-T, Faktencheck-Flags
3. Markdown + Frontmatter ins Repo (`src/content/wissenswertes/`)
4. Build (Astro SSG) → Cloudflare Pages
5. Search Console: Indexierung + interne Link-Pflege

---

## Aufwand / Reihenfolge

1. **Pflicht zuerst:** Startseite, Beratung-LP, Datenschutz, FAQ, Impressum, Kontakt
2. **Trust/SEO-Basis:** 12 Hersteller-Seiten (hohe Prio zuerst)
3. **Statistik-Rettung:** veraltete Artikel neu mit aktuellen Zahlen
4. **Satelliten-Ausbau:** 8 neue B2B-Spokes nach Redaktionsfahrplan
