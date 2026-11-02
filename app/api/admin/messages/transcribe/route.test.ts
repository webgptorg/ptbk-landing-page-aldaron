import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ guard: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: mocks.guard }));
import { POST } from './route';
const request = () => new NextRequest('https://ptbk.io/api/admin/messages/transcribe', { method: 'POST' });
beforeEach(() => {
    vi.resetAllMocks(); mocks.guard.mockResolvedValue(null);
    vi.stubEnv('ELEVENLABS_API_KEY', 'server-only-test-key'); vi.stubEnv('ELEVENLABS_TRANSCRIPTION_MODEL_ID', '');
    vi.stubGlobal('fetch', mocks.fetch);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('message transcription authorization', () => {
    it.each([401, 403])('refuses unauthorized callers (%s) before contacting ElevenLabs', async (status) => {
        mocks.guard.mockResolvedValueOnce(Response.json({ error: 'Denied' }, { status }));
        expect((await POST(request())).status).toBe(status); expect(mocks.fetch).not.toHaveBeenCalled();
    });

    it('returns only one-use auth with no caching and reuses the existing server credential', async () => {
        mocks.fetch.mockResolvedValueOnce(Response.json({ token: 'single-use-test-token', extra: 'provider metadata' }));
        const response = await POST(request());
        expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toContain('no-store');
        expect(await response.json()).toEqual({ token: 'single-use-test-token', modelId: 'scribe_v2' });
        expect(mocks.fetch).toHaveBeenCalledWith('https://api.elevenlabs.io/v1/single-use-token/batch_scribe', expect.objectContaining({
            method: 'POST', cache: 'no-store', headers: { 'xi-api-key': 'server-only-test-key' },
        }));
    });

    it('reports missing configuration without disabling typed context', async () => {
        vi.stubEnv('ELEVENLABS_API_KEY', '');
        expect((await POST(request())).status).toBe(503); expect(mocks.fetch).not.toHaveBeenCalled();
    });

    it.each([Response.json({ detail: 'private-provider-detail' }, { status: 403 }), Response.json({ token: '' })])('does not expose provider responses when token creation fails', async (result) => {
        mocks.fetch.mockResolvedValueOnce(result);
        const response = await POST(request());
        expect(response.status).toBe(502);
        const body = await response.text();
        expect(body).not.toContain('private-provider-detail'); expect(body).not.toContain('server-only-test-key');
        expect(mocks.fetch).toHaveBeenCalledOnce();
    });

    it('handles a network failure without exposing credentials or retrying automatically', async () => {
        mocks.fetch.mockRejectedValueOnce(new Error('sensitive transport detail'));
        const response = await POST(request());
        expect(response.status).toBe(502); expect(await response.text()).not.toContain('sensitive transport detail');
        expect(mocks.fetch).toHaveBeenCalledOnce();
    });
});
