// POST /api/newsletter-confirm — schließt den Double-Opt-In ab (Bestätigungslink aus der DOI-Mail).
// Die Bestätigungsseite /newsletter/bestaetigen/ liest den Token aus der URL und ruft diesen Proxy,
// der die Bestätigung serverseitig an RGM/GreenArrow weiterreicht (Secrets bleiben serverseitig).
import {
  type PagesFn,
  json,
  nonEmpty,
  rateLimited,
  clientIp,
  confirmWithRgm,
} from '../_lib/shared';

export const onRequestPost: PagesFn = async ({ request, env }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  const token = String(body.token ?? '').trim();
  if (!nonEmpty(token) || token.length > 256) {
    return json({ ok: false, error: 'validation', fields: ['token'] }, 422);
  }

  if (await rateLimited(env, clientIp(request), 'newsletter-confirm', 10, 600)) {
    return json({ ok: false, error: 'rate_limited' }, 429);
  }

  const result = await confirmWithRgm(env.RGM_NEWSLETTER_CONFIRM_URL, env.RGM_API_KEY, token);
  if (!result.ok) {
    return json({ ok: false, error: result.reason }, result.reason === 'invalid' ? 422 : 502);
  }

  return json({ ok: true, alreadyConfirmed: result.alreadyConfirmed }, 200);
};
