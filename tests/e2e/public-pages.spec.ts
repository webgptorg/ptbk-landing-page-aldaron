import { DISCOUNT_CODE_QUERY_PARAMETER, REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';
import { AI_SUPERVIZE_MINI_PATH, createDiscountCodePrefillPath } from '@/lib/discounts/discountPlaces';
import {
    AI_TA_KRAJTA_APP_ICONS,
    AI_TA_KRAJTA_BRAND_NAME,
    AI_TA_KRAJTA_EPISODE_SEARCH_API_PATH,
    AI_TA_KRAJTA_MANIFEST_PATH,
    AI_TA_KRAJTA_MEDIA_KIT_PATH,
    AI_TA_KRAJTA_PATH,
} from '@/businesses/ai-ta-krajta/config';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

/**
 * Every public address which renders a page of its own.
 */
const PUBLIC_PAGE_PATHS = [
    '/cs',
    '/en',
    '/pro-mesta',
    '/for-agro',
    '/for-industry',
    '/ai-supervize',
    AI_SUPERVIZE_MINI_PATH,
    // '/ai-supervize-mini',
    '/ai-ta-krajta',
    AI_TA_KRAJTA_MEDIA_KIT_PATH,
    '/hackathon-factory',
    '/cs/online-workshop',
    '/cs/komunita/clenstvi',
    '/cs/pavol',
    '/en/pavol',
    '/cs/ochrana-osobnich-udaju',
    '/en/privacy-policy',
    '/cs/obchodni-podminky',
    '/en/terms-and-conditions',
    '/contact',
    '/branding',
    '/data-deletion',
    '/old',
] as const;

type PublicPagePath = (typeof PUBLIC_PAGE_PATHS)[number];

/**
 * The address which used to hold the training and now only forwards to the workshop it became
 */
const RETIRED_TRAINING_PATH = '/skoleni';

/**
 * A public address which renders nothing itself and only forwards to a page of this suite.
 *
 * Note: A route reading `Accept-Language` may pick any of its localized destinations, so every one of them is
 *       accepted and every one of them is rendered by its own page check above.
 */
type PublicRedirect = {
    readonly path: string;
    readonly statusCode: number;
    readonly destinationPaths: readonly PublicPagePath[];
};

const PERMANENT_REDIRECT_STATUS_CODE = 308;
const TEMPORARY_REDIRECT_STATUS_CODE = 307;

const PUBLIC_REDIRECTS: readonly PublicRedirect[] = [
    { path: '/', statusCode: TEMPORARY_REDIRECT_STATUS_CODE, destinationPaths: ['/cs', '/en'] },
    { path: '/pavol', statusCode: TEMPORARY_REDIRECT_STATUS_CODE, destinationPaths: ['/cs/pavol', '/en/pavol'] },
    {
        path: '/privacy',
        statusCode: TEMPORARY_REDIRECT_STATUS_CODE,
        destinationPaths: ['/cs/ochrana-osobnich-udaju', '/en/privacy-policy'],
    },
    {
        path: '/terms',
        statusCode: TEMPORARY_REDIRECT_STATUS_CODE,
        destinationPaths: ['/cs/obchodni-podminky', '/en/terms-and-conditions'],
    },
    {
        path: RETIRED_TRAINING_PATH,
        statusCode: PERMANENT_REDIRECT_STATUS_CODE,
        destinationPaths: [AI_SUPERVIZE_MINI_PATH],
    },
];

const E2E_DISCOUNT_CODE = 'E2E SLEVA';

const PUBLIC_PAGE_TEST_TIMEOUT_MS = 180_000;

const COOKIE_CONSENT_SELECTOR = '[data-cookie-consent]';
const COOKIE_CONSENT_PANEL_SELECTOR = '.cookie-consent__panel';
const BOOKING_NOTIFICATION_DELAY_IN_MILLISECONDS = 6_100;

async function expectPublicPageToLoad(page: Page, path: PublicPagePath): Promise<void> {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });

    expect(response, `Expected ${path} to produce a document response`).not.toBeNull();
    expect(response!.ok(), `Expected ${path} to load without a server error`).toBeTruthy();
    await expect(
        page.locator('main, h1, footer').first(),
        `Expected ${path} to render visible page content`,
    ).toBeVisible();
}

