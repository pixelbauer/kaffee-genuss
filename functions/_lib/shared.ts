// Gemeinsame Helfer für die Pages Functions (Bot-Schutz, Validierung, RGM-Forwarding).
// Unterstrich-Präfix (_lib) → wird von Cloudflare Pages NICHT als Route ausgeliefert.

export interface Env {
  // Kontaktformular → RGM/GreenArrow (serverseitige Secrets).
  RGM_LEAD_URL?: string;
  RGM_API_KEY?: string;
  CONTACT_FORWARD_URL?: string;
  // Lead-Proxy → Rhein-Digital (kein Auth nötig, Mandant über source_key).
  // Default = dokumentierter Endpoint, per Env überschreibbar (z. B. lokale Mock-URL).
  RHEIN_LEAD_URL?: string;
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

export const RHEIN_LEAD_DEFAULT_URL = 'https://api.rhein-digital.de/lead/signup';

export type RheinResult = { ok: true } | { ok: false; status: number; error: string };

/**
 * Reicht einen Lead an die Rhein-Digital-API weiter. Die API kennt keine Auth
 * (Mandant über source_key), prüft aber Anti-Spoofing über Origin/Referer. Da der
 * Aufruf serverseitig erfolgt, geben wir Origin/Referer des Browser-Requests weiter,
 * damit der Check auch über den Proxy greift. Erfolg = `status: 1` im JSON-Body.
 */
export async function submitLeadToRhein(
  url: string,
  payload: unknown,
  request: Request,
): Promise<RheinResult> {
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(origin ? { Origin: origin } : {}),
        ...(referer ? { Referer: referer } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as { status?: number; msg?: string };
    if (data.status === 1) return { ok: true };

    const msg = typeof data.msg === 'string' ? data.msg : 'upstream';
    console.error('[rhein-lead] abgelehnt', res.status, msg);
    // Eingabefehler → 422 (Client kann korrigieren), sonst Upstream-Fehler → 502.
    const isValidation =
      msg === 'invalid email' ||
      msg === 'unknown source' ||
      msg.startsWith('missing required field');
    return { ok: false, status: isValidation ? 422 : 502, error: msg };
  } catch (err) {
    console.error('[rhein-lead] Forwarding fehlgeschlagen', err);
    return { ok: false, status: 502, error: 'upstream' };
  }
}
