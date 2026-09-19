import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopPublicState } from '@/lib/workshops/workshopTypes';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const COMMUNITY_PATH = '/cs/komunita';
const PARTICIPANT_PATH = '/cs/online-workshop/participant';
const SERVER_TIME = '2026-09-19T18:00:00.000Z';
const ROOM_TITLE = 'Test barevného režimu';
const RESPONSIVE_WIDTHS = [1440, 1024, 768, 640, 390, 320] as const;
const MINIMAL_READABLE_TITLE_WIDTH = 120;
const PALETTES = [
    { label: 'Světlý režim', surface: 'rgb(255, 255, 255)', heading: 'rgb(15, 23, 42)', text: 'rgb(51, 65, 85)' },
    { label: 'Tmavý režim', surface: 'rgb(8, 26, 36)', heading: 'rgb(248, 250, 252)', text: 'rgb(226, 232, 240)' },
] as const;

test.use({ serviceWorkers: 'block' });

/** Real published routes supply the page; room responses isolate appearance checks from personal data and writes. */
function createRoomState(workshopSlug: string, isCommunity: boolean): WorkshopPublicState {
    return {
        serverTime: SERVER_TIME,
        workshop: {
            id: 'theme-workshop', slug: workshopSlug, kind: isCommunity ? 'community' : 'workshop',
            event: isCommunity ? null : DEFAULT_EVENT_DETAILS,
            title: ROOM_TITLE, description: 'Společná místnost pro ověření vzhledu.',
            startsAt: '2026-09-19T16:00:00.000Z', endsAt: '2026-09-19T17:00:00.000Z',
            youtubeVideoId: null, recordingStartOffsetSeconds: 0, previewYoutubeVideoId: null,
            presentationUrl: null, repository: null, isPublished: true, allowedReactions: ['👍'],
            disabledPanels: [], createdAt: SERVER_TIME, updatedAt: SERVER_TIME,
        },
        participant: {
            id: 'theme-participant', fullname: 'Jana Nováková', email: 'room-theme@example.com',
            connectedAt: SERVER_TIME, isInteractionBanned: false, isTrusted: false, isModerator: false,
        },
        watchingParticipantCount: 1,
        contentBlocks: [{
            id: 'theme-material', title: 'Materiál pro účastníky',
            bodyMarkdown: '## Poznámky\n\nUkázkový `kód` a [dokumentace](https://example.com/docs).',
            unlockAt: SERVER_TIME, sortOrder: 0, isPublished: true, isFollowUp: false,
            isPaidMembersOnly: false, createdAt: SERVER_TIME, updatedAt: SERVER_TIME, linkClickCount: 0,
        }],
        nextContentUnlockAt: null, paidMembersOnlyContentPreviews: [], paidMembersOnlyVideo: null,
        feedback: null, comments: [], stageComment: null, recentReactions: [], reactionCounts: [],
        polls: [{
            id: 'theme-poll', question: 'Co vás zajímá?', isClosed: false, isVisible: true,
            isOtherOptionEnabled: true, createdAt: SERVER_TIME, updatedAt: SERVER_TIME, attachedWorkshops: [],
            options: [{
                id: 'theme-option', label: 'Programování', sortOrder: 0, voteCount: 2,
                isVotedByParticipant: false, isCreatedByParticipant: false, status: 'approved',
            }],
        }],
    };
}

async function mockRoomResponses(page: Page, isConnected: boolean): Promise<void> {
    await page.route('**/api/**', async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        if (pathname.endsWith('/state')) {
            return isConnected
                ? route.fulfill({ json: createRoomState(pathname.split('/')[3], page.url().includes(COMMUNITY_PATH)) })
                : route.fulfill({ status: 401, json: { error: 'Připojte se do místnosti.' } });
        }
        if (pathname.endsWith('/membership')) {
            return route.fulfill({ json: {
                status: 'none', monthlyPriceCzk: null, currentPeriodEndsAt: null, isCancellationScheduled: false,
                isPurchaseOffered: true, isSubscriptionManagementOffered: false, isCoveredByDiscountCode: false,
                isPaymentInTestMode: false,
            } });
        }
        if (pathname.endsWith('/projects')) {
            return route.fulfill({ json: { projects: [], isModerationOffered: false } });
        }
        return route.fulfill({ json: {} });
    });
}

async function openPublishedRoom(page: Page, pathname: string): Promise<void> {
    const response = await page.goto(pathname);
    test.skip(response?.status() === 404, 'The configured database has no published room for this route.');
    await expect(page.getByRole('group', { name: 'Barevný režim' })).toBeVisible();
}

