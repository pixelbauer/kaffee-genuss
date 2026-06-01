# Design-System Kaffee-Genuss.net — DESIGN.md

> Visuelle & UX-Leitlinie für den Astro-Relaunch.
> Orientiert am Original (seriöse B2B-Lead-Seite für Kaffeevollautomaten,
> Büro & Gastro), aber moderner, leichter, konversionsstärker.

---

## 1. Design-Prinzipien

1. **Konversion vor Dekoration.** Jede Seite führt sichtbar zum Konfigurator oder Newsletter. CTA nie weiter als einen Scroll entfernt.
2. **Seriös-warm.** B2B-Vertrauen (Büro, Gastro, Hotellerie) kombiniert mit der Wärme/Sinnlichkeit von Kaffee. Nicht verspielt, nicht steril.
3. **Leichtgewichtig.** Kein visueller Ballast, schnelle Wahrnehmung, klare Hierarchie. Passt zur statischen, schnellen Astro-Auslieferung.
4. **Mobile-first.** Entscheider klicken Angebote oft mobil an. Wizard muss am Smartphone reibungslos sein.
5. **Konsistente Tokens.** Keine generischen Tailwind-Grays — ausschließlich definierte Kaffee-Tokens.

---

## 2. Farb-Tokens

Warme Kaffee-Palette, abgeleitet vom Produktkontext. Espresso als Textanker,
Crema/Signal als Konversionsfarben.

```css
:root {
  /* Brand */
  --espresso:   #3B2417;  /* Primärtext, dunkle Flächen, Footer */
  --bohne:      #6F4E37;  /* Sekundär, Überschriften auf hell */
  --crema:      #C8A26A;  /* Akzent, Rahmen, Icons */
  --signal:     #E08A2B;  /* CTA-Buttons, Konversion, Hover-Highlights */
  --signal-700: #C2731C;  /* CTA Hover/Active */

  /* Neutral (warm getönt, KEINE kalten Grays) */
  --milch:      #F7F3EC;  /* Page-Background */
  --sahne:      #FFFFFF;  /* Cards, Wizard-Panel */
  --roest-100:  #EDE6DB;  /* Borders, Trenner */
  --roest-300:  #C9BBA7;  /* Muted Text */
  --roest-700:  #5A4B3A;  /* Body-Text auf hell */

  /* Feedback */
  --success:    #4F7A3F;
  --error:      #B23A2E;
  --focus:      #E08A2B;
}
```

**Kontrast:** Body-Text `--espresso`/`--roest-700` auf `--milch`/`--sahne` → WCAG AA erfüllt. Signal-CTA mit weißer Schrift prüfen (≥ 4.5:1).

---

## 3. Typografie

```css
--font-head: "Fraunces", "Georgia", serif;     /* warm, charaktervoll, Headlines */
--font-body: "Inter", system-ui, sans-serif;   /* klar, neutral, Lesetext + UI */
```

| Stil | Größe (mobil → desktop) | Gewicht | Font |
|------|------------------------|---------|------|
| H1 / Hero | 2rem → 3.25rem | 600 | Fraunces |
| H2 | 1.5rem → 2.25rem | 600 | Fraunces |
| H3 | 1.25rem → 1.5rem | 600 | Fraunces |
| Body | 1rem → 1.0625rem | 400 | Inter |
| Lead/Intro | 1.125rem → 1.25rem | 400 | Inter |
| Label/UI | 0.875rem | 500 | Inter |
| Caption | 0.8125rem | 400 | Inter |

- Line-height Body 1.6, Headlines 1.15.
- `font-display: swap`, nur benötigte Schnitte (Fraunces 600, Inter 400/500/600).
- Max. Textbreite Fließtext: 68ch.

---

## 4. Spacing, Radius, Schatten

