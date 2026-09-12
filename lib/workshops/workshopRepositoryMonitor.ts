import { fetchWorkshopRepositoryProgress } from '@/lib/workshops/fetchWorkshopRepositoryProgress';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import {
    getGithubSelectedBranchNames,
    type GithubRepository,
} from '@/lib/github/githubRepository';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import {
    MAXIMAL_WORKSHOP_REPOSITORY_MONITOR_COMMIT_COUNT,
    WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS,
    WORKSHOP_REPOSITORY_MONITOR_TARGET_LEASE_SECONDS,
} from '@/lib/workshops/workshopConstants';
import {
    selectNewWorkshopRepositoryCommits,
    type WorkshopRepositoryProgress,
} from '@/lib/workshops/workshopRepositoryProgress';
import type { WorkshopKind } from '@/lib/workshops/workshopTypes';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The room details needed to send a server-authored event to one workshop room */
export type WorkshopRepositoryMonitorRoom = {
    readonly room_kind: WorkshopKind;
    readonly slug: string;
};

export type WorkshopRepositoryMonitorOptions = {
    readonly repository: WorkshopRepository;
    readonly room: WorkshopRepositoryMonitorRoom;
    readonly supabase: SupabaseClient;
};

type WorkshopRepositoryMonitorTarget = {
    readonly room: WorkshopRepositoryMonitorRoom;
    readonly supabase: SupabaseClient;
    lastRequestedAtMilliseconds: number;
};

type WorkshopRepositoryMonitor = {
    readonly key: string;
    readonly repository: WorkshopRepository;
    progress: WorkshopRepositoryProgress | null;
    isProgressBaselineEstablished: boolean;
    readonly knownCommitShas: Set<string>;
    readonly knownCommitShaOrder: string[];
    readonly targetsByRoomSlug: Map<string, WorkshopRepositoryMonitorTarget>;
    lastReadAtMilliseconds: number | null;
    readPromise: Promise<WorkshopRepositoryProgress | null> | null;
    pollTimeout: ReturnType<typeof setTimeout> | null;
};

const repositoryMonitorsByKey = new Map<string, WorkshopRepositoryMonitor>();

function createWorkshopRepositoryMonitorKey(repository: WorkshopRepository): string {
    const branchNames = [...getGithubSelectedBranchNames(repository.branch)].sort().join(',');
    const isDefaultBranchSelected = repository.branch === null;
    return `${repository.owner}/${repository.name}|${isDefaultBranchSelected ? 'default' : branchNames}`;
}

function getOrCreateWorkshopRepositoryMonitor(repository: WorkshopRepository): WorkshopRepositoryMonitor {
    const key = createWorkshopRepositoryMonitorKey(repository);
    const existingMonitor = repositoryMonitorsByKey.get(key);
    if (existingMonitor !== undefined) {
        return existingMonitor;
    }

    const monitor: WorkshopRepositoryMonitor = {
        key,
        repository,
        progress: null,
        isProgressBaselineEstablished: false,
        knownCommitShas: new Set<string>(),
        knownCommitShaOrder: [],
        targetsByRoomSlug: new Map<string, WorkshopRepositoryMonitorTarget>(),
        lastReadAtMilliseconds: null,
        readPromise: null,
        pollTimeout: null,
    };
    repositoryMonitorsByKey.set(key, monitor);
    return monitor;
}

function rememberCommitShas(
    monitor: WorkshopRepositoryMonitor,
    commits: readonly Pick<GithubCommit, 'sha'>[],
): void {
    [...commits].reverse().forEach((commit) => {
        if (monitor.knownCommitShas.has(commit.sha)) {
            return;
        }

        monitor.knownCommitShas.add(commit.sha);
        monitor.knownCommitShaOrder.push(commit.sha);
    });

    while (monitor.knownCommitShaOrder.length > MAXIMAL_WORKSHOP_REPOSITORY_MONITOR_COMMIT_COUNT) {
        const forgottenCommitSha = monitor.knownCommitShaOrder.shift();
        if (forgottenCommitSha !== undefined) {
            monitor.knownCommitShas.delete(forgottenCommitSha);
        }
    }
}

function removeExpiredWorkshopRepositoryMonitorTargets(monitor: WorkshopRepositoryMonitor): void {
    const targetLeaseMilliseconds = WORKSHOP_REPOSITORY_MONITOR_TARGET_LEASE_SECONDS * 1_000;
    const expiresBeforeMilliseconds = Date.now() - targetLeaseMilliseconds;

    monitor.targetsByRoomSlug.forEach((target, roomSlug) => {
        if (target.lastRequestedAtMilliseconds < expiresBeforeMilliseconds) {
            monitor.targetsByRoomSlug.delete(roomSlug);
        }
    });
}

