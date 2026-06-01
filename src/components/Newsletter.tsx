import { useRef, useState } from 'preact/hooks';
import './Newsletter.css';
import { newsletterSignupUrl, NEWSLETTER_API } from '@/lib/newsletter';

/**
 * Newsletter-Anmeldung (Double-Opt-In, direkt gegen die Rhein-Digital-API).
 * E-Mail → POST {source_key, email} an api.rhein-digital.de/newsletter/signup.
 * Anbieter versendet die Bestätigungsmail; Ziel des Links ist /newsletter/bestaetigen/.
 * Client-seitiger Honeypot + Consent-Checkbox. dataLayer: newsletter_signup.
 */
function emailValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}
function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event, ...payload });
}

interface Props {
  variant?: 'block' | 'inline';
}

export default function Newsletter({ variant = 'block' }: Props) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const honeypot = useRef<HTMLInputElement>(null);
  const mountedAt = useRef<number>(typeof window !== 'undefined' ? Date.now() : 0);

  const submit = async (e: Event) => {
    e.preventDefault();
    if (!emailValid(email)) { setError('Bitte gültige E-Mail angeben.'); return; }
    if (!consent) { setError('Bitte der Verarbeitung zustimmen.'); return; }
    // Client-seitiger Honeypot: stiller Erfolg, ohne den Anbieter zu kontaktieren.
    if ((honeypot.current?.value ?? '') !== '' || Date.now() - mountedAt.current < 1500) {
      setStatus('done');
      return;
    }
    setError('');
    setStatus('sending');
    track('newsletter_signup');
    try {
      const res = await fetch(newsletterSignupUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_key: NEWSLETTER_API.sourceKey, email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { status?: number; msg?: string };
      if (data.status === 1) {
        setStatus('done');
      } else {
        setError(
          data.msg === 'invalid email'
            ? 'Diese E-Mail-Adresse wurde abgelehnt, bitte prüfen.'
            : '',
        );
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div class={`nl nl-${variant} nl-done`} role="status">
        <strong>Fast geschafft!</strong>
        <p>Bitte bestätigen Sie die Anmeldung über den Link in der E-Mail, die wir Ihnen gerade gesendet haben.</p>
      </div>
    );
  }

  return (
    <form class={`nl nl-${variant}`} onSubmit={submit} noValidate>
      <div class="nl-fields">
        <div class="nl-field">
          <label for="nl-email" class="nl-vh">E-Mail-Adresse</label>
          <input
            id="nl-email"
            type="email"
            placeholder="ihre@firma.de"
            autoComplete="email"
            value={email}
            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
            aria-invalid={!!error}
          />
        </div>
        <button type="submit" class="nl-btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'Senden …' : 'Abonnieren'}
        </button>
      </div>

      <div class="nl-hp" aria-hidden="true">
        <input ref={honeypot} type="text" tabIndex={-1} autoComplete="off" name="website" />
      </div>

      <label class="nl-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent((e.target as HTMLInputElement).checked)} />
        <span>
          Ich möchte den Newsletter erhalten und stimme der{' '}
          <a href="/datenschutz/">Datenschutzerklärung</a> zu. Abmeldung jederzeit möglich.
        </span>
      </label>

      {error && <p class="nl-err" role="alert">{error}</p>}
      {status === 'error' && <p class="nl-err" role="alert">Senden fehlgeschlagen. Bitte später erneut versuchen.</p>}
    </form>
  );
}