```css
--space: 4px;            /* Basisraster: 4/8/12/16/24/32/48/64/96 */
--radius-sm: 2px;
--radius-md: 2px;        /* Cards, Inputs */
--radius-lg: 3px;        /* Wizard-Panel, Hero-Card */
--radius-pill: 2px;      /* CTA-Buttons, Chips (kantig statt rund) */

--shadow-sm: 0 1px 2px rgba(59,36,23,.06);
--shadow-md: 0 6px 20px rgba(59,36,23,.10);
--shadow-lg: 0 16px 48px rgba(59,36,23,.14);  /* Wizard, Modals */
```

Container max-width: `1180px`, Seitenpadding 16px (mobil) / 24px (desktop).

---

## 5. Komponenten

### Buttons
- **Primary (CTA):** `--signal` bg, weiße Schrift, `--radius-pill` (kantig, 2px), Hover `--signal-700`, leichter Lift (`translateY(-1px)` + `--shadow-md`). Beispiel-Label: „Jetzt Angebote vergleichen".
- **Secondary:** transparent, `--bohne` Border + Text, Hover bg `--roest-100`.
- **Ghost/Link:** `--bohne`, unterstrichen bei Hover.
- Min. Touch-Target 44×44px.

### Cards (Hersteller, Modelle, Wissenswertes)
- bg `--sahne`, `--radius-md`, `--shadow-sm`, Hover `--shadow-md` + Crema-Border.
- Bild oben (4:3, AVIF/WebP, lazy), Titel Fraunces, kurzer Teaser, dezenter Pfeil-Link.

### Chips (Auswahl im Wizard / Tags)
- `--radius-pill`, Border `--roest-100`. Aktiv: bg `--signal`, weiße Schrift.

### Trust-Elemente
- Logo-Reihe der Hersteller (AEG, DeLonghi, Jura, Miele, Siemens, WMF …) als grayscale → color bei Hover.
- USP-Badges: „kostenlos", „unverbindlich", „bis zu 3 Angebote", „DE/AT/CH".

---

## 6. Lead-Konfigurator (zentrale UX)

Der wichtigste interaktive Block — bewusst prominent, vertrauensbildend, schnell.

**Layout**
- Eigenes Panel (`--sahne`, `--radius-lg`, `--shadow-lg`) — im Hero oder direkt darunter.
- Fortschrittsanzeige oben: 7 Schritte als Punkt-/Balkenleiste mit aktivem `--signal`.
- Pro Schritt eine klare Frage (H3 Fraunces) + großflächige Auswahl-Buttons/Chips.

**Schritt-Reihenfolge (vom Original übernommen)**
1. Geräteart — Tischgerät / Standgerät / Weiß nicht
2. Einsatzort — Kleingastronomie / Gastronomie-Hotellerie / Büro / Privat
3. Tagesverbrauch — bis 50 / 50–100 / 100–150 / >150 Tassen
4. Getränke — Mehrfachauswahl (Kaffee, Espresso, Latte, Cappuccino, Kakao, Tee)
5. Anzahl Automaten — 1 / 2 / 3+ / Weiß nicht
6. PLZ + Land (DE/AT/CH/Sonstige)
7. Kontaktdaten — Anrede, Name, E-Mail, Telefon + Consent-Checkbox

