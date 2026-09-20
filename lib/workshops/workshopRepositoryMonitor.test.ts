import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import type { WorkshopRepositoryProgress } from '@/lib/workshops/workshopRepositoryProgress';
import { MAXIMAL_WORKSHOP_REPOSITORY_MONITOR_COMMIT_COUNT, WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS } from '@/lib/workshops/workshopConstants';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchWorkshopRepositoryProgressMock, broadcastWorkshopEventMock } = vi.hoisted(() => ({
    fetchWorkshopRepositoryProgressMock: vi.fn(),
    broadcastWorkshopEventMock: vi.fn(),
}));

vi.mock('@/lib/workshops/fetchWorkshopRepositoryProgress', () => ({
    fetchWorkshopRepositoryProgress: fetchWorkshopRepositoryProgressMock,
}));
vi.mock('@/lib/workshops/workshopRealtime', () => ({
    broadcastWorkshopEvent: broadcastWorkshopEventMock,
}));

import { watchWorkshopRepository } from '@/lib/workshops/workshopRepositoryMonitor';

const REPOSITORY: WorkshopRepository = {
    owner: 'hejny',
    name: 'promptbook',
    branch: 'main',
    deploymentUrls: [],
};

const REPOSITORY_WITH_NOTIFICATIONS: WorkshopRepository = {
    ...REPOSITORY,
    name: 'promptbook-notifications',
};

const OLD_PROGRESS: WorkshopRepositoryProgress = {
    commits: [
        {
            sha: 'old-commit',
            message: 'Starší commit',
            authorName: 'Pavol Hejný',
            committedAt: '2026-08-20T18:00:00.000Z',
        },
    ],
};

const NEW_PROGRESS: WorkshopRepositoryProgress = {
    commits: [
        {
            sha: 'new-commit',
            message: 'Nový commit',
            authorName: 'Pavol Hejný',
            committedAt: '2026-08-20T19:00:00.000Z',
        },
        ...OLD_PROGRESS.commits,
    ],
};

function createRoom(slug: string) {
    return { room_kind: 'workshop' as const, slug };
}

describe('workshop repository monitor', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
        fetchWorkshopRepositoryProgressMock.mockReset();
        broadcastWorkshopEventMock.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    it('shares one repository read between rooms during the cache window', async () => {
        fetchWorkshopRepositoryProgressMock.mockResolvedValue(OLD_PROGRESS);

        await Promise.all([
            watchWorkshopRepository({ repository: REPOSITORY, room: createRoom('first-room'), supabase: {} as never }),
            watchWorkshopRepository({ repository: REPOSITORY, room: createRoom('second-room'), supabase: {} as never }),
        ]);

        expect(fetchWorkshopRepositoryProgressMock).toHaveBeenCalledOnce();
        expect(broadcastWorkshopEventMock).not.toHaveBeenCalled();

        await watchWorkshopRepository({ repository: REPOSITORY, room: createRoom('first-room'), supabase: {} as never });
        expect(fetchWorkshopRepositoryProgressMock).toHaveBeenCalledOnce();
    });

    it('keeps ranges separate when two workshops follow the same repository and branches', async () => {
        fetchWorkshopRepositoryProgressMock.mockResolvedValueOnce(OLD_PROGRESS).mockResolvedValueOnce(NEW_PROGRESS);
        const repository = { ...REPOSITORY, name: 'independent-ranges' };
        expect(await watchWorkshopRepository({ repository: { ...repository, startCommit: 'a'.repeat(40) },
            room: createRoom('range-first'), supabase: {} as never })).toEqual(OLD_PROGRESS);
        expect(await watchWorkshopRepository({ repository: { ...repository, endCommit: 'b'.repeat(40) },
            room: createRoom('range-second'), supabase: {} as never })).toEqual(NEW_PROGRESS);
        expect(fetchWorkshopRepositoryProgressMock).toHaveBeenCalledTimes(2);
        expect(broadcastWorkshopEventMock).not.toHaveBeenCalled();
    });

    it('broadcasts a commit to every active room after the shared read finds it', async () => {
        fetchWorkshopRepositoryProgressMock.mockResolvedValueOnce(OLD_PROGRESS).mockResolvedValueOnce(NEW_PROGRESS);

        await watchWorkshopRepository({
            repository: REPOSITORY_WITH_NOTIFICATIONS,
            room: createRoom('first-room'),
            supabase: {} as never,
        });
        await vi.advanceTimersByTimeAsync(WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS * 1_000 + 1);
        await watchWorkshopRepository({
            repository: REPOSITORY_WITH_NOTIFICATIONS,
            room: createRoom('second-room'),
            supabase: {} as never,
        });

        expect(fetchWorkshopRepositoryProgressMock).toHaveBeenCalledTimes(2);
        expect(broadcastWorkshopEventMock).toHaveBeenCalledTimes(2);
        expect(broadcastWorkshopEventMock).toHaveBeenNthCalledWith(
            1,
            expect.anything(),
            createRoom('first-room'),
            { kind: 'repository-commit', commit: NEW_PROGRESS.commits[0] },
        );
        expect(broadcastWorkshopEventMock).toHaveBeenNthCalledWith(
            2,
            expect.anything(),
            createRoom('second-room'),
            { kind: 'repository-commit', commit: NEW_PROGRESS.commits[0] },
        );
    });

    it('does not repeatedly announce a multi-branch range larger than its recent-commit cache', async () => {
        const progress: WorkshopRepositoryProgress = {
            commits: Array.from({ length: MAXIMAL_WORKSHOP_REPOSITORY_MONITOR_COMMIT_COUNT + 1 }, (_, index) => ({
                ...OLD_PROGRESS.commits[0], sha: `range-commit-${index}`,
            })),
        };
        const options = {
            repository: { ...REPOSITORY, name: 'large-range', startCommit: 'a'.repeat(40) },
            room: createRoom('large-range-room'), supabase: {} as never,
        };
        fetchWorkshopRepositoryProgressMock.mockResolvedValue(progress);
        await watchWorkshopRepository(options);

        await vi.advanceTimersByTimeAsync(WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS * 1_000 + 1);
        await watchWorkshopRepository(options);

        expect(broadcastWorkshopEventMock).not.toHaveBeenCalled();
    });
});
