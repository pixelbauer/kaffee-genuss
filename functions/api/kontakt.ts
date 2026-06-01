// POST /api/kontakt — natives Kontaktformular (0 JS). Validiert, schützt gegen Bots,
// reicht die Nachricht weiter und leitet per 303 zurück auf /kontakt/?sent=1.
import {
  type PagesFn,
  json,
  emailValid,
  nonEmpty,
  rateLimited,
  clientIp,
  forwardToRgm,
} from '../_lib/shared';

function redirect(to: string) {
  return new Response(null, { status: 303, headers: { Location: to } });
}

export const onRequestPost: PagesFn = async ({ request, env }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // Honeypot
  if (nonEmpty(form.get('website'))) {
    console.warn('[kontakt] verworfen (honeypot)');
    return redirect('/kontakt/?sent=1'); // stiller Erfolg
  }

  if (await rateLimited(env, clientIp(request), 'kontakt', 5, 600)) {
    return redirect('/kontakt/?error=rate');
  }

  const email = String(form.get('email') ?? '');
  const name = String(form.get('name') ?? '');
  const consent = form.get('consent');
  if (!emailValid(email) || !nonEmpty(name) || consent == null) {
    return redirect('/kontakt/?error=validation');
  }

  const payload = {
    type: 'contact',
    anrede: form.get('anrede') ?? '',
    firma: form.get('firma') ?? '',
    name,
    email: email.trim(),
    nachricht: String(form.get('nachricht') ?? ''),
    receivedAt: new Date().toISOString(),
  };

  // Kontaktnachrichten an dedizierten Endpoint oder ersatzweise an den Lead-Endpoint.
  const url = env.CONTACT_FORWARD_URL ?? env.RGM_LEAD_URL;
  const ok = await forwardToRgm(url, env.RGM_API_KEY, payload);
  if (!ok) return redirect('/kontakt/?error=upstream');

  return redirect('/kontakt/?sent=1');
};
