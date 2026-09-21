import { expect, test, type Page } from '@playwright/test';
import { ADMIN_SESSION_COOKIE_NAME, ADMIN_SIGN_OUT_API_PATH } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { DEFAULT_WORKSHOP_ADMIN_VIEW_STATE, serializeWorkshopAdminViewState } from '@/lib/workshops/workshopAdminViewState';
import type { WorkshopAdminSnapshot } from '@/lib/workshops/workshopTypes';

const ROOM_ID = '11111111-1111-4111-8111-111111111111';

function createSnapshot(): WorkshopAdminSnapshot {
    return {
        workshop: {
            id: ROOM_ID, kind: 'workshop', event: DEFAULT_EVENT_DETAILS, slug: 'autosave-test',
            title: 'Original title', description: '', startsAt: '2026-09-01T10:00:00Z', endsAt: null,
            youtubeVideoId: null, recordingStartOffsetSeconds: 0, previewYoutubeVideoId: null, presentationUrl: null,
            repository: null, isPublished: true, allowedReactions: [], disabledPanels: [],
            createdAt: '2026-09-01T10:00:00Z', updatedAt: '2026-09-01T10:00:00Z',
        },
        contentBlocks: [], polls: [], attachedPolls: [], comments: [], pinnedComment: null, stageComment: null,
        participants: [], participantCount: 0, commentCount: 0, reactionCount: 0, artificialReactionCount: 0,
    };
}

test.use({ serviceWorkers: 'block' });

async function openAdminSettings(page: Page, baseURL: string | undefined, beforeSave: (writeNumber: number) => Promise<string | null>) {
    test.skip(!process.env.ADMIN_PASSWORD, 'Needs the local test server admin password.');
    await page.context().addCookies([{ name: ADMIN_SESSION_COOKIE_NAME, value: createAdminSessionValueOrNull()!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }]);
    const state = { snapshot: createSnapshot() };
    const writes: Record<string, unknown>[] = [];
    // Run the actual admin UI and HTTP flow with an isolated server model; no private data is changed.
    await page.route('**/api/admin/workshops**', async (route) => {
        if (route.request().method() === 'PATCH') {
            const values = route.request().postDataJSON();
            writes.push(values);
            const errorMessage = await beforeSave(writes.length);
            if (errorMessage !== null) return route.fulfill({ status: 503, json: { error: errorMessage } });
            state.snapshot = { ...state.snapshot, workshop: { ...state.snapshot.workshop, ...values } };
            return route.fulfill({ json: { workshop: state.snapshot.workshop } });
        }
        return route.fulfill({ json: new URL(route.request().url()).pathname === '/api/admin/workshops'
            ? { workshops: [{ ...state.snapshot.workshop, participantCount: 0, registeredParticipantCount: 0 }] } : state.snapshot });
    });
    const parameters = serializeWorkshopAdminViewState({ ...DEFAULT_WORKSHOP_ADMIN_VIEW_STATE, section: 'settings' }, new URLSearchParams());
    await page.goto(`/admin/workshops?${parameters}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('form', { name: 'Nastavení workshopu', exact: true })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Upravit nastavení', exact: true })).toHaveCount(0);
    return { state, writes };
}

test('autosaves edits in order, protects reload while pending, and waits before navigating', async ({ page, baseURL }) => {
    let releaseFirstSave!: () => void;
    const firstSave = new Promise<void>((resolve) => { releaseFirstSave = resolve; });
    const browserErrors: string[] = [];
    page.on('pageerror', (error) => browserErrors.push(error.message));
    const { writes } = await openAdminSettings(page, baseURL, async (writeNumber) => {
        if (writeNumber === 1) await firstSave;
        return null;
    });
    const title = page.getByLabel('Název', { exact: true });
    await title.click();
    await title.fill('First edit');
    await expect.poll(() => writes.length).toBe(1);
    await title.fill('Latest edit');
    try {
        const dialogPromise = page.waitForEvent('dialog');
        const reload = page.evaluate(() => window.location.reload());
        const dialog = await dialogPromise;
        expect(dialog.type()).toBe('beforeunload');
        await dialog.dismiss();
        await reload;
        await expect(title).toHaveValue('Latest edit');
        expect(writes).toHaveLength(1);
    } finally {
        releaseFirstSave();
    }
    await expect.poll(() => writes.length).toBe(2);
    await expect(page.getByText('Změny se ukládají automaticky.', { exact: true })).toBeVisible();
    expect(writes.map((write) => write.title)).toEqual(['First edit', 'Latest edit']);
    await page.reload();
    await expect(title).toHaveValue('Latest edit');
    await title.fill('Saved before leaving');
    await page.getByLabel(/^URL slug/).fill('renamed-autosave-test');
    await page.getByRole('link', { name: 'Slevové kódy', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/discount-codes/);
    expect(writes.at(-1)?.title).toBe('Saved before leaving');
    expect(writes.at(-1)?.slug).toBe('renamed-autosave-test');
    expect(browserErrors).toEqual([]);
});

test('retains a failed edit and retries it without leaving the settings', async ({ page, baseURL }) => {
    let isSaveAllowed = false;
    const { writes } = await openAdminSettings(page, baseURL, async () => isSaveAllowed ? null : 'Temporary save failure');
    const title = page.getByLabel('Název', { exact: true });
    await title.fill('Keep this edit');
    await expect(page.getByRole('alert').filter({ hasText: 'Temporary save failure' })).toBeVisible();
    await page.getByRole('tab', { name: 'Obsah', exact: true }).click();
    await expect.poll(() => writes.length).toBe(2);
    await expect(page.getByRole('tab', { name: 'Nastavení', exact: true })).toHaveAttribute('data-state', 'active');
    await expect(title).toHaveValue('Keep this edit');
    isSaveAllowed = true;
    await page.getByRole('button', { name: 'Zkusit znovu', exact: true }).last().click();
    await expect(page.getByText('Změny se ukládají automaticky.', { exact: true })).toBeVisible();
    await page.reload();
    await expect(title).toHaveValue('Keep this edit');
});

test('keeps invalid settings open and saves corrected settings before signing out', async ({ page, baseURL }) => {
    let releaseSave!: () => void;
    const pendingSave = new Promise<void>((resolve) => { releaseSave = resolve; });
    const { state, writes } = await openAdminSettings(page, baseURL, async () => { await pendingSave; return null; });
    const signOutRequests: string[] = [];
    page.on('request', (request) => {
        if (new URL(request.url()).pathname === ADMIN_SIGN_OUT_API_PATH) signOutRequests.push(request.method());
    });
    const title = page.getByLabel('Název', { exact: true });
    await title.fill('');
    await page.getByRole('button', { name: 'Odhlásit se', exact: true }).click();
    await expect(page.getByText('Změny nejsou uložené. Zkontrolujte vyplněná pole.')).toBeVisible();
    expect(signOutRequests).toEqual([]);
    expect(writes).toEqual([]);
    await title.fill('Saved before sign-out');
    try {
        await page.getByRole('button', { name: 'Odhlásit se', exact: true }).click();
        await expect.poll(() => writes.length).toBe(1);
        expect(signOutRequests).toEqual([]);
        await expect(title).toHaveValue('Saved before sign-out');
    } finally {
        releaseSave();
    }
    await expect(page).toHaveURL(/\/admin\/login/);
    expect(state.snapshot.workshop.title).toBe('Saved before sign-out');
    expect(signOutRequests).toEqual(['POST']);
});
