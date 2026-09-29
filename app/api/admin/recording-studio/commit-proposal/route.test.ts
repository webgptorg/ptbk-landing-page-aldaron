import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { guardMock, branchMock, pageMock } = vi.hoisted(() => ({ guardMock: vi.fn(), branchMock: vi.fn(), pageMock: vi.fn() }));
vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: guardMock }));
vi.mock('@/lib/workshops/resolveWorkshopRepositoryBranches', () => ({ resolveWorkshopRepositoryBranches: branchMock }));
vi.mock('@/lib/github/fetchGithubRepository', () => ({ fetchGithubRepositoryCommitPage: pageMock }));
import { POST } from './route';

function request(calibration: unknown = { sessionSeconds: 2, wallClockAtSessionSeconds: '2026-09-29T10:00:00+02:00' }) {
    return new NextRequest('https://example.com/api/admin/recording-studio/commit-proposal', {
        method: 'POST', body: JSON.stringify({ repository: { url: 'example/workshop', branch: ['main', 'feature/*'] },
            durationSeconds: 10, calibration }),
    });
}

beforeEach(() => { vi.clearAllMocks(); guardMock.mockReturnValue(null); branchMock.mockResolvedValue([{ name: 'main', headSha: null }]); });

describe('calibrated commit proposals', () => {
    it('requires admin access and a timezone-bearing calibration before reading GitHub', async () => {
        guardMock.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        expect((await POST(request())).status).toBe(401);
        expect(branchMock).not.toHaveBeenCalled();
        guardMock.mockReturnValue(null);
        expect((await POST(request({ sessionSeconds: 2, wallClockAtSessionSeconds: '2026-09-29T10:00:00' }))).status).toBe(400);
        expect(pageMock).not.toHaveBeenCalled();
    });

    it('proposes only actual selected-branch SHAs on the calibrated recorded-content clock', async () => {
        const sha = 'a'.repeat(40);
        pageMock.mockResolvedValue({ commits: [
            { sha, committedAt: '2026-09-29T08:00:03.000Z', message: 'Actual work' },
            { sha: 'b'.repeat(40), committedAt: '2026-09-29T08:01:00.000Z', message: 'Later work' },
        ], isMoreAvailable: false });
        const response = await POST(request());
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ proposals: [{ sha, seconds: 5, message: 'Actual work' }], isComplete: true });
        expect(pageMock).toHaveBeenCalledWith(expect.objectContaining({ repository: expect.objectContaining({ owner: 'example', name: 'workshop' }),
            branch: 'main', since: '2026-09-29T07:59:57.000Z', until: '2026-09-29T08:00:09.000Z' }));
    });
});
