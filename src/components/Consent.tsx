import { useEffect, useState } from 'preact/hooks';
import './Consent.css';

/**
 * Consent-Banner (DSGVO / Google Consent Mode v2, DESIGN.md §11).
 * Default denied wird bereits im <head> gesetzt. Hier nur das Update
 * nach Nutzerentscheidung + Persistenz in First-Party-Cookie (funktional zulässig).
 * Kein Dark-Pattern: Ablehnen gleichwertig sichtbar.
 */

const COOKIE = 'kg_consent';
const MAXAGE = 60 * 60 * 24 * 180; // 180 Tage

type Decision = { statistik: boolean; marketing: boolean; v: number };

function readCookie(): Decision | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (!m) return null;
  try {
    const d = JSON.parse(decodeURIComponent(m[1]));
    if (typeof d.statistik === 'boolean' && typeof d.marketing === 'boolean') return d;
  } catch {
    /* ignore */
  }
  return null;
}

function writeCookie(d: Decision) {
  document.cookie =
    `${COOKIE}=${encodeURIComponent(JSON.stringify(d))}; path=/; max-age=${MAXAGE}; SameSite=Lax`;
}

function applyConsent(d: Decision) {
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      analytics_storage: d.statistik ? 'granted' : 'denied',
      ad_storage: d.marketing ? 'granted' : 'denied',
      ad_user_data: d.marketing ? 'granted' : 'denied',
      ad_personalization: d.marketing ? 'granted' : 'denied',
    });
  }
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event: 'consent_update', statistik: d.statistik, marketing: d.marketing });
}

export default function Consent() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [statistik, setStatistik] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readCookie();
    if (existing) {
      applyConsent(existing);
    } else {
      setOpen(true);
    }
    // Re-Öffnen über Footer-Link / Event ermöglichen
    const reopen = () => { setDetails(true); setOpen(true); };
    window.addEventListener('kg:open-consent', reopen);
    return () => window.removeEventListener('kg:open-consent', reopen);
  }, []);

  const decide = (d: Decision) => {
    writeCookie(d);
    applyConsent(d);
    setOpen(false);
    setDetails(false);
  };

  if (!open) return null;

  return (
    <div class="cc" role="dialog" aria-label="Datenschutz-Einstellungen" aria-modal="false">
      <div class="cc-panel">
        <div class="cc-text">
          <strong>Datenschutz &amp; Cookies</strong>
          <p>
            Wir nutzen funktional notwendige Cookies sowie – nur mit Ihrer Zustimmung –
            Statistik- und Marketing-Dienste (z. B. Google Analytics via Tag Manager).
            Mehr in der <a href="/datenschutz/">Datenschutzerklärung</a>.
          </p>

          {details && (
            <div class="cc-toggles">
              <label class="cc-toggle cc-fixed">
                <input type="checkbox" checked disabled />
                <span><b>Funktional</b> – für den Betrieb der Seite notwendig (immer aktiv).</span>
              </label>
              <label class="cc-toggle">
                <input type="checkbox" checked={statistik} onChange={(e) => setStatistik((e.target as HTMLInputElement).checked)} />
                <span><b>Statistik</b> – anonyme Reichweitenmessung (Google Analytics 4).</span>
              </label>
              <label class="cc-toggle">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing((e.target as HTMLInputElement).checked)} />
                <span><b>Marketing</b> – Remarketing &amp; Conversion-Messung.</span>
              </label>
            </div>
          )}
        </div>

        <div class="cc-actions">
          {details ? (
            <button type="button" class="cc-btn cc-primary" onClick={() => decide({ statistik, marketing, v: 1 })}>
              Auswahl speichern
            </button>
          ) : (
            <>
              <button type="button" class="cc-btn cc-primary" onClick={() => decide({ statistik: true, marketing: true, v: 1 })}>
                Akzeptieren
              </button>
              <button type="button" class="cc-btn cc-secondary" onClick={() => decide({ statistik: false, marketing: false, v: 1 })}>
                Ablehnen
              </button>
            </>
          )}
          <button type="button" class="cc-btn cc-ghost" onClick={() => setDetails((v) => !v)}>
            {details ? 'Weniger' : 'Einstellungen'}
          </button>
        </div>
      </div>
    </div>
  );
}
