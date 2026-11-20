import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';
import { GET as docs } from '@/app/api/docs/route';
import { GET as legacyDocs } from '@/app/api/promptbook-billing/app/docs/route';
import { licenseOpenApiDocument } from '@/lib/promptbook-licensing/openapi';

it('provides working canonical routes and scoped key-management links in the public contract', async () => {
    const document = licenseOpenApiDocument();
    expect(document.paths['/api/v1/licenses'].post.operationId).toBe('lookupLicenseByVerifiedEmail');
    expect(document.paths['/api/v1/identity/exchange'].post['x-required-scope']).toBe('identity:exchange');
    expect(document.paths['/api/promptbook-billing/app/licenses'].post.deprecated).toBe(true);
    expect(document.servers).toEqual([{ url: '/', description: expect.any(String) }]);
    expect(document.components.securitySchemes.serverBearer.description).toContain('/admin/api-keys');
    const response = docs();
    const html = await response.text();
    expect(html).toEqual(await legacyDocs().text());
    expect(html).toContain('href="/admin/api-keys"');
    expect(html).toContain('Try it out');
    expect(response.headers.get('content-security-policy')).toContain("connect-src 'self'");
    expect(html).not.toMatch(/https:\/\/.*(?:cdn|unpkg)/);
});

it('enables explicit live calls without persisting authorization or sending it to a foreign server', () => {
    let config: Record<string, unknown> = {};
    const window = { location: { href: 'https://ptbk.io/api/docs', origin: 'https://ptbk.io' } };
    runInNewContext(readFileSync('scripts/license-api/docs.js', 'utf8'), { window, URL, SwaggerUIBundle: (value: Record<string, unknown>) => { config = value; } });
    expect(config.persistAuthorization).toBe(false);
    expect(config.queryConfigEnabled).toBe(false);
    expect(config.validatorUrl).toBeNull();
    expect(config.supportedSubmitMethods).toEqual(['get', 'post']);
    expect(config.requestSnippetsEnabled).toBe(true);
    expect(config.displayRequestDuration).toBe(true);
    const intercept = config.requestInterceptor as (request: { url: string; credentials?: string }) => { credentials: string };
    expect(intercept({ url: '/api/v1/licenses' }).credentials).toBe('omit');
    expect(() => intercept({ url: 'https://other.test/api/v1/licenses' })).toThrow();
    expect(() => intercept({ url: '/api/admin/api-keys' })).toThrow();
    expect(() => intercept({ url: '/api/v1/licenses-other' })).toThrow();
});
