import { expect, test } from '@playwright/test';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { DEFAULT_WORKSHOP_ADMIN_VIEW_STATE, serializeWorkshopAdminViewState } from '@/lib/workshops/workshopAdminViewState';
import type { WorkshopAdminSnapshot } from '@/lib/workshops/workshopTypes';

const WORKSHOP_ID = '11111111-1111-4111-8111-111111111111';
const WORKSHOP_SLUG = 'material-order-test';
const FIRST_ID = '22222222-2222-4222-8222-222222222222';
const SECOND_ID = '33333333-3333-4333-8333-333333333333';
const UNLOCK_AT = '2026-09-26T10:00:00.000Z';

test.use({ serviceWorkers: 'block', hasTouch: true });

function createSnapshot(): WorkshopAdminSnapshot {
    const workshop = {
        id: WORKSHOP_ID,
        kind: 'workshop' as const,
        event: DEFAULT_EVENT_DETAILS,
        slug: WORKSHOP_SLUG,
        title: 'Material ordering test',
        description: '',
        startsAt: UNLOCK_AT,
        endsAt: null,
        youtubeVideoId: null,
        recordingStartOffsetSeconds: 0,
        previewYoutubeVideoId: null,
        presentationUrl: null,
        repository: null,
        isPublished: true,
        allowedReactions: [],
        disabledPanels: [],
        createdAt: UNLOCK_AT,
        updatedAt: UNLOCK_AT,
    };
    const contentBlocks = [
        { id: FIRST_ID, title: 'First material', bodyMarkdown: 'First body', sortOrder: 0 },
        { id: SECOND_ID, title: 'Second material', bodyMarkdown: 'Second body', sortOrder: 10 },
    ].map((contentBlock) => ({
        ...contentBlock,
        unlockAt: UNLOCK_AT,
        isPublished: true,
        isFollowUp: false,
        isPaidMembersOnly: false,
        createdAt: UNLOCK_AT,
        updatedAt: UNLOCK_AT,
        linkClickCount: 0,
    }));
    return {
        workshop,
        contentBlocks,
        polls: [],
        attachedPolls: [],
        comments: [],
        pinnedComment: null,
        stageComment: null,
        participants: [],
        participantCount: 0,
        commentCount: 0,
        reactionCount: 0,
        artificialReactionCount: 0,
    };
}

