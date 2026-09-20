import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { guardMock, resolveMock, autoFillMock } = vi.hoisted(() => ({ guardMock: vi.fn(), resolveMock: vi.fn(), autoFillMock: vi.fn() }));
vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: guardMock }));
vi.mock('@/lib/workshops/fetchWorkshopRepositoryCommitRange', () => ({ resolveWorkshopRepositoryCommit: resolveMock, findWorkshopRepositoryCommitByDate: autoFillMock }));
import { POST } from './route';

function request(lookup: unknown) {
    return new NextRequest('https://example.com/api/admin/workshops/repository/commit', {
        method: 'POST', body: JSON.stringify({ repository: { url: 'example/workshop', branch: ['main', 'client-*'] }, lookup }),
    });
}
beforeEach(() => { vi.clearAllMocks(); guardMock.mockReturnValue(null); });

describe('admin commit previews', () => {
    it('requires an admin session before accessing GitHub', async () => {
        guardMock.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        expect((await POST(request({ kind: 'id', commitId: 'a'.repeat(40) }))).status).toBe(401);
        expect(resolveMock).not.toHaveBeenCalled();
    });
    it('validates IDs and timestamps before accessing GitHub', async () => {
        expect((await POST(request({ kind: 'id', commitId: 'main' }))).status).toBe(400);
        expect((await POST(request({ kind: 'date', boundary: 'end', date: null }))).status).toBe(400);
        expect(resolveMock).not.toHaveBeenCalled();
        expect(autoFillMock).not.toHaveBeenCalled();
    });
    it('uses the unsaved branch selection and only the requested date boundary', async () => {
        autoFillMock.mockResolvedValue({ sha: 'b'.repeat(40) });
        const response = await POST(request({ kind: 'date', boundary: 'end', date: '2026-09-01T11:00:00Z' }));
        expect(response.status).toBe(200);
        expect(autoFillMock).toHaveBeenCalledWith(expect.objectContaining({ branch: ['main', 'client-*'] }), 'end', '2026-09-01T11:00:00Z');
    });
});
