import { expect, test } from '@playwright/test';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { DEFAULT_WORKSHOP_ADMIN_VIEW_STATE, serializeWorkshopAdminViewState } from '@/lib/workshops/workshopAdminViewState';
import type { WorkshopAdminSnapshot } from '@/lib/workshops/workshopTypes';

const ROOM_ID = '11111111-1111-4111-8111-111111111111';
const DEPLOYMENT_URL = 'https://workshop-example.vercel.app/';
const DEPLOYMENT = { id: 'dpl_example', state: 'BUILDING', deploymentUrl: null,
    inspectorUrl: 'https://vercel.com/example/workshop/deployment' };

function createSnapshot(): WorkshopAdminSnapshot {
    return {
        workshop: {
            id: ROOM_ID, kind: 'workshop', event: DEFAULT_EVENT_DETAILS, slug: 'vercel-deployment',
            title: 'Workshop deployment', description: '', startsAt: '2026-09-01T10:00:00Z', endsAt: null,
            youtubeVideoId: null, recordingStartOffsetSeconds: 0, previewYoutubeVideoId: null, presentationUrl: null,
            repository: { owner: 'example', name: 'workshop', branch: ['main', 'client-*'], deploymentUrls: [] },
            isPublished: true, allowedReactions: [], disabledPanels: [],
            createdAt: '2026-09-01T10:00:00Z', updatedAt: '2026-09-01T10:00:00Z',
        },
        contentBlocks: [], polls: [], attachedPolls: [], comments: [], pinnedComment: null, stageComment: null,
        participants: [], participantCount: 0, commentCount: 0, reactionCount: 0, artificialReactionCount: 0,
    };
}

test.use({ serviceWorkers: 'block' });

for (const isFirstBuildFailing of [false, true]) {
    test(isFirstBuildFailing
        ? 'shows Vercel failure details and guidance, then saves the URL after retrying'
        : 'deploys a workshop project and saves its ready URL through the existing settings form', async ({ page, baseURL }, testInfo) => {
        test.skip(!process.env.ADMIN_PASSWORD, 'Needs the local test server admin password.');
        await page.context().addCookies([{ name: ADMIN_SESSION_COOKIE_NAME, value: createAdminSessionValueOrNull()!,
            url: baseURL!, httpOnly: true, sameSite: 'Lax' }]);
        let snapshot = createSnapshot();
        const writes: Record<string, unknown>[] = [];
        const starts: unknown[] = [];
        const browserErrors: string[] = [];
        page.on('pageerror', (error) => browserErrors.push(error.message));

        // The real admin form and fetch/poll/save flow run in the browser. No Vercel account or database is mutated.
        await page.route('**/api/admin/workshops**', async (route) => {
            const request = route.request();
            const address = new URL(request.url());
            if (address.pathname.endsWith('/repository/deployment')) {
                if (request.method() === 'POST') {
                    starts.push(request.postDataJSON());
                    return route.fulfill({ json: { deployment: DEPLOYMENT } });
                }
                expect(address.searchParams.get('deploymentId')).toBe(DEPLOYMENT.id);
                if (isFirstBuildFailing && starts.length === 1) {
                    return route.fulfill({ json: { deployment: { ...DEPLOYMENT, state: 'ERROR', failure: {
                        stage: 'build', code: 'BUILD_FAILED', message: 'Command "npm run build" exited with 1',
                        buildLog: 'src/app/page.tsx:12\nType error: Type string is not assignable to number.',
                    } } } });
                }
                return route.fulfill({ json: { deployment: { ...DEPLOYMENT, state: 'READY', deploymentUrl: DEPLOYMENT_URL } } });
            }
            if (request.method() === 'PATCH') {
                const values = request.postDataJSON();
                writes.push(values);
                snapshot = { ...snapshot, workshop: { ...snapshot.workshop,
                    repository: { ...snapshot.workshop.repository!, deploymentUrls: values.repository.deploymentUrls } } };
                return route.fulfill({ json: { workshop: snapshot.workshop } });
            }
            return route.fulfill({ json: address.pathname === '/api/admin/workshops'
                ? { workshops: [{ ...snapshot.workshop, participantCount: 0, registeredParticipantCount: 0 }] } : snapshot });
        });

        const parameters = serializeWorkshopAdminViewState({ ...DEFAULT_WORKSHOP_ADMIN_VIEW_STATE, section: 'settings' }, new URLSearchParams());
        await page.goto(`/admin/workshops?${parameters}`, { waitUntil: 'domcontentloaded' });
        const deploymentField = page.getByLabel('URL nasazení projektu');
        const deployButton = page.getByRole('button', { name: 'Nasadit na Vercel', exact: true });
        await deploymentField.fill('https://manual.example.com/');
        await expect(deployButton).toHaveCount(0);
        await deploymentField.fill('');
        await deployButton.click();
        await expect(page.getByRole('button', { name: 'Nasazuji na Vercel…' })).toBeDisabled();
        if (isFirstBuildFailing) {
            const failurePanel = page.getByRole('form', { name: 'Nastavení workshopu', exact: true }).getByRole('alert');
            await expect(failurePanel).toContainText('Command "npm run build" exited with 1');
            await expect(failurePanel).toContainText('Opravte chybu kompilace nebo typů');
            await expect(failurePanel).toContainText('BUILD_FAILED');
            await expect(deploymentField).toHaveValue('');
            expect(writes).toEqual([]);
            await expect(failurePanel.locator('pre')).not.toBeVisible();
            await failurePanel.getByText('Zobrazit konec výpisu sestavení').click();
            await expect(failurePanel.locator('pre')).toBeVisible();
            await expect(failurePanel.locator('pre')).toContainText('src/app/page.tsx:12');
            await expect(page.getByRole('link', { name: 'Otevřít nasazení ve Vercelu' })).toHaveAttribute('href', DEPLOYMENT.inspectorUrl);
            await failurePanel.scrollIntoViewIfNeeded();
            await page.screenshot({ path: testInfo.outputPath('deployment-failure-desktop.png') });
            await page.setViewportSize({ width: 390, height: 844 });
            await failurePanel.scrollIntoViewIfNeeded();
            const bounds = await failurePanel.boundingBox();
            expect(bounds?.width).toBeLessThanOrEqual(390);
            await page.screenshot({ path: testInfo.outputPath('deployment-failure-mobile.png') });
            await page.getByRole('button', { name: 'Zkusit nasazení znovu' }).click();
            await expect(failurePanel).toHaveCount(0);
        }
        await expect(deploymentField).toHaveValue(DEPLOYMENT_URL);
        expect(starts).toEqual(Array.from({ length: isFirstBuildFailing ? 2 : 1 }, () => ({
            repository: { url: 'https://github.com/example/workshop', deploymentUrls: [] },
        })));
        await expect.poll(() => writes.length).toBe(1);
        expect(writes[0].repository).toEqual({ url: 'https://github.com/example/workshop', branch: ['main', 'client-*'],
            deploymentUrls: [DEPLOYMENT_URL] });
        await expect(deployButton).toHaveCount(0);
        expect(browserErrors).toEqual([]);
    });
}
