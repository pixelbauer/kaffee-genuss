import { useEffect, useRef, useState } from 'preact/hooks';
import './Configurator.css';

/**
 * Lead-Konfigurator (Herzstück) – 7 Schritte, 1:1 vom Bestand.
 * State in-memory (kein localStorage). Auto-Advance bei Einfachauswahl.
 * Submit → POST /api/lead (Cloudflare Pages Function → RGM/GreenArrow).
 * Tracking via dataLayer: lead_step_view, lead_step_complete, lead_submit.
 */

type Country = 'DE' | 'AT' | 'CH' | 'XX';

interface State {
  geraeteart: string;
  einsatzort: string;
  verbrauch: string;
  getraenke: string[];
  anzahl: string;
  plz: string;
  land: Country;
  anrede: string;
  vorname: string;
  nachname: string;
  firma: string;
  email: string;
  consent: boolean;
}

const EMPTY: State = {
  geraeteart: '',
  einsatzort: '',
  verbrauch: '',
  getraenke: [],
  anzahl: '',
  plz: '',
  land: 'DE',
  anrede: '',
  vorname: '',
  nachname: '',
  firma: '',
  email: '',
  consent: false,
};

const TOTAL = 7;

const OPT = {
  geraeteart: ['Tischgerät', 'Standgerät', 'Weiß nicht'],
  einsatzort: ['Kleingastronomie', 'Gastronomie / Hotellerie', 'Büro / Dienstleister', 'Privat'],
  verbrauch: ['bis 50 Tassen', '50–100 Tassen', '100–150 Tassen', 'mehr als 150 Tassen'],
  getraenke: ['Kaffee', 'Espresso', 'Cappuccino', 'Latte / Milchkaffee', 'Kakao', 'Tee / Heißwasser'],
  anzahl: ['1', '2', '3 oder mehr', 'Weiß nicht'],
  anrede: ['Frau', 'Herr', 'Divers', 'keine Angabe'],
} as const;

const PLZ_LEN: Record<Country, number | null> = { DE: 5, AT: 4, CH: 4, XX: null };

function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event, ...payload });
}

function emailValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export default function Configurator() {
  const [step, setStep] = useState(1);
  const [s, setS] = useState<State>({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const mountedAt = useRef<number>(0);
  const honeypot = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === 'idle') track('lead_step_view', { lead_step: step });
  }, [step, status]);

  const set = <K extends keyof State>(key: K, val: State[K]) =>
    setS((prev) => ({ ...prev, [key]: val }));

  const advance = (key: keyof State, val: string) => {
    set(key, val as never);
    track('lead_step_complete', { lead_step: step, [`lead_${key}`]: val });
    // kleines Timeout, damit die Auswahl sichtbar quittiert wird
    window.setTimeout(() => setStep((p) => Math.min(p + 1, TOTAL)), 140);
  };

  const toggleGetraenk = (g: string) => {
    setS((prev) => {
      const has = prev.getraenke.includes(g);
      return { ...prev, getraenke: has ? prev.getraenke.filter((x) => x !== g) : [...prev.getraenke, g] };
    });
  };

  const back = () => {
    setErrors({});
    setStep((p) => Math.max(1, p - 1));
  };

  const validateStep6 = () => {
    const e: Record<string, string> = {};
    const len = PLZ_LEN[s.land];
    if (!s.plz.trim()) e.plz = 'Bitte PLZ angeben.';
    else if (len && !new RegExp(`^\\d{${len}}$`).test(s.plz.trim()))
      e.plz = `PLZ muss ${len} Ziffern haben.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep7 = () => {
    const e: Record<string, string> = {};
    if (!s.nachname.trim()) e.nachname = 'Bitte Namen angeben.';
    if (!emailValid(s.email)) e.email = 'Bitte gültige E-Mail angeben.';
    if (!s.consent) e.consent = 'Bitte der Datenverarbeitung zustimmen.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validateStep7()) return;
    setStatus('sending');
    track('lead_submit', {
      lead_einsatzort: s.einsatzort,
      lead_verbrauch: s.verbrauch,
      lead_land: s.land,
    });
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...s,
          // Bot-Schutz
          website: honeypot.current?.value ?? '',
          elapsedMs: Date.now() - mountedAt.current,
          source: 'configurator',
          pagePath: window.location.pathname,
        }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      setStatus('done');
      track('lead_success');
    } catch {
      setStatus('error');
    }
  };

  // ── Render-Helfer ───────────────────────────────────────────────
  const Choices = (key: keyof State, opts: readonly string[]) => (
    <div class="cfg-choices">
      {opts.map((o) => (
        <button
          type="button"
          class={`cfg-choice${s[key] === o ? ' sel' : ''}`}
          aria-pressed={s[key] === o}
          onClick={() => advance(key, o)}
        >
          {o}
        </button>
      ))}
    </div>
  );

  if (status === 'done') {
    return (
      <div class="cfg" role="region" aria-label="Konfigurator – Anfrage gesendet">
        <div class="cfg-done cfg-fade">
          <div class="cfg-mark" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3>Danke für Ihr Interesse!</h3>
          <p>
            Ihre Anfrage ist eingegangen. Wir vergleichen passende Anbieter und melden uns
            kurzfristig per E-Mail bei Ihnen – kostenlos & unverbindlich.
          </p>
        </div>
      </div>
    );
  }

  const isMulti = step === 4;
  const isContact = step === 7;
  const isPlz = step === 6;
  const nextDisabled =
    (isMulti && s.getraenke.length === 0) || status === 'sending';

  return (
    <div class="cfg" role="region" aria-label="Kaffeevollautomat-Konfigurator">
      <div class="cfg-progress" aria-hidden="true">
        {Array.from({ length: TOTAL }, (_, i) => (
          <i class={i < step ? 'on' : ''} />
        ))}
      </div>
      <div class="cfg-stepno">Schritt {step} / {TOTAL}</div>

      <div class="cfg-fade" key={step}>
        {step === 1 && (
          <>
            <h3 class="cfg-q">Welche Geräteart kommt für Sie infrage?</h3>
            {Choices('geraeteart', OPT.geraeteart)}
          </>
        )}
        {step === 2 && (
          <>
            <h3 class="cfg-q">Wo soll der Kaffeeautomat genutzt werden?</h3>
            {Choices('einsatzort', OPT.einsatzort)}
          </>
        )}
        {step === 3 && (
          <>
            <h3 class="cfg-q">Wie viele Tassen pro Tag rechnen Sie ungefähr?</h3>
            {Choices('verbrauch', OPT.verbrauch)}
          </>
        )}
        {step === 4 && (
          <>
            <h3 class="cfg-q">Welche Getränke sollen möglich sein?</h3>
            <div class="cfg-choices">
              {OPT.getraenke.map((g) => (
                <button
                  type="button"
                  class={`cfg-choice multi${s.getraenke.includes(g) ? ' sel' : ''}`}
                  aria-pressed={s.getraenke.includes(g)}
                  onClick={() => toggleGetraenk(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <h3 class="cfg-q">Wie viele Automaten werden benötigt?</h3>
            {Choices('anzahl', OPT.anzahl)}
          </>
        )}
        {step === 6 && (
          <>
            <h3 class="cfg-q">Wo werden die Geräte eingesetzt?</h3>
            <div class="cfg-fields">
              <div class="cfg-field">
                <label for="cfg-land">Land</label>
                <select
                  id="cfg-land"
                  value={s.land}
                  onChange={(e) => set('land', (e.target as HTMLSelectElement).value as Country)}
                >
                  <option value="DE">Deutschland</option>
                  <option value="AT">Österreich</option>
                  <option value="CH">Schweiz</option>
                  <option value="XX">Sonstige</option>
                </select>
              </div>
              <div class={`cfg-field${errors.plz ? ' invalid' : ''}`}>
                <label for="cfg-plz">Postleitzahl</label>
                <input
                  id="cfg-plz"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={s.plz}
                  onInput={(e) => set('plz', (e.target as HTMLInputElement).value)}
                  aria-describedby={errors.plz ? 'cfg-plz-err' : undefined}
                />
                {errors.plz && <div class="cfg-err" id="cfg-plz-err">{errors.plz}</div>}
              </div>
            </div>
          </>
        )}
        {step === 7 && (
          <>
            <h3 class="cfg-q">Wohin dürfen wir die Angebote senden?</h3>
            {status === 'error' && (
              <div class="cfg-alert" role="alert">
                Da ist etwas schiefgelaufen. Bitte versuchen Sie es erneut oder
                schreiben Sie uns über das Kontaktformular.
              </div>
            )}
            <div class="cfg-fields">
              <div class="cfg-row2">
                <div class="cfg-field">
                  <label for="cfg-anrede">Anrede</label>
                  <select
                    id="cfg-anrede"
                    value={s.anrede}
                    onChange={(e) => set('anrede', (e.target as HTMLSelectElement).value)}
                  >
                    <option value="">Bitte wählen</option>
                    {OPT.anrede.map((a) => <option value={a}>{a}</option>)}
                  </select>
                </div>
                <div class="cfg-field">
                  <label for="cfg-firma">Firma (optional)</label>
                  <input
                    id="cfg-firma"
                    type="text"
                    autoComplete="organization"
                    value={s.firma}
                    onInput={(e) => set('firma', (e.target as HTMLInputElement).value)}
                  />
                </div>
              </div>
              <div class="cfg-row2">
                <div class="cfg-field">
                  <label for="cfg-vorname">Vorname</label>
                  <input
                    id="cfg-vorname"
                    type="text"
                    autoComplete="given-name"
                    value={s.vorname}
                    onInput={(e) => set('vorname', (e.target as HTMLInputElement).value)}
                  />
                </div>
                <div class={`cfg-field${errors.nachname ? ' invalid' : ''}`}>
                  <label for="cfg-nachname">Nachname</label>
                  <input
                    id="cfg-nachname"
                    type="text"
                    autoComplete="family-name"
                    value={s.nachname}
                    onInput={(e) => set('nachname', (e.target as HTMLInputElement).value)}
                    aria-describedby={errors.nachname ? 'cfg-nachname-err' : undefined}
                  />
                  {errors.nachname && <div class="cfg-err" id="cfg-nachname-err">{errors.nachname}</div>}
                </div>
              </div>
              <div class={`cfg-field${errors.email ? ' invalid' : ''}`}>
                <label for="cfg-email">E-Mail</label>
                <input
                  id="cfg-email"
                  type="email"
                  autoComplete="email"
                  value={s.email}
                  onInput={(e) => set('email', (e.target as HTMLInputElement).value)}
                  aria-describedby={errors.email ? 'cfg-email-err' : undefined}
                />
                {errors.email && <div class="cfg-err" id="cfg-email-err">{errors.email}</div>}
              </div>

              {/* Honeypot */}
              <div class="cfg-hp" aria-hidden="true">
                <label>
                  Website (bitte leer lassen)
                  <input ref={honeypot} type="text" tabIndex={-1} autoComplete="off" name="website" />
                </label>
              </div>

              <label class={`cfg-consent${errors.consent ? ' invalid' : ''}`}>
                <input
                  type="checkbox"
                  checked={s.consent}
                  onChange={(e) => set('consent', (e.target as HTMLInputElement).checked)}
                />
                <span>
                  Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage und
                  zur Kontaktaufnahme verarbeitet werden. Details in der{' '}
                  <a href="/datenschutz/" target="_blank" rel="noopener">Datenschutzerklärung</a>.
                </span>
              </label>
              {errors.consent && <div class="cfg-err">{errors.consent}</div>}
            </div>
          </>
        )}
      </div>

      <div class="cfg-foot">
        <button type="button" class="cfg-back" onClick={back} disabled={step === 1}>
          ← zurück
        </button>

        {isContact ? (
          <button type="button" class="cfg-next" onClick={submit} disabled={status === 'sending'}>
            {status === 'sending' ? 'Wird gesendet …' : 'Angebote anfordern'}
          </button>
        ) : isMulti || isPlz ? (
          <button
            type="button"
            class="cfg-next"
            disabled={nextDisabled}
            onClick={() => {
              if (isPlz && !validateStep6()) return;
              if (isMulti) track('lead_step_complete', { lead_step: 4, lead_getraenke: s.getraenke.join(',') });
              setStep((p) => Math.min(p + 1, TOTAL));
            }}
          >
            Weiter
          </button>
        ) : (
          <span class="cfg-micro">in 60 Sekunden · kostenlos</span>
        )}
      </div>
    </div>
  );
}
