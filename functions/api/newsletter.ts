// POST /api/newsletter — Newsletter-Anmeldung mit Double-Opt-In über RGM/GreenArrow.
import {
  type PagesFn,
  json,
  emailValid,
  botReason,
  rateLimited,
  clientIp,
  forwardToRgm,
} from '../_lib/shared';

export const onRequestPost: PagesFn = async ({ request, env }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  const bot = botReason(body);
  if (bot) {
    console.warn('[newsletter] verworfen (bot):', bot);
    return json({ ok: true }, 200);
  }

  if (await rateLimited(env, clientIp(request), 'newsletter', 5, 600)) {
    return json({ ok: false, error: 'rate_limited' }, 429);
  }

  if (!emailValid(body.email)) return json({ ok: false, error: 'validation', fields: ['email'] }, 422);
  if (body.consent !== true) return json({ ok: false, error: 'validation', fields: ['consent'] }, 422);

  // RGM erwartet i.d.R. eine Listen-ID + E-Mail; DOI-Versand triggert RGM serverseitig.
  const payload = {
    type: 'newsletter_subscribe',
    listId: env.RGM_NEWSLETTER_LIST_ID ?? null,
    email: String(body.email).trim(),
    doubleOptIn: true,
    source: body.source ?? 'newsletter',
    page: body.pagePath ?? '',
    receivedAt: new Date().toISOString(),
  };

  const ok = await forwardToRgm(env.RGM_NEWSLETTER_URL, env.RGM_API_KEY, payload);
  if (!ok) return json({ ok: false, error: 'upstream' }, 502);

  return json({ ok: true }, 200);
};
