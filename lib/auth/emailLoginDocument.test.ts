import { describe, expect, it, vi } from 'vitest';
import { runInNewContext } from 'node:vm';
import { emailLoginDocument } from './emailLoginDocument';

async function openLink(href: string, response = { isVerified: true, returnTo: '/avatar?code=SALE#plans' }, ok = true) {
    const url = new URL(href);
    const elements = new Map(['title', 'status', 'back'].map((id) => [id, { textContent: '', href: '/' }]));
    const replace = vi.fn();
    const location = { pathname: url.pathname, search: url.search, hash: url.hash, hostname: url.hostname, origin: url.origin, replace };
    const history = { replaceState: vi.fn(() => { location.hash = ''; }) };
    const fetch = vi.fn(async (..._args: unknown[]) => {
        expect(location.hash).toBe('');
        return { ok, json: async () => response };
    });
    const html = emailLoginDocument('test-nonce');
    const script = html.match(/<script nonce="test-nonce">([\s\S]*?)<\/script>/)![1];
    await runInNewContext(script, {
        location, history, fetch, URL, URLSearchParams,
        document: { documentElement: { lang: 'cs' }, getElementById: (id: string) => elements.get(id) },
    });
    return { fetch, history, replace, elements };
}

describe('email callback browser flow', () => {
    it('posts a fragment credential once, removes it first, then returns to the exact page in the new browser', async () => {
        const opened = await openLink('https://pavolhejny.com/api/auth/email?flow=avatar&next=%2Favatar%3Fcode%3DSALE%23plans#token_hash=' + 'a'.repeat(64));
        expect(opened.fetch).toHaveBeenCalledTimes(1);
        const [path, options] = opened.fetch.mock.calls[0] as [string, { body: string; method: string }];
        expect(path).toBe('/api/auth/email');
        expect(options.method).toBe('POST');
        expect(JSON.parse(options.body)).toEqual({ flow: 'avatar', next: '/avatar?code=SALE#plans', tokenHash: 'a'.repeat(64) });
        expect(opened.replace).toHaveBeenCalledWith('https://pavolhejny.com/avatar?code=SALE#plans');
    });
    it('does not attempt authentication for a prefetched URL without the fragment', async () => {
        const opened = await openLink('https://ptbk.io/api/auth/email?flow=billing&next=%2Fcs');
        expect(opened.fetch).not.toHaveBeenCalled();
        expect(opened.replace).not.toHaveBeenCalled();
    });
    it('shows recoverable errors with a link to the initiating page and no automatic retry', async () => {
        const opened = await openLink('https://ptbk.io/api/auth/email?flow=billing&next=%2Fcs#token_hash=' + 'a'.repeat(64), { isVerified: false, returnTo: '' }, false);
        expect(opened.fetch).toHaveBeenCalledTimes(1);
        expect(opened.replace).not.toHaveBeenCalled();
        expect(opened.elements.get('back')!.href).toBe('https://ptbk.io/cs');
        expect(opened.elements.get('status')!.textContent).toContain('vypršela');
    });
});
