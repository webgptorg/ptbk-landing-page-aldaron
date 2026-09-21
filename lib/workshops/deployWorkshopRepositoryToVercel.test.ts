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
            if (readyState === 'ERROR') respond(null);
            expect((await getWorkshopVercelDeployment(DEPLOYMENT.id)).deploymentUrl).toBeNull();
        }
        respond({ ...DEPLOYMENT, readyState: 'READY', aliasError: { code: 'alias_failed' } });
        expect((await getWorkshopVercelDeployment(DEPLOYMENT.id)).state).toBe('ERROR');
    });

    it('returns the reported failure and a chronological build-log excerpt without provider credentials or metadata', async () => {
        respond({ ...DEPLOYMENT, readyState: 'ERROR', errorCode: 'BUILD_FAILED',
            errorMessage: 'Command "npm run build" exited with 1', env: { PRIVATE_VALUE: 'not-for-the-browser' } });
        respond([
            { type: 'stderr', payload: { text: '\u001b[31mError: Command "npm run build" exited with 1\u001b[0m' } },
            { type: 'stderr', payload: { text: 'Type error: src/app/page.tsx:12\nAPI_KEY=build-secret-value' } },
            { type: 'stdout', payload: { text: 'Connecting with test-vercel-token to team_workshops' } },
            { type: 'deployment-state', payload: { text: 'PRIVATE_EVENT_METADATA' } },
        ]);
        const result = await getWorkshopVercelDeployment(DEPLOYMENT.id);
        expect(result).toMatchObject({ state: 'ERROR', deploymentUrl: null, inspectorUrl: DEPLOYMENT.inspectorUrl,
            failure: { stage: 'build', code: 'BUILD_FAILED', message: 'Command "npm run build" exited with 1',
                buildLog: 'Connecting with [skryto] to [skryto]\nType error: src/app/page.tsx:12\nAPI_KEY=[skryto]\nError: Command "npm run build" exited with 1' } });
        for (const secret of ['test-vercel-token', 'team_workshops', 'build-secret-value', 'PRIVATE_EVENT_METADATA', 'not-for-the-browser', DEPLOYMENT.token]) {
            expect(JSON.stringify(result)).not.toContain(secret);
        }
        const [url, options] = fetchMock.mock.calls[1];
        expect(url.pathname).toBe(`/v3/deployments/${DEPLOYMENT.id}/events`);
        expect(Object.fromEntries(url.searchParams)).toEqual({ direction: 'backward', follow: '0', builds: '1', limit: '50', teamId: 'team_workshops' });
        expect(options.headers.Authorization).toBe('Bearer test-vercel-token');
        expect(options.cache).toBe('no-store');
    });

    it.each(['unavailable', 'malformed', 'empty'])('preserves the failure reason when build logs are %s', async (condition) => {
        respond({ ...DEPLOYMENT, readyState: 'ERROR', errorCode: 'BUILD_FAILED', errorMessage: 'Missing required environment variable DATABASE_URL' });
        if (condition === 'unavailable') fetchMock.mockRejectedValueOnce(new Error('PRIVATE_LOG_ERROR'));
        if (condition === 'malformed') respond({ unexpected: 'PRIVATE_LOG_RESPONSE' });
        if (condition === 'empty') respond(null);
        expect(await getWorkshopVercelDeployment(DEPLOYMENT.id)).toMatchObject({ state: 'ERROR', deploymentUrl: null,
            failure: { code: 'BUILD_FAILED', message: 'Missing required environment variable DATABASE_URL', buildLog: null } });
    });

    it('keeps alias failures separate from stale build errors and does not fetch build logs', async () => {
        respond({ ...DEPLOYMENT, readyState: 'READY', aliasAssigned: true, alias: ['workshop.example.com'],
            errorMessage: 'Old build failure', aliasError: { code: 'alias_in_use', message: 'Domain belongs to another project' } });
        expect(await getWorkshopVercelDeployment(DEPLOYMENT.id)).toMatchObject({ state: 'ERROR', deploymentUrl: null,
            failure: { stage: 'alias', code: 'alias_in_use', message: 'Domain belongs to another project', buildLog: null } });
        expect(fetchMock).toHaveBeenCalledOnce();
    });

    it.each(['CANCELED', 'BLOCKED'])('retains the %s reason without requesting build logs', async (readyState) => {
        respond({ ...DEPLOYMENT, readyState, errorMessage: 'Reported reason' });
        expect(await getWorkshopVercelDeployment(DEPLOYMENT.id)).toMatchObject({ state: readyState,
            failure: { code: null, message: 'Reported reason', buildLog: null } });
        expect(fetchMock).toHaveBeenCalledOnce();
    });

    it('tolerates missing or malformed optional diagnostics without losing a terminal failure', async () => {
        respond({ ...DEPLOYMENT, readyState: 'ERROR', errorCode: 123, errorMessage: { private: 'value' } });
        respond([]);
        expect(await getWorkshopVercelDeployment(DEPLOYMENT.id)).toMatchObject({ state: 'ERROR',
            failure: { code: null, message: null, buildLog: null } });
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