/** Appearance controls must leave the title readable even beside every workshop status badge. */
async function checkResponsiveRoom(page: Page, testInfo: TestInfo, screenshotPrefix: string): Promise<void> {
    for (const width of RESPONSIVE_WIDTHS) {
        await page.setViewportSize({ width, height: 1000 });
        if (width === 1440 || width === 390) {
            await page.screenshot({ path: testInfo.outputPath(`${screenshotPrefix}-${width}.png`), fullPage: true });
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        const titleWidth = await page.getByText(ROOM_TITLE, { exact: true }).evaluate((title) => title.clientWidth);
        expect(titleWidth).toBeGreaterThanOrEqual(MINIMAL_READABLE_TITLE_WIDTH);
    }
}

test('shares a saved room appearance, follows the device, and preserves the waiting-room form', async ({ page }) => {
    const browserErrors: string[] = [];
    page.on('pageerror', (error) => browserErrors.push(error.message));
    await mockRoomResponses(page, false);
    await page.emulateMedia({ colorScheme: 'light' });
    await openPublishedRoom(page, COMMUNITY_PATH);
    await expect(page.getByRole('button', { name: 'Podle zařízení', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', PALETTES[0].heading);
    await page.getByLabel('Jméno a příjmení').fill('Jana Nováková');
    await page.getByLabel('E-mail', { exact: true }).fill('room-theme@example.com');

    const darkButton = page.getByRole('button', { name: 'Tmavý režim', exact: true });
    await darkButton.focus();
    await page.keyboard.press('Enter');
    await expect(darkButton).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('Jméno a příjmení')).toHaveValue('Jana Nováková');
    await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('room-theme@example.com');
    await expect(page.locator('[data-cookie-consent-panel]')).toHaveCSS('background-color', PALETTES[1].surface);
    await page.getByRole('button', { name: 'Nastavit', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Nastavení cookies' })).toHaveCSS('background-color', PALETTES[1].surface);
    await page.keyboard.press('Escape');
    await page.reload();
    await expect(darkButton).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', PALETTES[1].heading);

    await page.getByRole('button', { name: 'Podle zařízení', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', PALETTES[0].heading);
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', PALETTES[1].heading);
    await page.getByRole('button', { name: 'Světlý režim', exact: true }).click();
    await openPublishedRoom(page, PARTICIPANT_PATH);
    await expect(page.getByRole('button', { name: 'Světlý režim', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', PALETTES[0].heading);
    await page.getByRole('button', { name: 'Nastavit', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Nastavení cookies' })).toHaveCSS('background-color', PALETTES[0].surface);
    await page.keyboard.press('Escape');

    await page.goto('/cs/online-workshop');
    await expect(page.getByRole('group', { name: 'Barevný režim' })).toHaveCount(0);
    await expect(page.locator('[data-cookie-consent-panel]')).toHaveCSS('color-scheme', 'dark');
    await openPublishedRoom(page, COMMUNITY_PATH);
    await expect(page.getByRole('button', { name: 'Světlý režim', exact: true })).toHaveAttribute('aria-pressed', 'true');
    expect(browserErrors).toEqual([]);
});

test('themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts', async ({ page }, testInfo) => {
    const browserErrors: string[] = [];
    page.on('pageerror', (error) => browserErrors.push(error.message));
    await mockRoomResponses(page, true);
    await openPublishedRoom(page, COMMUNITY_PATH);
    await page.getByRole('button', { name: 'Přijmout vše', exact: true }).click();
    const chatDraft = page.getByRole('textbox', { name: 'Nová zpráva do chatu' });
    await chatDraft.fill('Rozepsaný komentář');

    for (const palette of PALETTES) {
        await page.getByRole('button', { name: palette.label, exact: true }).click();
        await expect(chatDraft).toHaveValue('Rozepsaný komentář');
        await expect(page.getByRole('heading', { name: 'Živý chat', exact: true })).toHaveCSS('color', palette.heading);
        await expect(page.getByRole('heading', { name: 'Co vás zajímá?', exact: true })).toHaveCSS('color', palette.heading);
        await expect(page.getByRole('heading', { name: 'Poznámky', exact: true })).toHaveCSS('color', palette.text);
        await page.getByRole('button', { name: 'Sdílet projekt', exact: true }).click();
        await expect(page.getByRole('dialog')).toHaveCSS('background-color', palette.surface);
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Free členství. Otevřít možnosti členství' }).click();
        await expect(page.getByRole('dialog')).toHaveCSS('background-color', palette.surface);
        await page.keyboard.press('Escape');

        await checkResponsiveRoom(page, testInfo, `community-${palette.label}`);
    }

    await openPublishedRoom(page, PARTICIPANT_PATH);
    await expect(page.getByRole('heading', { name: 'Děkujeme, že jste byli u toho!' })).toBeVisible();
    for (const palette of PALETTES) {
        await page.getByRole('button', { name: palette.label, exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Živý chat', exact: true })).toHaveCSS('color', palette.heading);
        await checkResponsiveRoom(page, testInfo, `workshop-${palette.label}`);
    }
    expect(browserErrors).toEqual([]);
});
