// POST /api/lead — nimmt die Konfigurator-Anfrage entgegen, prüft serverseitig,
// schützt gegen Bots und reicht den Lead an die Rhein-Digital-API weiter.
// Quelle "kaffeemaschinen" (ohne Double-Opt-In, Lead sofort erfasst).
import {
  type PagesFn,
  json,
  emailValid,
  nonEmpty,
  botReason,
  rateLimited,
  clientIp,
  submitLeadToRhein,
  RHEIN_LEAD_DEFAULT_URL,
} from '../_lib/shared';

const PLZ_LEN: Record<string, number> = { DE: 5, AT: 4, CH: 4 };

// Fest im Code, nie vom Client wählbar (Anti-Spoofing-Vorgabe der Rhein-Digital-Doku).
const LEAD_SOURCE_KEY = 'kaffeemaschinen';

export const onRequestPost: PagesFn = async ({ request, env }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // Bot-Schutz: Honeypot + Zeit-Trap. Stiller 200, um Bots keine Signale zu geben.
  const bot = botReason(body);
  if (bot) {
    console.warn('[lead] verworfen (bot):', bot);
    return json({ ok: true }, 200);
  }

  // Rate-Limit pro IP
  if (await rateLimited(env, clientIp(request), 'lead', 5, 600)) {
    return json({ ok: false, error: 'rate_limited' }, 429);
  }

  // Serverseitige Validierung (nie dem Client allein vertrauen)
  const errors: string[] = [];
  if (!emailValid(body.email)) errors.push('email');
  if (!nonEmpty(body.nachname)) errors.push('nachname');
  if (body.consent !== true) errors.push('consent');

  const land = String(body.land ?? 'DE');
  const plz = String(body.plz ?? '').trim();
  const need = PLZ_LEN[land];
  if (need && !new RegExp(`^\\d{${need}}$`).test(plz)) errors.push('plz');

  if (errors.length) {
    return json({ ok: false, error: 'validation', fields: errors }, 422);
  }

  // Mapping auf das Rhein-Digital-Lead-Schema der Quelle "kaffeemaschinen".
  // Nicht im Schema definierte Konfigurator-Antworten wandern in das message-Feld.
  const getraenke = Array.isArray(body.getraenke) ? (body.getraenke as string[]) : [];
  const machineType = nonEmpty(body.geraeteart) ? String(body.geraeteart) : 'Weiß nicht';
  const message = [
    body.einsatzort ? `Einsatzort: ${body.einsatzort}` : null,
    body.verbrauch ? `Verbrauch: ${body.verbrauch}` : null,
    getraenke.length ? `Getränke: ${getraenke.join(', ')}` : null,
    plz || land ? `Standort: ${`${plz} ${land}`.trim()}` : null,
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 2000);

  const payload = {
    source_key: LEAD_SOURCE_KEY,
    email: String(body.email).trim(),
    civility: String(body.anrede ?? ''),
    first_name: String(body.vorname ?? ''),
    last_name: String(body.nachname),
    company: String(body.firma ?? ''),
    machine_type: machineType.slice(0, 120),
    quantity: String(body.anzahl ?? '').slice(0, 20),
    message,
  };

  const url = env.RHEIN_LEAD_URL || RHEIN_LEAD_DEFAULT_URL;
  const result = await submitLeadToRhein(url, payload, request);
  if (!result.ok) return json({ ok: false, error: result.error }, result.status);

  return json({ ok: true }, 200);
};
