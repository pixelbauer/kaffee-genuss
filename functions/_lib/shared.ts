// Gemeinsame Helfer für die Pages Functions (Bot-Schutz, Validierung, RGM-Forwarding).
// Unterstrich-Präfix (_lib) → wird von Cloudflare Pages NICHT als Route ausgeliefert.

export interface Env {
  // RGM / GreenArrow – serverseitige Secrets (in Cloudflare Pages → Settings → Variables).
  RGM_LEAD_URL?: string;
  RGM_NEWSLETTER_URL?: string;
  RGM_NEWSLETTER_CONFIRM_URL?: string;
  RGM_API_KEY?: string;
  RGM_NEWSLETTER_LIST_ID?: string;
  // Empfänger für Kontaktnachrichten (optional, falls über RGM/Transactional versendet)
  CONTACT_FORWARD_URL?: string;
  // Optionales KV-Binding für Rate-Limiting
  RATE_LIMIT?: KVNamespace;
}

// Minimaler KV-Typ, damit wir ohne @cloudflare/workers-types auskommen.
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

// Eigener, schlanker Handler-Typ – vermeidet die Abhängigkeit von @cloudflare/workers-types.
export type PagesContext = {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
  params: Record<string, string>;
};
export type PagesFn = (ctx: PagesContext) => Response | Promise<Response>;

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

export function emailValid(v: unknown): v is string {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function nonEmpty(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * Bot-Heuristik analog zur bestehenden Logik (Honeypot + Burst-/Zeit-Erkennung).
 * Gibt einen Grund zurück, wenn die Einsendung als Bot gewertet wird, sonst null.
 */
export function botReason(body: Record<string, unknown>, minMs = 1500): string | null {
  // 1) Honeypot: das versteckte Feld "website" muss leer sein.
  if (nonEmpty(body.website)) return 'honeypot';
  // 2) Zeit-Trap: ein menschliches Ausfüllen dauert länger als wenige Millisekunden.
  const elapsed = Number(body.elapsedMs);
  if (Number.isFinite(elapsed) && elapsed > 0 && elapsed < minMs) return 'too_fast';
  return null;
}

/**
 * Schlankes IP-basiertes Rate-Limit über KV (falls gebunden). Ohne KV: no-op.
 * Erlaubt `limit` Anfragen pro `windowSec`-Fenster je IP + Bucket.
 */
export async function rateLimited(
  env: Env,
  ip: string,
  bucket: string,
  limit = 5,
  windowSec = 600,
): Promise<boolean> {
  if (!env.RATE_LIMIT || !ip) return false;
  const key = `rl:${bucket}:${ip}`;
  try {
    const cur = Number((await env.RATE_LIMIT.get(key)) ?? '0');
    if (cur >= limit) return true;
    await env.RATE_LIMIT.put(key, String(cur + 1), { expirationTtl: windowSec });
    return false;
  } catch {
    return false; // im Zweifel nicht blockieren
  }
}

export function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    ''
  );
}

/**
 * Leitet einen Payload an RGM/GreenArrow weiter, sofern URL + Key konfiguriert sind.
 * Ohne Konfiguration (z. B. lokal/Preview) wird die Einsendung akzeptiert und nur geloggt,
 * damit der Flow ende-zu-ende testbar bleibt. Gibt true bei Erfolg/Stub zurück.
 */
export async function forwardToRgm(url: string | undefined, apiKey: string | undefined, payload: unknown): Promise<boolean> {
  if (!url) {
    console.warn('[RGM] kein Endpoint konfiguriert – Einsendung wird nur geloggt (Stub-Modus).');
    console.log('[RGM] payload:', JSON.stringify(payload));
    return true;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('[RGM] Upstream-Fehler', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[RGM] Forwarding fehlgeschlagen', err);
    return false;
  }
}

/**
 * Schließt den Double-Opt-In bei RGM/GreenArrow ab (Bestätigungslink aus der DOI-Mail).
 * Anders als forwardToRgm wird die Upstream-Antwort ausgewertet, damit die
 * Bestätigungsseite zwischen "neu bestätigt", "schon bestätigt" und "Link ungültig"
 * unterscheiden kann. Ohne Konfiguration (lokal/Preview): Stub-Erfolg, damit der
 * Flow ende-zu-ende testbar bleibt.
 */
export type ConfirmResult =
  | { ok: true; alreadyConfirmed: boolean }
  | { ok: false; reason: 'invalid' | 'upstream' };

export async function confirmWithRgm(
  url: string | undefined,
  apiKey: string | undefined,
  token: string,
): Promise<ConfirmResult> {
  if (!url) {
    console.warn('[RGM] kein Confirm-Endpoint konfiguriert - Bestätigung wird gestubbt.');
    console.log('[RGM] confirm token:', token);
    return { ok: true, alreadyConfirmed: false };
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ type: 'newsletter_confirm', token }),
    });
    // 404/410/422 → Token unbekannt, abgelaufen oder bereits verbraucht.
    if (res.status === 404 || res.status === 410 || res.status === 422) {
      return { ok: false, reason: 'invalid' };
    }
    if (!res.ok) {
      console.error('[RGM] Confirm-Upstream-Fehler', res.status, await res.text().catch(() => ''));
      return { ok: false, reason: 'upstream' };
    }
    const data = (await res.json().catch(() => ({}))) as {
      already_confirmed?: boolean;
      alreadyConfirmed?: boolean;
    };
    return { ok: true, alreadyConfirmed: !!(data.already_confirmed ?? data.alreadyConfirmed) };
  } catch (err) {
    console.error('[RGM] Confirm fehlgeschlagen', err);
    return { ok: false, reason: 'upstream' };
  }
}
