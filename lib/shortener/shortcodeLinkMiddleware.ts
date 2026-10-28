import { isShortcodeLinkAvailableOnHostname } from './shortcodeLinkDomains';

/** Edge-safe, read-only existence check. Unknown branded paths must keep their own 404 instead of exposing another site. */
export async function hasPublicShortcodeLinkOnHostname(shortcode: string, hostname: string): Promise<boolean> {
    const databaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!databaseUrl || !key) return false;
    const url = new URL('/rest/v1/ShortcodeLink', databaseUrl);
    url.searchParams.set('select', 'id,domains');
    url.searchParams.set('shortcode', `eq.${shortcode}`);
    url.searchParams.set('limit', '1');
    try {
        const response = await fetch(url, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            cache: 'no-store', signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) return false;
        const rows = await response.json();
        const row: { readonly id?: unknown; readonly domains?: unknown } | null = Array.isArray(rows) ? rows[0] as Record<string, unknown> : null;
        return row != null && typeof row.id === 'number'
            && (row.domains === null || (Array.isArray(row.domains) && row.domains.every((domain: unknown) => typeof domain === 'string')))
            && isShortcodeLinkAvailableOnHostname(row.domains, hostname);
    } catch {
        return false;
    }
}
