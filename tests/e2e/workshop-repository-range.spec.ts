import { expect, test } from '@playwright/test';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { DEFAULT_WORKSHOP_ADMIN_VIEW_STATE, serializeWorkshopAdminViewState } from '@/lib/workshops/workshopAdminViewState';
import type { WorkshopAdminSnapshot, WorkshopDetails, WorkshopPublicState } from '@/lib/workshops/workshopTypes';

const ROOM_ID = '11111111-1111-4111-8111-111111111111';
const STARTS_AT = '2026-09-01T10:00:00.000Z';
const ENDS_AT = '2026-09-01T11:00:00.000Z';
const COMMITS = [
    { sha: 'a'.repeat(40), message: 'Prepare the workshop project', committedAt: STARTS_AT, authorName: 'Alice', branchNames: ['main'] },
    { sha: 'b'.repeat(40), message: 'Complete the workshop feature', committedAt: ENDS_AT, authorName: 'Bob', branchNames: ['client-demo'] },
    { sha: 'c'.repeat(40), message: 'Continue after the workshop', committedAt: '2026-09-02T10:00:00.000Z', authorName: 'Alice', branchNames: ['main'] },
];
const WORKSHOP: WorkshopDetails = {
    id: ROOM_ID, kind: 'workshop', event: DEFAULT_EVENT_DETAILS, slug: 'repository-range', title: 'Repository range', description: '',
    startsAt: STARTS_AT, endsAt: ENDS_AT, youtubeVideoId: null, recordingStartOffsetSeconds: 0,
    previewYoutubeVideoId: null, presentationUrl: null, isPublished: true, allowedReactions: [], disabledPanels: [],
    repository: { owner: 'example', name: 'workshop', branch: ['main', 'client-*'], deploymentUrls: [] },
    createdAt: STARTS_AT, updatedAt: STARTS_AT,
};
test.use({ serviceWorkers: 'block' });

test('edits independent commit bounds in workshop settings', async ({ page, baseURL }) => {
    test.skip(!process.env.ADMIN_PASSWORD, 'Needs the local test server admin password.');
    await page.context().addCookies([{ name: ADMIN_SESSION_COOKIE_NAME, value: createAdminSessionValueOrNull()!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }]);
    const snapshot: WorkshopAdminSnapshot = {
        workshop: WORKSHOP, contentBlocks: [], polls: [], attachedPolls: [], comments: [], pinnedComment: null, stageComment: null,
        participants: [], participantCount: 0, commentCount: 0, reactionCount: 0, artificialReactionCount: 0,
    };
    const writes: Record<string, unknown>[] = [];
    await page.route('**/api/admin/workshops**', async (route) => {
        const request = route.request();
        const pathname = new URL(request.url()).pathname;
        if (pathname.endsWith('/repository/commit')) {
            const lookup = request.postDataJSON().lookup;
            const commit = lookup.kind === 'date' ? COMMITS[lookup.boundary === 'start' ? 0 : 1]
                : COMMITS.find((candidate) => candidate.sha.startsWith(lookup.commitId));
            return route.fulfill({ json: { commit } });
        }
        if (request.method() === 'PATCH') {
            writes.push(request.postDataJSON());
            return route.fulfill({ json: { workshop: WORKSHOP } });
        }
        return route.fulfill({ json: pathname === '/api/admin/workshops'
            ? { workshops: [{ ...WORKSHOP, participantCount: 0, registeredParticipantCount: 0 }] } : snapshot });
    });
    const parameters = serializeWorkshopAdminViewState({ ...DEFAULT_WORKSHOP_ADMIN_VIEW_STATE, section: 'settings' }, new URLSearchParams());
    await page.goto(`/admin/workshops?${parameters}`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Doplnit podle začátku workshopu' }).click();
    await expect(page.getByLabel('Počáteční commit')).toHaveValue(COMMITS[0].sha);
    await expect(page.getByLabel('Koncový commit')).toHaveValue('');
    await expect(page.getByText(COMMITS[0].message)).toBeVisible();
    await page.getByRole('button', { name: 'Doplnit podle konce workshopu' }).click();
    await expect(page.getByLabel('Koncový commit')).toHaveValue(COMMITS[1].sha);
    await expect(page.getByText(COMMITS[1].message)).toBeVisible();
    await page.getByRole('button', { name: 'Uložit nastavení', exact: true }).click();
    await expect.poll(() => writes.length).toBe(1);
    expect(writes[0].repository).toMatchObject({ startCommit: COMMITS[0].sha, endCommit: COMMITS[1].sha, branch: ['main', 'client-*'] });
});

test('opens on the highlighted workshop range and expands its branch graph', async ({ page }) => {
    const browserErrors: string[] = [];
    page.on('pageerror', (error) => browserErrors.push(error.message));
    await page.route('**/api/**', async (route) => {
        const address = new URL(route.request().url());
        if (address.pathname.endsWith('/state')) {
            const state: WorkshopPublicState = {
                serverTime: ENDS_AT, workshop: { ...WORKSHOP, slug: address.pathname.split('/')[3],
                    repository: { ...WORKSHOP.repository!, startCommit: COMMITS[0].sha, endCommit: COMMITS[1].sha } },
                participant: { id: 'participant', fullname: 'Workshop participant', email: 'participant@example.com', connectedAt: STARTS_AT,
                    isTrusted: false, isModerator: false, isInteractionBanned: false },
                contentBlocks: [], paidMembersOnlyContentPreviews: [], paidMembersOnlyVideo: null, nextContentUnlockAt: null,
                feedback: null, stageComment: null, watchingParticipantCount: 1, recentReactions: [], reactionCounts: [], comments: [], polls: [],
            };
            return route.fulfill({ json: state });
        }
        if (address.pathname.endsWith('/repository')) return route.fulfill({ json: { progress: {
            commits: address.searchParams.get('expanded') === 'true' ? [...COMMITS].reverse() : COMMITS.slice(0, 2).reverse(),
            branches: [{ name: 'main', headSha: COMMITS[2].sha }, { name: 'client-demo', headSha: COMMITS[1].sha }],
            range: { start: COMMITS[0], end: COMMITS[1] }, nextPage: null,
        } } });
        if (address.pathname.endsWith('/membership')) return route.fulfill({ json: { status: 'none', isPurchaseOffered: false } });
        return route.fulfill({ json: {} });
    });
    const response = await page.goto('/cs/online-workshop/participant', { waitUntil: 'domcontentloaded' });
    test.skip(response?.status() === 404, 'The configured test database has no published online workshop.');
    const project = page.getByRole('article', { name: 'Projekt workshopu' });
    await expect(project.getByText(COMMITS[0].message)).toBeVisible();
    await expect(project.getByText(COMMITS[2].message)).toHaveCount(0);
    await project.getByRole('button', { name: 'Rozbalit graf mimo rozsah workshopu' }).click();
    await expect(project.getByText(COMMITS[2].message)).toBeVisible();
    await expect(project.locator('[data-workshop-commit-in-range="true"]')).toHaveCount(2);
    await expect(project.getByLabel('Vybrané větve')).toContainText('client-demo');
    await project.getByRole('button', { name: 'Zobrazit jen rozsah workshopu' }).click();
    await expect(project.getByText(COMMITS[2].message)).toHaveCount(0);
    expect(browserErrors).toEqual([]);
});
