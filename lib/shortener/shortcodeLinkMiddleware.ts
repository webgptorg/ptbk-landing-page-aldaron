import { isShortcodeLinkAvailableOnHostname } from './shortcodeLinkDomains';

/** Edge-safe server lookup. The service key keeps unlisted messages out of the anonymous database registry. */
export async function getPublicShortcodeLinkOnHostname(shortcode: string, hostname: string): Promise<{ readonly isMessage: boolean } | null> {
    const databaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!databaseUrl || !key) return null;
    const url = new URL('/rest/v1/ShortcodeLink', databaseUrl);
    url.searchParams.set('select', 'id,domains,sourceApp');
    url.searchParams.set('shortcode', `eq.${shortcode}`);
    url.searchParams.set('limit', '1');
    try {
        const response = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store', signal: AbortSignal.timeout(3000) });
        if (!response.ok) return null;
        const rows = await response.json();
        const row = Array.isArray(rows) ? rows[0] as { id?: unknown; domains?: unknown; sourceApp?: unknown } | undefined : undefined;
        if (!row || typeof row.id !== 'number' ||
            !(row.domains === null || (Array.isArray(row.domains) && row.domains.every((domain: unknown) => typeof domain === 'string')))
            || !isShortcodeLinkAvailableOnHostname(row.domains as readonly string[] | null, hostname)) return null;
        return { isMessage: row.sourceApp === 'messages' };
    } catch { return null; }
}
export async function hasPublicShortcodeLinkOnHostname(shortcode: string, hostname: string): Promise<boolean> {
    return (await getPublicShortcodeLinkOnHostname(shortcode, hostname)) !== null;
}
