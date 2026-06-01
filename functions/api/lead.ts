// POST /api/lead — nimmt die Konfigurator-Anfrage entgegen, prüft serverseitig,
// schützt gegen Bots und reicht den Lead an RGM/GreenArrow weiter.
import {
  type PagesFn,
  json,
  emailValid,
  nonEmpty,
  botReason,
  rateLimited,
  clientIp,
  forwardToRgm,
} from '../_lib/shared';

const PLZ_LEN: Record<string, number> = { DE: 5, AT: 4, CH: 4 };

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

  // Payload-Mapping für RGM/GreenArrow (Felder final mit Tim abzustimmen).
  const getraenke = Array.isArray(body.getraenke) ? (body.getraenke as string[]) : [];
  const payload = {
    type: 'lead',
    source: body.source ?? 'configurator',
    page: body.pagePath ?? '',
    contact: {
      anrede: body.anrede ?? '',
      vorname: body.vorname ?? '',
      nachname: body.nachname,
      firma: body.firma ?? '',
      email: String(body.email).trim(),
    },
    requirements: {
      geraeteart: body.geraeteart ?? '',
      einsatzort: body.einsatzort ?? '',
      verbrauch: body.verbrauch ?? '',
      getraenke,
      anzahl: body.anzahl ?? '',
      plz,
      land,
    },
    consent: true,
    receivedAt: new Date().toISOString(),
  };

  const ok = await forwardToRgm(env.RGM_LEAD_URL, env.RGM_API_KEY, payload);
  if (!ok) return json({ ok: false, error: 'upstream' }, 502);

  return json({ ok: true }, 200);
};
