import { readFile } from 'node:fs/promises';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { createWorkshopWrapUpRoomUrl, selectWorkshopWrapUpSource, type WorkshopWrapUpExport } from '@/lib/workshops/workshopWrapUpExport';
import type { WorkshopPublicState } from '@/lib/workshops/workshopTypes';
import { expect, test } from '@playwright/test';

const STARTS_AT = '2026-09-01T10:00:00Z';
const ENDS_AT = '2026-09-01T11:00:00Z';
const SHORT_URL = 'https://ptbk.io/pdf-test';

test.use({ serviceWorkers: 'block' });

function createState(workshopSlug: string): WorkshopPublicState {
    return {
        workshop: {
            id: 'pdf-workshop', kind: 'workshop', event: DEFAULT_EVENT_DETAILS, slug: workshopSlug,
            title: 'České shrnutí workshopu', description: 'Od zadání k hotové aplikaci.',
            startsAt: STARTS_AT, endsAt: ENDS_AT, isPublished: true,
            youtubeVideoId: null, previewYoutubeVideoId: null, recordingStartOffsetSeconds: 0,
            presentationUrl: null, allowedReactions: [], disabledPanels: [], createdAt: STARTS_AT, updatedAt: STARTS_AT,
            repository: { owner: 'example', name: 'workshop', branch: 'main', deploymentUrls: ['https://example.com/app'] },
        },
        serverTime: ENDS_AT,
        participant: { id: 'pdf-participant', fullname: 'PRIVATE PERSON', email: 'private@example.com',
            connectedAt: STARTS_AT, isTrusted: false, isInteractionBanned: false, isModerator: false },
        contentBlocks: [{ id: 'material', title: 'Poznatky', bodyMarkdown: '- Ověřujte výstupy testy.\n- Zadávejte malé úkoly.',
            isPublished: true, isFollowUp: true, isPaidMembersOnly: false, unlockAt: STARTS_AT, sortOrder: 0,
            createdAt: STARTS_AT, updatedAt: STARTS_AT, linkClickCount: 0 }],
        comments: [], feedback: null, watchingParticipantCount: 1, paidMembersOnlyContentPreviews: [],
        nextContentUnlockAt: null, paidMembersOnlyVideo: null, polls: [], stageComment: null, recentReactions: [], reactionCounts: [],
    };
}

test('downloads the branded recap in the browser with local fonts, project preview, Git graph and short-link QR', async ({ page }, testInfo) => {
    const browserErrors: string[] = [];
    const fontRequests = new Set<string>();
    let exportRequestCount = 0;
    page.on('pageerror', (error) => browserErrors.push(error.message));
    page.on('request', (request) => {
        if (request.url().includes('/fonts/workshop/')) fontRequests.add(new URL(request.url()).pathname);
    });
    const preview = await readFile('public/logo/og-image.png');
    await page.route('**/api/**', async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        const workshopSlug = pathname.split('/')[3];
        if (pathname.endsWith('/state')) return route.fulfill({ json: createState(workshopSlug) });
        if (pathname.endsWith('/wrap-up')) {
            expect(route.request().method()).toBe('POST');
            exportRequestCount += 1;
            const result: WorkshopWrapUpExport = {
                source: selectWorkshopWrapUpSource(createState(workshopSlug)),
                roomUrl: createWorkshopWrapUpRoomUrl(workshopSlug), shortUrl: SHORT_URL,
                projectPreview: { title: 'Projekt z workshopu', description: 'Nasazená aplikace.', previewImageUrl: null, repositoryName: 'example/workshop', deploymentUrl: 'https://example.com' },
                projectPreviewImage: `data:image/png;base64,${preview.toString('base64')}`,
                repositoryProgress: {
                    commits: [{ sha: 'a'.repeat(40), message: 'První funkční aplikace', authorName: 'Pavol Hejný', committedAt: ENDS_AT, branchNames: ['main'] }],
                    branches: [{ name: 'main', headSha: 'a'.repeat(40) }], nextPage: null,
                },
            };
            return route.fulfill({ json: result });
        }
        if (pathname.endsWith('/membership')) return route.fulfill({ json: { status: 'none', isPurchaseOffered: false } });
        if (pathname.endsWith('/repository')) return route.fulfill({ json: { progress: null } });
        return route.fulfill({ json: {} });
    });
    const response = await page.goto('/cs/online-workshop/participant', { waitUntil: 'domcontentloaded' });
    test.skip(response?.status() === 404, 'The configured database has no published workshop.');
    const button = page.getByRole('button', { name: 'Stáhnout shrnutí v PDF' });
    await expect(button).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await button.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/-shrnuti\.pdf$/);
    const outputPath = testInfo.outputPath('workshop-wrap-up.pdf');
    await download.saveAs(outputPath);
    const bytes = (await readFile(outputPath)).toString('latin1');
    expect(bytes.startsWith('%PDF-')).toBe(true);
    expect(bytes).toContain(`/URI (${SHORT_URL})`);
    expect(bytes).toContain('/URI (https://github.com/example/workshop/commit/');
    expect(bytes).toContain('/FontFile2');
    expect(bytes).toContain('/Subtype /Image');
    expect(fontRequests.size).toBe(5);
    expect(exportRequestCount).toBe(1);
    expect(browserErrors).toEqual([]);
    await expect(button).toBeEnabled();
});
