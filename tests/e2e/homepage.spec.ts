import { expect, test } from '@playwright/test';

test('Promptbook publishes the root website, the legacy company redirect and independent sitemap entries', async ({
    request,
}) => {
    for (const acceptedLanguages of ['cs-CZ,cs;q=0.9,en;q=0.5', 'en-US,en;q=0.9']) {
        const response = await request.get('/', {
            headers: { 'x-forwarded-host': 'ptbk.io', 'Accept-Language': acceptedLanguages },
            maxRedirects: 0,
        });
        expect(response.status()).toBe(200);
        expect(response.headers().location).toBeUndefined();
        expect(await response.text()).toContain('Teď pracuje pro vás.');
    }
    const companyRedirect = await request.get('/pro-firmy', { maxRedirects: 0 });
    expect(companyRedirect.status()).toBe(301);
    expect(new URL(companyRedirect.headers().location).pathname).toBe('/cs/pro-firmy');
    expect((await request.get('/en/pro-firmy')).status()).toBe(404);
    const sitemap = await request.get('/sitemap.xml', { headers: { 'x-forwarded-host': 'ptbk.io' } });
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    for (const path of ['/cs', '/en', '/cs/cenik', '/en/cenik', '/cs/pro-firmy', '/cs/whitepaper', '/en/whitepaper']) {
        expect(xml).toContain(`<loc>https://ptbk.io${path}</loc>`);
    }
    expect(xml).not.toContain('<loc>https://ptbk.io/en/pro-firmy</loc>');
});
