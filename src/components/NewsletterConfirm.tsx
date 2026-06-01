import { useEffect, useState } from 'preact/hooks';
import './NewsletterConfirm.css';
import { newsletterConfirmUrl } from '@/lib/newsletter';

/**
 * Double-Opt-In-Bestätigung: Ziel des Links aus der DOI-Mail.
 * Liest den Hash aus der URL (?h= / ?hash= / ?token=) und löst ihn direkt über
 * api.rhein-digital.de/newsletter/confirm/<hash> ein (analog Heimwerk).
 * dataLayer: newsletter_signup_confirmed.
 */
type State = 'loading' | 'success' | 'already' | 'invalid' | 'error' | 'no-token';

function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event, ...payload });
}

function readToken(): string {
  if (typeof window === 'undefined') return '';
  const p = new URLSearchParams(window.location.search);
  return (p.get('token') ?? p.get('h') ?? p.get('hash') ?? '').trim();
}

const COPY: Record<State, { eyebrow: string; title: string; text: string }> = {
  loading: {
    eyebrow: 'Bestätigung',
    title: 'Wir bestätigen Ihre Anmeldung …',
    text: 'Einen Moment bitte, wir prüfen Ihren Bestätigungslink.',
  },
  success: {
    eyebrow: 'Anmeldung bestätigt',
    title: 'Willkommen, Ihre Anmeldung ist aktiv',
    text: 'Vielen Dank. Ab sofort erhalten Sie unseren Newsletter mit Wissen rund um Kaffeevollautomaten für Büro und Gastro.',
  },
  already: {
    eyebrow: 'Schon bestätigt',
    title: 'Sie sind bereits angemeldet',
    text: 'Diese E-Mail-Adresse ist schon aktiv. Sie müssen nichts weiter tun, die nächste Ausgabe erreicht Sie wie gewohnt.',
  },
  invalid: {
    eyebrow: 'Link ungültig',
    title: 'Bestätigungslink konnte nicht eingelöst werden',
    text: 'Der Link ist nicht mehr gültig oder wurde bereits verwendet. Bitte melden Sie sich einfach erneut an.',
  },
  error: {
    eyebrow: 'Verbindungsfehler',
    title: 'Bestätigung gerade nicht möglich',
    text: 'Bitte prüfen Sie Ihre Internetverbindung und laden Sie die Seite neu.',
  },
  'no-token': {
    eyebrow: 'Kein Code gefunden',
    title: 'Bitte folgen Sie dem Link aus der E-Mail',
    text: 'Diese Seite wird über den Bestätigungslink aus unserer Double-Opt-In-Mail aufgerufen. Keine Mail erhalten? Melden Sie sich erneut an.',
  },
};

function Icon({ kind }: { kind: 'loading' | 'ok' | 'err' }) {
  if (kind === 'ok') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    );
  }
  if (kind === 'err') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    );
  }
  return (
    <svg class="nlc-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function NewsletterConfirm() {
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setState('no-token');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(newsletterConfirmUrl(token), {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as {
          status?: number;
          msg?: string;
          already_confirmed?: boolean;
        };
        if (cancelled) return;
        if (data.status === 1) {
          const already = !!data.already_confirmed;
          setState(already ? 'already' : 'success');
          track('newsletter_signup_confirmed', { already_confirmed: already });
        } else if (data.msg === 'invalid hash' || res.status === 404 || res.status === 410) {
          setState('invalid');
        } else {
          setState('error');
        }
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const copy = COPY[state];
  const kind: 'loading' | 'ok' | 'err' =
    state === 'success' || state === 'already' ? 'ok' : state === 'loading' ? 'loading' : 'err';
  const showRetry = state === 'invalid' || state === 'error' || state === 'no-token';

  return (
    <div class={`nlc nlc-${kind}`} role="status" aria-live="polite">
      <div class="nlc-icon" aria-hidden="true">
        <Icon kind={kind} />
      </div>
      <p class="nlc-eyebrow">{copy.eyebrow}</p>
      <h1 class="nlc-title">{copy.title}</h1>
      <p class="nlc-text">{copy.text}</p>
      {state !== 'loading' && (
        <div class="nlc-actions">
          <a class="nlc-btn" href="/">Zur Startseite</a>
          {showRetry && (
            <a class="nlc-btn nlc-btn-ghost" href="/#newsletter">Erneut anmelden</a>
          )}
        </div>
      )}
    </div>
  );
}