async function broadcastNewRepositoryCommits(
    monitor: WorkshopRepositoryMonitor,
    commits: readonly GithubCommit[],
): Promise<void> {
    removeExpiredWorkshopRepositoryMonitorTargets(monitor);
    const targets = Array.from(monitor.targetsByRoomSlug.values());

    // Progress is newest-first. Sending oldest-first means that a participant who receives several commits in one
    // poll ends with the newest one on the stage, while every commit still reaches the persistent list.
    for (const commit of [...commits].reverse()) {
        await Promise.all(
            targets.map((target) =>
                broadcastWorkshopEvent(target.supabase, target.room, {
                    kind: 'repository-commit',
                    commit,
                }),
            ),
        );
    }
}

async function updateWorkshopRepositoryMonitor(
    monitor: WorkshopRepositoryMonitor,
    progress: WorkshopRepositoryProgress | null,
): Promise<WorkshopRepositoryProgress | null> {
    const newCommits =
        progress === null || !monitor.isProgressBaselineEstablished
            ? []
            : selectNewWorkshopRepositoryCommits(monitor.knownCommitShas, progress.commits);

    if (progress !== null) {
        if (!monitor.isProgressBaselineEstablished) {
            monitor.isProgressBaselineEstablished = true;
        }
        rememberCommitShas(monitor, progress.commits);
    }
    monitor.progress = progress;

    if (newCommits.length > 0) {
        await broadcastNewRepositoryCommits(monitor, newCommits);
    }

    return progress;
}

async function readWorkshopRepositoryMonitor(monitor: WorkshopRepositoryMonitor): Promise<WorkshopRepositoryProgress | null> {
    const currentTimeMilliseconds = Date.now();
    const revalidateMilliseconds = WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS * 1_000;
    if (
        monitor.readPromise === null &&
        monitor.lastReadAtMilliseconds !== null &&
        currentTimeMilliseconds - monitor.lastReadAtMilliseconds < revalidateMilliseconds
    ) {
        return monitor.progress;
    }

    if (monitor.readPromise !== null) {
        return monitor.readPromise;
    }

    monitor.readPromise = fetchWorkshopRepositoryProgress(monitor.repository)
        .catch((error) => {
            console.error('Failed to monitor a workshop repository:', error);
            return null;
        })
        .then((progress) => {
            monitor.lastReadAtMilliseconds = Date.now();
            return updateWorkshopRepositoryMonitor(monitor, progress);
        })
        .finally(() => {
            monitor.readPromise = null;
        });

    return monitor.readPromise;
}

function scheduleWorkshopRepositoryMonitorPoll(monitor: WorkshopRepositoryMonitor): void {
    if (
        monitor.pollTimeout !== null ||
        process.env.SUPABASE_SERVICE_ROLE_KEY === undefined ||
        process.env.SUPABASE_SERVICE_ROLE_KEY === ''
    ) {
        return;
    }

    monitor.pollTimeout = setTimeout(async () => {
        monitor.pollTimeout = null;
        removeExpiredWorkshopRepositoryMonitorTargets(monitor);

        if (monitor.targetsByRoomSlug.size === 0) {
            repositoryMonitorsByKey.delete(monitor.key);
            return;
        }

        await readWorkshopRepositoryMonitor(monitor);
        scheduleWorkshopRepositoryMonitorPoll(monitor);
    }, WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS * 1_000);
}

/**
 * Reads a repository through a per-server monitor and keeps every active room watching that repository as a target.
 *
 * The browser still polls this function's route as a fallback. The monitor adds the fast path: one active repository
 * is read once per revalidation window, then one broadcast reaches every room which has recently asked for it. A
 * serverless instance which sleeps between requests simply falls back to the browser poll and the same GitHub cache.
 */
export async function watchWorkshopRepository(
    options: WorkshopRepositoryMonitorOptions,
): Promise<WorkshopRepositoryProgress | null> {
    const monitor = getOrCreateWorkshopRepositoryMonitor(options.repository);
    removeExpiredWorkshopRepositoryMonitorTargets(monitor);
    monitor.targetsByRoomSlug.set(options.room.slug, {
        room: options.room,
        supabase: options.supabase,
        lastRequestedAtMilliseconds: Date.now(),
    });

    const progress = await readWorkshopRepositoryMonitor(monitor);
    scheduleWorkshopRepositoryMonitorPoll(monitor);
    return progress;
}