/**
 * Reads where a redirect points, whether it answers with an absolute or a site-relative `Location`.
 */
function readRedirectDestinationPath(locationHeader: string, requestUrl: string): string {
    const destinationUrl = new URL(locationHeader, requestUrl);

    return `${destinationUrl.pathname}${destinationUrl.search}${destinationUrl.hash}`;
}

/**
 * Asks a redirecting address where it points without following it, so the destination is rendered once by the page
 * check which owns it instead of a second time through every address leading to it.
 */
async function readRedirectDestination(
    request: APIRequestContext,
    path: string,
    expectedStatusCode: number,
): Promise<string> {
    const response = await request.get(path, { maxRedirects: 0 });

    expect(response.status(), `Expected ${path} to answer with status ${expectedStatusCode}`).toBe(expectedStatusCode);

    const locationHeader = response.headers()['location'];
    expect(locationHeader, `Expected ${path} to name where it redirects`).toBeDefined();

    return readRedirectDestinationPath(locationHeader, response.url());
}

for (const path of PUBLIC_PAGE_PATHS) {
    // Next.js compiles a route on its first dev-server visit. Isolating every route keeps earlier cold compilations
    // from exhausting the timeout of a healthy page later in the smoke suite.
    test(`public landing and information page loads: ${path}`, async ({ page }) => {
        await expectPublicPageToLoad(page, path);
    });
}

test('AI ta Krajta owns its metadata, icon and installable manifest', async ({ page }) => {
    await page.goto(AI_TA_KRAJTA_PATH, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('footer')).toBeVisible();
    await expect(page).toHaveTitle(`${AI_TA_KRAJTA_BRAND_NAME} | Český podcast o umělé inteligenci`);

    const metadataIdentity = await page.evaluate(
        ({ scalableIconPath, rasterIconPath, manifestPath }) => {
            const identityTags = Array.from(document.head.querySelectorAll('meta, link'));
            const structuredDataNodes = Array.from(document.head.querySelectorAll('script[type*=ld]'));
            const footerText = document.querySelector('footer')?.textContent ?? '';

            const isPromptbookIdentityAbsent = identityTags
                .filter((element) => /application-name|creator|publisher|og:site_name|twitter:site/.test(element.outerHTML))
                .every((element) => !element.outerHTML.includes('Promptbook'));
            const isPromptbookStructuredDataAbsent = structuredDataNodes.every(
                (element) => !(element.textContent ?? '').includes('Promptbook'),
            );
            const isPodcastIconUsed = identityTags.some(
                (element) =>
                    element.getAttribute('rel') === 'icon' && element.getAttribute('href') === scalableIconPath,
            );
            const isPodcastTouchIconUsed = identityTags.some(
                (element) =>
                    element.getAttribute('rel') === 'apple-touch-icon' &&
                    element.getAttribute('href') === rasterIconPath,
            );
            const isPodcastManifestUsed = identityTags.some(
                (element) => element.getAttribute('rel') === 'manifest' && element.getAttribute('href') === manifestPath,
            );
            const isFooterPromptbookAbsent = !footerText.includes('Promptbook');
            const isLegalCompanyPresent = footerText.includes('AI Web s.r.o.');

            return {
                isPromptbookIdentityAbsent,
                isPromptbookStructuredDataAbsent,
                isPodcastIconUsed,
                isPodcastTouchIconUsed,
                isPodcastManifestUsed,
                isFooterPromptbookAbsent,
                isLegalCompanyPresent,
            };
        },
        {
            scalableIconPath: AI_TA_KRAJTA_APP_ICONS.SCALABLE.path,
            rasterIconPath: AI_TA_KRAJTA_APP_ICONS.RASTER.path,
            manifestPath: AI_TA_KRAJTA_MANIFEST_PATH,
        },
    );

    expect(metadataIdentity).toEqual({
        isPromptbookIdentityAbsent: true,
        isPromptbookStructuredDataAbsent: true,
        isPodcastIconUsed: true,
        isPodcastTouchIconUsed: true,
        isPodcastManifestUsed: true,
        isFooterPromptbookAbsent: true,
        isLegalCompanyPresent: true,
    });

    const manifestResponse = await page.request.get(AI_TA_KRAJTA_MANIFEST_PATH);

    expect(manifestResponse.ok()).toBeTruthy();
    expect(await manifestResponse.json()).toMatchObject({
        name: AI_TA_KRAJTA_BRAND_NAME,
        short_name: AI_TA_KRAJTA_BRAND_NAME,
        icons: [
            { src: AI_TA_KRAJTA_APP_ICONS.SCALABLE.path, purpose: 'any' },
            { src: AI_TA_KRAJTA_APP_ICONS.RASTER.path, purpose: 'any' },
            { src: AI_TA_KRAJTA_APP_ICONS.RASTER.path, purpose: 'maskable' },
        ],
    });

    for (const appIcon of [AI_TA_KRAJTA_APP_ICONS.SCALABLE, AI_TA_KRAJTA_APP_ICONS.RASTER]) {
        const iconResponse = await page.request.get(appIcon.path);

        expect(iconResponse.ok(), `Expected ${appIcon.path} to be served`).toBeTruthy();
        expect(iconResponse.headers()['content-type']).toContain(appIcon.type);
    }
});

