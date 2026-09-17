import { expect, test } from '@playwright/test';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { DEFAULT_WORKSHOP_AGENT_VALUES, type WorkshopAgentDefinition } from '@/lib/workshops/agents/workshopAgentTypes';
import { DEFAULT_WORKSHOP_ADMIN_VIEW_STATE, serializeWorkshopAdminViewState } from '@/lib/workshops/workshopAdminViewState';
import type { WorkshopAdminSnapshot, WorkshopKind } from '@/lib/workshops/workshopTypes';

const ROOM_ID = '11111111-1111-4111-8111-111111111111';
const AGENT_ID = '22222222-2222-4222-8222-222222222222';
const AGENT_VIEW_PARAMETERS = serializeWorkshopAdminViewState(
    { ...DEFAULT_WORKSHOP_ADMIN_VIEW_STATE, section: 'agents' }, new URLSearchParams(),
).toString();
const AGENT_BOOK_SOURCE = `Zvídavá testerka
PERSONA Jsi pečlivá testerka, která zkoumá praktické příklady.
RULE Než doporučíš řešení, zeptej se na konkrétní důkazy.
MODEL gpt-4.1-mini`;

function createSnapshot(kind: WorkshopKind): WorkshopAdminSnapshot {
    return {
        workshop: {
            id: ROOM_ID, kind, event: kind === 'community' ? null : DEFAULT_EVENT_DETAILS,
            slug: 'agent-test', title: 'Agent test room', description: '', startsAt: '2026-01-01T12:00:00Z', endsAt: null,
            youtubeVideoId: null, recordingStartOffsetSeconds: 0, previewYoutubeVideoId: null, presentationUrl: null,
            repository: null, isPublished: true, allowedReactions: ['👏'], disabledPanels: [],
            createdAt: '2026-01-01T12:00:00Z', updatedAt: '2026-01-01T12:00:00Z',
        },
        contentBlocks: [], polls: [], attachedPolls: [], comments: [], pinnedComment: null, stageComment: null,
        participants: [], participantCount: 0, commentCount: 0, reactionCount: 0, artificialReactionCount: 0,
    };
}

for (const kind of ['workshop', 'community'] as const) {
    test(`defines a Book agent in the ${kind} administration`, async ({ page, baseURL }) => {
        test.skip(!process.env.ADMIN_PASSWORD, 'This admin UI test needs an admin password on the local test server.');
        const session = createAdminSessionValueOrNull();
        await page.context().addCookies([{ name: ADMIN_SESSION_COOKIE_NAME, value: session!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }]);
        const snapshot = createSnapshot(kind);
        const agents: WorkshopAgentDefinition[] = [];

        // The real dashboard and BookEditor run in the browser; all mutations stay in this test's fixture.
        await page.route('**/api/admin/workshops**', async (route) => {
            const request = route.request();
            const pathname = new URL(request.url()).pathname;
            if (pathname.endsWith('/agents')) {
                if (request.method() === 'POST') {
                    agents.push({ ...request.postDataJSON(), id: AGENT_ID });
                    await route.fulfill({ status: 201, json: { agentId: AGENT_ID } });
                } else {
                    await route.fulfill({ json: { agents, runs: [], isConfigured: false } });
                }
            } else if (pathname === '/api/admin/workshops') {
                await route.fulfill({ json: { workshops: [{ ...snapshot.workshop, participantCount: 0, registeredParticipantCount: 0 }] } });
            } else if (pathname.endsWith(ROOM_ID)) {
                await route.fulfill({ json: snapshot });
            } else {
                await route.fulfill({ status: 404, json: { error: 'No fixture for this endpoint' } });
            }
        });

        await page.goto(`/admin/${kind === 'community' ? 'community' : 'workshops'}?${AGENT_VIEW_PARAMETERS}`);
        await expect(page.getByRole('heading', { name: 'Agenti v diskusi' })).toBeVisible();
        await page.getByRole('button', { name: 'Nový agent', exact: true }).click();
        await page.getByLabel('Jméno v chatu').fill('Zvídavá testerka');
        const bookEditor = page.getByRole('group', { name: 'Zdrojový Book agenta' });
        await expect(bookEditor.locator('.monaco-editor')).toBeVisible();
        await expect(bookEditor).toContainText('Zvídavá Jana');
        await bookEditor.locator('.view-lines').click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.insertText(AGENT_BOOK_SOURCE);
        await expect(bookEditor).toContainText('pečlivá testerka');
        if (kind === 'community') {
            await expect(page.getByLabel('Naslouchat živému workshopu a pokládat otázky')).toHaveCount(0);
        } else {
            await page.getByLabel('Naslouchat živému workshopu a pokládat otázky').check();
        }
        await page.getByRole('button', { name: 'Uložit agenta', exact: true }).click();
        await expect(page.getByRole('button', { name: /Zvídavá testerka/ })).toBeVisible();
        expect(agents).toEqual([{
            ...DEFAULT_WORKSHOP_AGENT_VALUES, id: AGENT_ID, name: 'Zvídavá testerka',
            bookSource: AGENT_BOOK_SOURCE, isListening: kind === 'workshop',
        }]);
    });
}
