import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEmailLoginRedirect, getEmailLoginOrigin, safeEmailReturnPath } from './emailLogin';
afterEach(() => vi.unstubAllEnvs());

describe('email sign-in origin and destination', () => {
    it.each(['ptbk.io', 'www.ptbk.io', 'pavolhejny.cz', 'www.pavolhejny.cz', 'pavolhejny.com', 'www.pavolhejny.com', 'ai-ta-krajta.cz', 'www.ai-ta-krajta.cz', 'new.ptbk.io'])('keeps the exact approved host %s', (host) => {
        const request = new Request('https://' + host + '/api/example');
        const link = createEmailLoginRedirect(request, 'billing', '/', '/avatar?code=LETNI_30#plans');
        expect(link.origin).toBe('https://' + host);
        expect(link.pathname).toBe('/api/auth/email');
        expect(link.searchParams.get('next')).toBe('/avatar?code=LETNI_30#plans');
    });
    it('keeps the external origin behind a reverse proxy', () => {
        const request = new Request('https://internal.vercel.app/api/example', { headers: { 'x-forwarded-host': 'www.pavolhejny.com' } });
        expect(getEmailLoginOrigin(request)).toBe('https://www.pavolhejny.com');
    });
    it('uses the same-origin initiating page when an older client omits returnTo', () => {
        const request = new Request('https://ptbk.io/api/example', { headers: { referer: 'https://ptbk.io/cs?code=FIRST#trial' } });
        expect(createEmailLoginRedirect(request, 'billing', '/cs/pricing/predplatne').searchParams.get('next')).toBe('/cs?code=FIRST#trial');
    });
    it.each(['https://evil.example/path', '//evil.example/path', '/\\evil.example', 'javascript:alert(1)', '/api/auth/email', 'https://pavolhejny.com/avatar', '/x\nlocation'])('refuses foreign, malformed or recursive return locations: %s', (value) => {
        expect(safeEmailReturnPath(value, 'https://ptbk.io', '/cs')).toBe('/cs');
    });
    it('rejects a forged unknown host before sending an email', () => {
        expect(() => getEmailLoginOrigin(new Request('https://ptbk.io/api', { headers: { host: 'evil.example' } }))).toThrow();
    });
    it('removes stale credentials while retaining ordinary query and section state', () => {
        expect(safeEmailReturnPath('/avatar?code=SALE&login_token=stale#login_token=stale', 'https://pavolhejny.com')).toBe('/avatar?code=SALE');
    });
    it('supports local development without enabling arbitrary hosts in production', () => {
        vi.stubEnv('NODE_ENV', 'development');
        expect(getEmailLoginOrigin(new Request('http://localhost:4009/api'))).toBe('http://localhost:4009');
        vi.stubEnv('NODE_ENV', 'production');
        expect(() => getEmailLoginOrigin(new Request('http://localhost:4009/api'))).toThrow();
    });
});