test('AI ta Krajta searches complete transcripts on the server without sending them to the browser', async ({ page, request }) => {
    const transcriptSearchResponse = await request.get(
        `${AI_TA_KRAJTA_EPISODE_SEARCH_API_PATH}?${new URLSearchParams({ search: 'zahradníkem' }).toString()}`,
    );
    const transcriptSearchResponseText = await transcriptSearchResponse.text();

    expect(transcriptSearchResponse.ok()).toBeTruthy();
    expect(JSON.parse(transcriptSearchResponseText)).toMatchObject({ episodeSlugs: expect.arrayContaining(['65']) });
    expect(transcriptSearchResponseText).not.toContain('Kozel za hradníkem');

    await page.goto(AI_TA_KRAJTA_PATH, { waitUntil: 'domcontentloaded' });
    await page.getByRole('searchbox', { name: 'Hledat v dílech' }).fill('zahradníkem');

    await expect(page.getByRole('heading', { name: /AI zrychlí vývoj 10x/ })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Kozel za hradníkem');
});

for (const publicRedirect of PUBLIC_REDIRECTS) {
    test(`public address redirects to its page: ${publicRedirect.path}`, async ({ request }) => {
        test.setTimeout(PUBLIC_PAGE_TEST_TIMEOUT_MS);

        const destinationPath = await readRedirectDestination(request, publicRedirect.path, publicRedirect.statusCode);

        expect(
            publicRedirect.destinationPaths.some((candidatePath) => candidatePath === destinationPath),
            `Expected ${publicRedirect.path} to redirect to ${publicRedirect.destinationPaths.join(
                ' or ',
            )}, but it pointed at ${destinationPath}`,
        ).toBeTruthy();
    });
}

test(`${RETIRED_TRAINING_PATH} carries a discount code to the workshop registration`, async ({ request }) => {
    test.setTimeout(PUBLIC_PAGE_TEST_TIMEOUT_MS);

    const destinationPath = await readRedirectDestination(
        request,
        `${RETIRED_TRAINING_PATH}?${DISCOUNT_CODE_QUERY_PARAMETER}=${encodeURIComponent(E2E_DISCOUNT_CODE)}`,
        PERMANENT_REDIRECT_STATUS_CODE,
    );

    expect(destinationPath, `Expected ${RETIRED_TRAINING_PATH} to pre-fill the discount code it was given`).toBe(
        createDiscountCodePrefillPath(AI_SUPERVIZE_MINI_PATH, REGISTRATION_SECTION_ID, E2E_DISCOUNT_CODE),
    );
});
