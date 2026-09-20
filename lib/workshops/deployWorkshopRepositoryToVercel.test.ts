import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deployWorkshopRepositoryToVercel, getWorkshopVercelDeployment } from '@/lib/workshops/deployWorkshopRepositoryToVercel';

const REPOSITORY = { owner: 'example', name: 'workshop' };
const PROJECT = { id: 'prj_workshop', name: 'workshop-example',
    link: { type: 'github', org: 'example', repo: 'workshop', productionBranch: 'production' } };
const DEPLOYMENT = { id: 'dpl_workshop', readyState: 'BUILDING', alias: [], aliasAssigned: false,
    inspectorUrl: 'https://vercel.com/example/workshop/deployment', token: 'private-provider-data' };
const fetchMock = vi.fn();

function respond(payload: unknown, status = 200) {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(payload), { status }));
}

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('VERCEL_TOKEN', 'test-vercel-token');
    vi.stubEnv('VERCEL_TEAM_ID', 'team_workshops');
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('workshop Vercel deployment', () => {
    it('imports the original Git repository and deploys its actual production branch with private credentials', async () => {
        respond({ error: { code: 'not_found' } }, 404);
        respond(PROJECT);
        respond({ id: DEPLOYMENT.id });
        respond(DEPLOYMENT);

        expect(await deployWorkshopRepositoryToVercel(REPOSITORY)).toEqual({
            id: DEPLOYMENT.id, state: 'BUILDING', deploymentUrl: null, inspectorUrl: DEPLOYMENT.inspectorUrl,
        });
        const projectRequest = JSON.parse(fetchMock.mock.calls[1][1].body) as { readonly name: string };
        expect(projectRequest).toEqual({
            name: expect.stringMatching(/^workshop-example-workshop-[a-f0-9]{12}$/),
            gitRepository: { type: 'github', repo: 'example/workshop' },
            ssoProtection: { deploymentType: 'prod_deployment_urls_and_all_previews' },
        });
        expect(fetchMock.mock.calls[0][0].pathname).toBe(`/v9/projects/${projectRequest.name}`);
        expect(fetchMock.mock.calls[1][0].pathname).toBe('/v11/projects');
        expect(fetchMock.mock.calls[2][0].searchParams.get('skipAutoDetectionConfirmation')).toBe('1');
        expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({
            name: PROJECT.name, project: PROJECT.id, target: 'production', projectSettings: {},
            gitSource: { type: 'github', org: 'example', repo: 'workshop', ref: 'production' },
        });
        for (const [url, options] of fetchMock.mock.calls) {
            expect(url.origin).toBe('https://api.vercel.com');
            expect(url.searchParams.get('teamId')).toBe('team_workshops');
            expect(url.searchParams.has('forceNew')).toBe(false);
            expect(options.headers.Authorization).toBe('Bearer test-vercel-token');
            expect(options.cache).toBe('no-store');
            expect(options.redirect).toBe('error');
            expect(options.signal).toBeInstanceOf(AbortSignal);
        }
    });

    it('reuses a linked project and works without optional team configuration', async () => {
        vi.stubEnv('VERCEL_TEAM_ID', '');
        respond(PROJECT);
        respond({ id: DEPLOYMENT.id });
        respond(DEPLOYMENT);
        await deployWorkshopRepositoryToVercel(REPOSITORY);
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(fetchMock.mock.calls.every(([url]) => !url.searchParams.has('teamId'))).toBe(true);
    });

    it('recovers when another request creates the same project first', async () => {
        respond({}, 404);
        respond({}, 409);
        respond(PROJECT);
        respond({ id: DEPLOYMENT.id });
        respond(DEPLOYMENT);
        await deployWorkshopRepositoryToVercel(REPOSITORY);
        expect(fetchMock.mock.calls[2][0].pathname).toBe(fetchMock.mock.calls[0][0].pathname);
    });

    it('refuses to deploy into a project connected to a different repository', async () => {
        respond({ ...PROJECT, link: { ...PROJECT.link, repo: 'unrelated' } });
        await expect(deployWorkshopRepositoryToVercel(REPOSITORY)).rejects.toThrow('není připojen');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('uses the assigned production alias only after readiness, without leaking other provider fields', async () => {
        respond({ ...DEPLOYMENT, readyState: 'READY', alias: ['workshop.example.com'], aliasAssigned: false });
        expect((await getWorkshopVercelDeployment(DEPLOYMENT.id)).deploymentUrl).toBeNull();
        respond({ ...DEPLOYMENT, readyState: 'READY', alias: ['workshop.example.com'], aliasAssigned: true });
        expect(await getWorkshopVercelDeployment(DEPLOYMENT.id)).toEqual({ id: DEPLOYMENT.id, state: 'READY',
            deploymentUrl: 'https://workshop.example.com/', inspectorUrl: DEPLOYMENT.inspectorUrl });
    });

    it('handles build, cancellation and alias failures without offering their URL', async () => {
        for (const readyState of ['BUILDING', 'ERROR', 'CANCELED', 'BLOCKED']) {
            respond({ ...DEPLOYMENT, readyState, alias: ['workshop.example.com'], aliasAssigned: true });
            expect((await getWorkshopVercelDeployment(DEPLOYMENT.id)).deploymentUrl).toBeNull();
        }
        respond({ ...DEPLOYMENT, readyState: 'READY', aliasError: { code: 'alias_failed' } });
        expect((await getWorkshopVercelDeployment(DEPLOYMENT.id)).state).toBe('ERROR');
    });

    it('refuses unsafe returned URLs and invalid provider responses', async () => {
        respond({ ...DEPLOYMENT, readyState: 'READY', aliasAssigned: true, alias: ['user:password@example.com'],
            inspectorUrl: 'https://vercel.com.attacker.example/deployment' });
        expect(await getWorkshopVercelDeployment(DEPLOYMENT.id)).toMatchObject({ deploymentUrl: null, inspectorUrl: null });
        respond({ id: DEPLOYMENT.id });
        await expect(getWorkshopVercelDeployment(DEPLOYMENT.id)).rejects.toThrow('neplatnou odpověď');
    });

    it('fails before a remote request when configuration is missing', async () => {
        vi.stubEnv('VERCEL_TOKEN', '');
        await expect(deployWorkshopRepositoryToVercel(REPOSITORY)).rejects.toThrow('VERCEL_TOKEN');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('handles authorization, rate limits, malformed JSON and network failures without echoing private errors', async () => {
        for (const status of [401, 403, 429, 500]) {
            respond({ error: { message: 'PRIVATE_API_VALUE' } }, status);
            await expect(deployWorkshopRepositoryToVercel(REPOSITORY)).rejects.not.toThrow('PRIVATE_API_VALUE');
        }
        fetchMock.mockResolvedValueOnce(new Response('not-json'));
        await expect(deployWorkshopRepositoryToVercel(REPOSITORY)).rejects.toThrow('neodpovídá');
        fetchMock.mockRejectedValueOnce(new Error('PRIVATE_API_VALUE'));
        await expect(deployWorkshopRepositoryToVercel(REPOSITORY)).rejects.toThrow('neodpovídá');
    });
});
