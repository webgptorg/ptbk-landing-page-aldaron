import { expect, test, type APIRequestContext } from '@playwright/test';

const LOCAL_SERVER_URL = new URL(process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4009');

const BRANDED_HOSTS = [
    {
        hostname: 'ai-ta-krajta.cz',
        canonicalHome: 'https://ai-ta-krajta.cz/',
        siteName: 'AI ta Krajta',
        language: 'cs',
        notFoundTitle: 'Stránka nenalezena',
        homeLabel: 'Zpět k podcastu',
        foreignPath: '/cs/pavol',
    },
    {
        hostname: 'pavolhejny.cz',
        canonicalHome: 'https://pavolhejny.cz/',
        siteName: 'Pavol Hejný',
        language: 'cs',
        notFoundTitle: 'Stránka nenalezena',
        homeLabel: 'Zpět na úvod',
        foreignPath: '/ai-ta-krajta/media-kit',
    },
    {
        hostname: 'pavolhejny.com',
        canonicalHome: 'https://pavolhejny.com/',
        siteName: 'Pavol Hejný',
        language: 'en',
        notFoundTitle: 'Page not found',
        homeLabel: 'Back to home',
        foreignPath: '/cs/pavol',
    },
] as const;

const ALL_HOSTNAMES = ['ptbk.io', ...BRANDED_HOSTS.map((site) => site.hostname)].flatMap((hostname) => [
    hostname,
    `www.${hostname}`,
]);

test.use({
    launchOptions: {
        args: [
            `--host-resolver-rules=${ALL_HOSTNAMES.map((hostname) => `MAP ${hostname} 127.0.0.1`).join(',')}`,
            '--no-proxy-server',
        ],
    },
});

function localDomainUrl(hostname: string, path: string): string {
    const url = new URL(path, LOCAL_SERVER_URL);
    url.hostname = hostname;

    return url.toString();
}

async function getHosted(
    request: APIRequestContext,
    hostname: string,
    path: string,
    additionalHeaders: Record<string, string> = {},
) {
    return request.get(new URL(path, LOCAL_SERVER_URL).toString(), {
        headers: { Host: hostname, ...additionalHeaders },
        maxRedirects: 0,
    });
}

test.describe('isolated public domains', () => {
    test.skip(
        !['127.0.0.1', 'localhost'].includes(LOCAL_SERVER_URL.hostname),
        'Domain routing uses the local development server and a browser DNS override.',
    );

    for (const site of BRANDED_HOSTS) {
        for (const hostname of [site.hostname, `www.${site.hostname}`]) {
            test(`${hostname} serves its own page and branded 404s at the requested URL`, async ({ page }) => {
                const homeUrl = localDomainUrl(hostname, '/');
                const homeResponse = await page.goto(homeUrl, { waitUntil: 'domcontentloaded' });

                expect(homeResponse?.status()).toBe(200);
                expect(homeResponse?.request().redirectedFrom()).toBeNull();
                await expect(page).toHaveURL(homeUrl);
                await expect(page.locator('main').first()).toBeVisible();
                await expect(page.locator('html')).toHaveAttribute('lang', site.language);
                expect(await page.title()).toContain(site.siteName);

                for (const path of ['/a-missing-page?source=check', '/cs', site.foreignPath]) {
                    const requestedUrl = localDomainUrl(hostname, path);
                    const response = await page.goto(requestedUrl, { waitUntil: 'domcontentloaded' });

                    expect(response?.status(), `${hostname}${path} must have a real 404`).toBe(404);
                    expect(response?.headers()['location']).toBeUndefined();
                    expect(response?.request().redirectedFrom()).toBeNull();
                    await expect(page).toHaveURL(requestedUrl);
                    await expect(page.locator('html')).toHaveAttribute('lang', site.language);
                    await expect(page.getByRole('heading', { level: 1 })).toHaveText(site.notFoundTitle);
                    await expect(page.getByRole('link', { name: site.homeLabel })).toHaveAttribute(
                        'href',
                        site.canonicalHome,
                    );
                    expect(await page.title()).toBe(`${site.notFoundTitle} | ${site.siteName}`);
                    expect(await page.locator('body').innerText()).not.toContain('Go Home to AI Agents');
                }
            });
        }
    }

    test('podcast paths on its apex keep Promptbook-only and file-looking pages isolated', async ({ page }) => {
        for (const path of [
            '/cs/online-workshop',
            '/cs/komunita',
            '/cs/online-workshop.pdf',
            '/people/no-one.png',
            '/admin/workshops',
        ]) {
            const requestedUrl = localDomainUrl('ai-ta-krajta.cz', path);
            const response = await page.goto(requestedUrl, { waitUntil: 'domcontentloaded' });

            expect(response?.status(), path).toBe(404);
            expect(response?.request().redirectedFrom()).toBeNull();
            await expect(page).toHaveURL(requestedUrl);
            await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stránka nenalezena');
        }
    });

    test('a locally mapped branded hostname loads Next assets and hydrates its controls', async ({ page }) => {
        const blockedAssetUrls: string[] = [];
        page.on('response', (response) => {
            if (response.url().includes('/_next/') && response.status() >= 400) {
                blockedAssetUrls.push(response.url());
            }
        });

        await page.goto(localDomainUrl('ai-ta-krajta.cz', '/'), { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'Poslouchat', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Zavřít přehrávač' })).toBeVisible();
        expect(blockedAssetUrls).toEqual([]);
    });

    for (const hostname of ['ptbk.io', 'www.ptbk.io']) {
        test(`${hostname} still serves Promptbook pages and redirects only its own legacy paths`, async ({ page, request }) => {
            for (const path of ['/cs', '/cs/online-workshop']) {
                const requestedUrl = localDomainUrl(hostname, path);
                const response = await page.goto(requestedUrl, { waitUntil: 'domcontentloaded' });

                expect(response?.status(), path).toBe(200);
                await expect(page).toHaveURL(requestedUrl);
            }

            const missingUrl = localDomainUrl(hostname, '/missing/nested-page');
            const missingResponse = await page.goto(missingUrl, { waitUntil: 'domcontentloaded' });
            expect(missingResponse?.status()).toBe(404);
            await expect(page).toHaveURL(missingUrl);

            const legacyResponse = await getHosted(request, hostname, '/ai-ta-krajta/branding?from=old');
            expect(legacyResponse.status()).toBe(308);
            expect(legacyResponse.headers()['location']).toBe('https://ai-ta-krajta.cz/branding?from=old');
        });
    }

    test('legacy redirects retain suffixes, slashes and queries, then unknown children receive a branded 404', async ({ request }) => {
        const legacyCases = [
            ['/ai-ta-krajta', 'https://ai-ta-krajta.cz/'],
            ['/ai-ta-krajta/', 'https://ai-ta-krajta.cz/'],
            ['/ai-ta-krajta/media-kit/?kind=press', 'https://ai-ta-krajta.cz/media-kit?kind=press'],
            ['/ai-ta-krajta/branding?download=1', 'https://ai-ta-krajta.cz/branding?download=1'],
            ['/ai-ta-krajta/missing-child?from=old', 'https://ai-ta-krajta.cz/missing-child?from=old'],
            ['/cs/pavol/?from=old', 'https://pavolhejny.cz/?from=old'],
            ['/en/pavol?from=old', 'https://pavolhejny.com/?from=old'],
        ] as const;

        for (const [path, destination] of legacyCases) {
            let response = await getHosted(request, 'ptbk.io', path);

            // Next normalizes trailing slashes before middleware. The subsequent permanent redirect must still
            // reach the branded destination with the original query intact.
            if (response.headers()['location']?.startsWith('/')) {
                response = await getHosted(request, 'ptbk.io', response.headers()['location']);
            }

            expect(response.status(), path).toBe(308);
            expect(response.headers()['location']).toBe(destination);
        }

        const missingChildResponse = await getHosted(request, 'ai-ta-krajta.cz', '/missing-child?from=old');
        expect(missingChildResponse.status()).toBe(404);
        expect(missingChildResponse.headers()['location']).toBeUndefined();
        expect(await missingChildResponse.text()).toContain('Stránka nenalezena');

        const languageResponse = await getHosted(request, 'ptbk.io', '/pavol?from=entry', {
            'Accept-Language': 'en-US,en;q=0.9',
        });
        expect(languageResponse.status()).toBe(307);
        const languageDestination = new URL(languageResponse.headers()['location'], LOCAL_SERVER_URL);
        expect(languageDestination.pathname).toBe('/en/pavol');
        expect(languageDestination.search).toBe('?from=entry');
    });

    test('site metadata, shared files and required APIs remain available on their domains', async ({ request }) => {
        for (const hostname of ALL_HOSTNAMES) {
            const fontResponse = await getHosted(request, hostname, '/fonts/workshop/Inter-Regular.ttf');
            expect(fontResponse.status(), hostname).toBe(200);
        }

        for (const hostname of ['ai-ta-krajta.cz', 'www.ai-ta-krajta.cz']) {
            for (const path of ['/logo.svg', '/logo.png', '/manifest.webmanifest', '/opengraph-image']) {
                const response = await getHosted(request, hostname, path);
                expect(response.status(), `${hostname}${path}`).toBe(200);
            }

            const episodeResponse = await getHosted(request, hostname, '/api/ai-ta-krajta/episodes/search?search=zahradníkem');
            expect(episodeResponse.status()).toBe(200);
        }

        for (const hostname of ['pavolhejny.cz', 'www.pavolhejny.cz', 'pavolhejny.com', 'www.pavolhejny.com']) {
            const socialResponse = await getHosted(request, hostname, '/opengraph-image');
            expect(socialResponse.status(), hostname).toBe(200);
            const portraitResponse = await getHosted(request, hostname, '/people/pavol-hejny-transparent.png');
            expect(portraitResponse.status(), hostname).toBe(200);
        }

        for (const site of BRANDED_HOSTS) {
            const robotsResponse = await getHosted(request, site.hostname, '/robots.txt');
            const sitemapResponse = await getHosted(request, site.hostname, '/sitemap.xml');
            expect(robotsResponse.status()).toBe(200);
            expect(await robotsResponse.text()).toContain(`${site.canonicalHome}sitemap.xml`);
            expect(sitemapResponse.status()).toBe(200);
            const sitemapXml = await sitemapResponse.text();
            expect(sitemapXml).toContain(`<loc>${site.canonicalHome}</loc>`);
            expect(sitemapXml).not.toContain('https://ptbk.io/');

            const contactResponse = await request.post(new URL('/api/waitlist', LOCAL_SERVER_URL).toString(), {
                headers: { Host: site.hostname },
                data: {},
                maxRedirects: 0,
            });
            expect(contactResponse.status()).toBe(400);

            const adminResponse = await getHosted(request, site.hostname, '/api/admin/workshops');
            expect(adminResponse.status()).toBe(401);
        }
    });

    test('visible cross-site links use canonical destinations', async ({ page }) => {
        await page.goto(localDomainUrl('ai-ta-krajta.cz', '/'), { waitUntil: 'domcontentloaded' });
        await expect(page.locator('[data-cookie-consent-panel]').getByRole('link')).toHaveAttribute(
            'href',
            'https://ptbk.io/cs/ochrana-osobnich-udaju',
        );
        await expect(
            page.locator('#lidi li').filter({ has: page.getByRole('heading', { name: 'Pavol Hejný' }) })
                .getByRole('link', { name: 'Profil' }),
        ).toHaveAttribute(
            'href',
            'https://pavolhejny.cz/',
        );
        await expect(page.locator('footer').getByRole('link', { name: 'Ochrana osobních údajů' })).toHaveAttribute(
            'href',
            'https://ptbk.io/cs/ochrana-osobnich-udaju',
        );

        await page.goto(localDomainUrl('pavolhejny.cz', '/'), { waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('link', { name: 'English' }).first()).toHaveAttribute(
            'href',
            'https://pavolhejny.com/',
        );
        await expect(page.getByRole('link', { name: 'Otevřít Promptbook' })).toHaveAttribute(
            'href',
            'https://ptbk.io/',
        );
        await expect(page.getByRole('link', { name: 'AI Supervize' }).first()).toHaveAttribute(
            'href',
            'https://ptbk.io/ai-supervize',
        );

        await page.goto(localDomainUrl('pavolhejny.com', '/'), { waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('link', { name: 'Čeština' }).first()).toHaveAttribute(
            'href',
            'https://pavolhejny.cz/',
        );
    });
});
