import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import { VercelApiError } from '@/lib/vercel/vercelApi';

const { deployMock, statusMock } = vi.hoisted(() => ({ deployMock: vi.fn(), statusMock: vi.fn() }));
vi.mock('@/lib/workshops/deployWorkshopRepositoryToVercel', () => ({
    deployWorkshopRepositoryToVercel: deployMock, getWorkshopVercelDeployment: statusMock,
}));
import { GET, POST } from './route';

const DEPLOYMENT = { id: 'dpl_example', state: 'BUILDING', deploymentUrl: null, inspectorUrl: null };
const REQUEST_URL = 'https://example.com/api/admin/workshops/repository/deployment';

function request(method: 'GET' | 'POST', body?: unknown, headers?: Record<string, string>) {
    return new NextRequest(`${REQUEST_URL}?deploymentId=${DEPLOYMENT.id}`, {
        method,
        headers: { cookie: `${ADMIN_SESSION_COOKIE_NAME}=${createAdminSessionValueOrNull()}`, ...headers },
        ...(method === 'POST' ? { body: JSON.stringify(body ?? { repository: { url: 'example/workshop' } }) } : {}),
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ADMIN_PASSWORD', 'test-admin-password');
    deployMock.mockResolvedValue(DEPLOYMENT);
    statusMock.mockResolvedValue(DEPLOYMENT);
});
afterEach(() => vi.unstubAllEnvs());

describe('authenticated workshop deployment API', () => {
    it('refuses unauthenticated and cross-site starts and status requests before accessing Vercel', async () => {
        for (const method of ['GET', 'POST'] as const) {
            const handler = method === 'GET' ? GET : POST;
            expect((await handler(request(method, undefined, { cookie: '' }))).status).toBe(401);
            expect((await handler(request(method, undefined, { origin: 'https://attacker.example' }))).status).toBe(403);
        }
        expect(deployMock).not.toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
    });

    it('validates the repository, existing deployments, JSON and deployment identifier', async () => {
        for (const repository of [null, { url: 'invalid' }, { url: 'example/workshop', deploymentUrls: ['https://example.com/'] }]) {
            expect((await POST(request('POST', { repository }))).status).toBe(400);
        }
        const malformed = request('POST');
        expect((await POST(new NextRequest(REQUEST_URL, { method: 'POST', headers: malformed.headers, body: '{' }))).status).toBe(400);
        expect((await GET(new NextRequest(`${REQUEST_URL}?deploymentId=../other`, { headers: malformed.headers }))).status).toBe(400);
        expect(deployMock).not.toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
    });

    it('starts the entered repository and returns uncached progress', async () => {
        const response = await POST(request('POST'));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ deployment: DEPLOYMENT });
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(deployMock).toHaveBeenCalledWith({ owner: 'example', name: 'workshop', branch: null, deploymentUrls: [] });
        expect((await GET(request('GET'))).status).toBe(200);
        expect(statusMock).toHaveBeenCalledWith(DEPLOYMENT.id);
    });

    it('reports missing configuration and does not expose unexpected internal errors', async () => {
        deployMock.mockRejectedValueOnce(new VercelApiError('Nastavte VERCEL_TOKEN.', 503));
        const response = await POST(request('POST'));
        expect(response.status).toBe(503);
        expect(await response.json()).toEqual({ error: 'Nastavte VERCEL_TOKEN.' });
        statusMock.mockRejectedValueOnce(new Error('PRIVATE_SERVER_VALUE'));
        expect(JSON.stringify(await (await GET(request('GET'))).json())).not.toContain('PRIVATE_SERVER_VALUE');
    });
});