test('material ordering supports mouse, touch, and keyboard and keeps the saved order after reload', async ({ page, baseURL }) => {
    test.skip(!process.env.ADMIN_PASSWORD, 'Needs the local test server admin password.');
    await page.context().addCookies([{
        name: ADMIN_SESSION_COOKIE_NAME,
        value: createAdminSessionValueOrNull()!,
        url: baseURL!,
        httpOnly: true,
        sameSite: 'Lax',
    }]);

    const state = { snapshot: createSnapshot() };
    const reorderWrites: string[][] = [];
    await page.route('**/api/admin/workshops**', async (route) => {
        const request = route.request();
        const address = new URL(request.url());
        if (request.method() === 'PATCH' && address.pathname.endsWith('/content/order')) {
            const contentIds = (request.postDataJSON() as { readonly contentIds: readonly string[] }).contentIds;
            reorderWrites.push([...contentIds]);
            const contentBlockById = new Map(state.snapshot.contentBlocks.map((contentBlock) => [contentBlock.id, contentBlock]));
            state.snapshot = {
                ...state.snapshot,
                contentBlocks: contentIds.flatMap((contentId, index) => {
                    const contentBlock = contentBlockById.get(contentId);
                    return contentBlock === undefined ? [] : [{ ...contentBlock, sortOrder: index }];
                }),
            };
            await route.fulfill({ json: { contentIds, wasReconciled: false } });
            return;
        }

        if (address.pathname === '/api/admin/workshops') {
            const workshop = state.snapshot.workshop;
            await route.fulfill({
                json: {
                    workshops: [{ ...workshop, participantCount: 0, registeredParticipantCount: 0 }],
                },
            });
            return;
        }

        await route.fulfill({ json: state.snapshot });
    });

    const query = serializeWorkshopAdminViewState(
        { ...DEFAULT_WORKSHOP_ADMIN_VIEW_STATE, workshopSlug: WORKSHOP_SLUG, section: 'content' },
        new URLSearchParams(),
    );
    await page.goto(`/admin/workshops?${query}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Časovaný Markdown obsah' })).toBeVisible();

    const getTitles = () => page.getByRole('article').locator('h3').allTextContents();
    const getHandle = (title: string) => page.getByRole('button', { name: new RegExp(`Přesunout materiál ${title},`) });
    const getArticle = (title: string) => page.getByRole('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

    const firstHandle = getHandle('First material');
    const firstHandleBox = await firstHandle.boundingBox();
    const secondArticleBox = await getArticle('Second material').boundingBox();
    expect(firstHandleBox).not.toBeNull();
    expect(secondArticleBox).not.toBeNull();

    // Escaping a live drag restores its starting order without reaching the order endpoint.
    await page.mouse.move(firstHandleBox!.x + 15, firstHandleBox!.y + 15);
    await page.mouse.down();
    await page.mouse.move(secondArticleBox!.x + 60, secondArticleBox!.y + secondArticleBox!.height / 2, { steps: 6 });
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await expect.poll(getTitles).toEqual(['First material', 'Second material']);
    expect(reorderWrites).toHaveLength(0);

    // Releasing over the starting card is a no-op even after the handle activates dragging.
    await page.mouse.move(firstHandleBox!.x + 15, firstHandleBox!.y + 15);
    await page.mouse.down();
    await page.mouse.move(firstHandleBox!.x + 27, firstHandleBox!.y + 25, { steps: 2 });
    await page.mouse.up();
    await expect.poll(getTitles).toEqual(['First material', 'Second material']);
    expect(reorderWrites).toHaveLength(0);

    await page.mouse.move(firstHandleBox!.x + 15, firstHandleBox!.y + 15);
    await page.mouse.down();
    await page.mouse.move(secondArticleBox!.x + 60, secondArticleBox!.y + secondArticleBox!.height / 2, { steps: 6 });
    await page.mouse.up();
    await expect.poll(getTitles).toEqual(['Second material', 'First material']);
    await expect.poll(() => reorderWrites.length).toBe(1);
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    expect(reorderWrites[0]).toEqual([SECOND_ID, FIRST_ID]);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Časovaný Markdown obsah' })).toBeVisible();
    await expect.poll(getTitles).toEqual(['Second material', 'First material']);

    const secondHandle = getHandle('Second material');
    const secondHandleBox = await secondHandle.boundingBox();
    const firstArticleBox = await getArticle('First material').boundingBox();
    expect(secondHandleBox).not.toBeNull();
    expect(firstArticleBox).not.toBeNull();
    const browserSession = await page.context().newCDPSession(page);
    const touchStart = { x: secondHandleBox!.x + 15, y: secondHandleBox!.y + 15 };
    const touchEnd = { x: firstArticleBox!.x + 60, y: firstArticleBox!.y + firstArticleBox!.height / 2 };
    await browserSession.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touchStart] });
    await page.waitForTimeout(220);
    await browserSession.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [touchEnd],
    });
    await browserSession.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await browserSession.detach();
    await expect.poll(getTitles).toEqual(['First material', 'Second material']);
    await expect.poll(() => reorderWrites.length).toBe(2);
    expect(reorderWrites[1]).toEqual([FIRST_ID, SECOND_ID]);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Časovaný Markdown obsah' })).toBeVisible();
    await expect.poll(getTitles).toEqual(['First material', 'Second material']);

    // The move controls are native buttons, so keyboard activation retains focus after the move.
    const keyboardMoveControl = page.getByRole('button', { name: 'Přesunout materiál First material dolů' });
    await keyboardMoveControl.focus();
    await page.keyboard.press('Enter');
    await expect.poll(getTitles).toEqual(['Second material', 'First material']);
    await expect(getHandle('First material')).toBeFocused();
    await expect.poll(() => reorderWrites.length).toBe(3);
    expect(reorderWrites[2]).toEqual([SECOND_ID, FIRST_ID]);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Časovaný Markdown obsah' })).toBeVisible();
    await expect.poll(getTitles).toEqual(['Second material', 'First material']);
});
