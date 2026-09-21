import { z } from 'zod';

const VERCEL_API_ORIGIN = 'https://api.vercel.com';
const VERCEL_REQUEST_TIMEOUT_MILLISECONDS = 15_000;

export class VercelApiError extends Error {
    constructor(message: string, readonly status: number) {
        super(message);
        this.name = 'VercelApiError';
    }
}

/** Keep credentials, account scoping, timeouts and response validation in one server-side client. */
export async function requestVercel<Schema extends z.ZodTypeAny>(
    path: string,
    schema: Schema,
    body?: Readonly<Record<string, unknown>>,
): Promise<z.infer<Schema>> {
    const token = process.env.VERCEL_TOKEN?.trim();
    if (!token) {
        throw new VercelApiError('Automatické nasazení vyžaduje nastavení VERCEL_TOKEN na serveru.', 503);
    }

    const url = new URL(path, VERCEL_API_ORIGIN);
    const teamId = process.env.VERCEL_TEAM_ID?.trim();
    if (teamId) url.searchParams.set('teamId', teamId);

    let response: Response;
    let payload: unknown;
    try {
        response = await fetch(url, {
            method: body === undefined ? 'GET' : 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
            cache: 'no-store',
            redirect: 'error',
            signal: AbortSignal.timeout(VERCEL_REQUEST_TIMEOUT_MILLISECONDS),
        });
        payload = await response.json();
    } catch {
        throw new VercelApiError('Vercel neodpovídá. Zkuste akci znovu za chvíli.', 502);
    }

    if (!response.ok) {
        // Provider responses may contain private account details; return only actionable, known messages.
        const message = response.status === 401
            ? 'Vercel odmítl přístupový token (HTTP 401). Ověřte platnost VERCEL_TOKEN na serveru a případně jej obnovte.'
            : response.status === 403
              ? 'Vercel nepovolil přístup (HTTP 403). Ověřte oprávnění VERCEL_TOKEN pro zvolený VERCEL_TEAM_ID a přístup integrace Vercelu k repozitáři na GitHubu.'
              : response.status === 429
                ? 'Vercel nyní omezuje počet požadavků. Zkuste akci znovu za chvíli.'
                : response.status >= 500
                  ? `Vercel vrátil chybu serveru (HTTP ${response.status}). Zkuste akci znovu za chvíli; pokud chyba trvá, ověřte stav služby na vercel-status.com.`
                  : `Vercel požadavek odmítl (HTTP ${response.status}). Zkontrolujte projekt a jeho nastavení ve Vercelu.`;
        throw new VercelApiError(message, response.status);
    }

    const parsed = schema.safeParse(payload);
    if (!parsed.success) throw new VercelApiError('Vercel vrátil neplatnou odpověď.', 502);
    return parsed.data;
}
