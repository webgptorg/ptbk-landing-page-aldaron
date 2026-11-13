const KEY = 'promptbook-referral-v1';
export function referralFromBrowser(): string {
    if (typeof window === 'undefined') return '';
    const supplied = new URL(window.location.href).searchParams.get('ref');
    if (supplied && /^[A-Za-z0-9_-]{1,80}$/.test(supplied)) {
        try {
            localStorage.setItem(KEY, JSON.stringify({ code: supplied, expires: Date.now() + 90 * 86400_000 }));
        } catch {
            /* Manual entry remains usable. */
        }
        return supplied;
    }
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
        if (!parsed || typeof parsed !== 'object' || !('expires' in parsed) || !('code' in parsed)) return '';
        const record = parsed as { expires: unknown; code: unknown };
        return typeof record.expires === 'number' &&
            record.expires > Date.now() &&
            typeof record.code === 'string' &&
            /^[A-Za-z0-9_-]{1,80}$/.test(record.code)
            ? record.code
            : '';
    } catch {
        return '';
    }
}