**Interaktion**
- Auswahl-Klick → Auto-Advance zum nächsten Schritt (außer Mehrfachauswahl/Kontakt).
- Zurück-Button immer sichtbar, State bleibt erhalten.
- Inline-Validierung (E-Mail, PLZ-Format je Land, Pflichtfelder).
- Submit → Lade-State → Danke-Screen mit Eyecatcher („Danke für Ihr Interesse").
- Microcopy senkt Hürde: „kostenlos & unverbindlich", „in 60 Sekunden".

**Mobil**
- Vollbreite Buttons, große Touch-Targets, Schritt füllt Viewport, kein horizontales Scrollen.

**Tracking-Hooks** (dataLayer): `lead_step_view`, `lead_step_complete` (mit Schrittnummer), `lead_submit`.

---

## 7. Seiten-Layouts

### Startseite
1. **Hero** — Headline „Kaffeevollautomaten für Büro & Gastro", Subline „Kostenlos & unverbindlich Angebote vergleichen", Konfigurator-Panel rechts/darunter. Warmes Hintergrundbild (Kaffeemoment, dezent abgedunkelt mit Espresso-Overlay).
2. **USP-Reihe** — 3–4 Badges (kostenlos / unverbindlich / 3 Angebote / DACH).
3. **Vorteile-Content** — die „Kaffeevollautomaten bereichern jedes Büro" / „kaufen oder leasen" Blöcke, neu getextet, mit echten optimierten Bildern.
4. **Hersteller-Logos** — Trust-Reihe.
5. **Newsletter-CTA** — schlanker Block vor Footer.

### Hersteller-/Wissenswertes-Detail
- Breadcrumb → H1 → Lead → Fließtext (68ch) → kontextuelle CTA-Box „Passenden Automaten finden" (Link zum Konfigurator) → verwandte Artikel/Hersteller.

### FAQ
- Akkordeon (Details/Summary, kein JS nötig), `FAQPage`-Schema.

### Footer
- Dunkel (`--espresso`), Logo, Navigation, Kontakt/Impressum/Datenschutz, kurzer Claim.

---

## 8. Bilder & Icons

- Format AVIF mit WebP-Fallback, responsive `srcset`, `loading="lazy"` (außer Hero LCP).
- Bildsprache: echte Kaffeemomente in Büro/Gastro-Kontext, warm, natürlich — keine generischen Stockfotos mit Wasserzeichen-Charakter.
- **Fremd-Bilder von `kaffeevollautomat-mieten.de` lokalisieren** und optimieren.
- Icons: schlankes Line-Set (z. B. Lucide), `--bohne`/`--crema`, 1.5px Stroke.

---

## 9. Motion

- Dezent & funktional: Auswahl-Feedback, Schritt-Übergänge im Wizard (Fade/Slide 150–200ms), Card-Hover-Lift.
- `prefers-reduced-motion` respektieren — Übergänge dann deaktivieren.

---

## 10. Accessibility

- Kontrast WCAG AA (Text ≥ 4.5:1, große Headlines ≥ 3:1).
- Sichtbarer Fokus-Ring (`--focus`, 2px Outline + Offset).
- Wizard tastaturbedienbar, `aria-current` für aktiven Schritt, Fehler mit `aria-describedby`.
- Semantisches HTML, Alt-Texte, Skip-Link.
- Consent-Banner fokussierbar, ohne Layout-Sprünge (kein CLS).

---

## 11. Consent-Banner (Design)

- Unaufdringlich unten, `--sahne` bg, `--shadow-lg`, `--radius-lg`.
- Drei klare Aktionen: **Akzeptieren** (Primary), **Ablehnen** (Secondary), **Einstellungen** (Ghost).
- Kategorien Funktional/Statistik/Marketing als Toggles im Detail-View.
- Kein Dark-Pattern: Ablehnen gleichwertig sichtbar wie Akzeptieren.

---

## 12. Design-Tokens als Tailwind-Config (Auszug)

```js
// tailwind.config.cjs
theme: {
  extend: {
    colors: {
      espresso: '#3B2417', bohne: '#6F4E37', crema: '#C8A26A',
      signal: { DEFAULT: '#E08A2B', 700: '#C2731C' },
      milch: '#F7F3EC', sahne: '#FFFFFF',
      roest: { 100:'#EDE6DB', 300:'#C9BBA7', 700:'#5A4B3A' },
    },
    fontFamily: {
      head: ['Fraunces','Georgia','serif'],
      body: ['Inter','system-ui','sans-serif'],
    },
    borderRadius: { md:'2px', lg:'3px', pill:'2px' },
  }
}
```
