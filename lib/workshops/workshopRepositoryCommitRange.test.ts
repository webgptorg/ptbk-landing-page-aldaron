import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWorkshopRepositoryHistory } from '@/lib/workshops/fetchWorkshopRepositoryHistory';
import { findWorkshopRepositoryCommitByDate, resolveWorkshopRepositoryCommit, resolveWorkshopRepositoryCommitBounds } from '@/lib/workshops/fetchWorkshopRepositoryCommitRange';
import { isCommitInWorkshopRepositoryRange } from '@/lib/workshops/workshopRepositoryCommitRange';
import { workshopUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { createWorkshopUpdateDatabaseValues } from '@/lib/workshops/workshopValues';
import { createWorkshopRepositoryOrNull } from '@/lib/workshops/workshopRepository';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';

const { fetchCachedTextMock } = vi.hoisted(() => ({ fetchCachedTextMock: vi.fn() }));
vi.mock('@/lib/network/fetchCachedText', () => ({ fetchCachedText: fetchCachedTextMock }));

const REPOSITORY = { owner: 'example', name: 'workshop', branch: ['main', 'client-*'], deploymentUrls: [] };
const START = createCommit('a', '2026-09-01T10:00:00.000Z');
const END = createCommit('b', '2026-09-01T11:00:00.000Z');
const MIDDLE = createCommit('c', '2026-09-01T10:30:00.000Z');
const BEFORE = createCommit('d', '2026-08-01T10:00:00.000Z');
const AFTER = createCommit('e', '2026-09-20T10:00:00.000Z');
const OTHER_BRANCH = createCommit('f', '2026-09-01T10:45:00.000Z');

function createCommit(character: string, committedAt: string): GithubCommit {
    return { sha: character.repeat(40), committedAt, message: `Commit ${character}`, authorName: 'Workshop author' };
}

function toPayload(commit: GithubCommit) {
    return { sha: commit.sha, commit: { message: commit.message, author: { name: commit.authorName, date: '2020-01-01T00:00:00Z' },
        committer: { date: commit.committedAt } }, parents: [] };
}

function mockGithubResponse(url: URL): unknown {
    if (url.pathname.endsWith('/branches')) return ['main', 'client-demo', 'unrelated'].map((name) => ({ name, commit: { sha: AFTER.sha } }));
    if (url.pathname.endsWith('/workshop')) return { default_branch: 'main' };
    if (url.pathname.includes('/compare/')) return { status: url.pathname.includes(OTHER_BRANCH.sha) ? 'diverged' : 'ahead' };
    if (url.pathname.endsWith('/commits')) {
        const commits = url.searchParams.get('sha') === 'client-demo' ? [MIDDLE, START] : [AFTER, END, START, BEFORE];
        return commits.map(toPayload);
    }
    const commitId = url.pathname.split('/').pop()!;
    const commit = [START, END, OTHER_BRANCH].find((candidate) => candidate.sha.startsWith(commitId));
    return commit === undefined ? null : toPayload(commit);
}

beforeEach(() => {
    fetchCachedTextMock.mockReset();
    fetchCachedTextMock.mockImplementation(async ({ url }: { url: string }) => {
        const payload = mockGithubResponse(new URL(url));
        return payload === null ? null : JSON.stringify(payload);
    });
});

describe('workshop commit ranges across selected branches', () => {
    it('loads an old inclusive range across matching branches and never requests an excluded branch', async () => {
        const progress = await fetchWorkshopRepositoryHistory({ ...REPOSITORY, startCommit: START.sha, endCommit: END.sha }, { page: 1, isExpanded: false });
        expect(progress?.commits.map((commit) => commit.sha)).toEqual([END.sha, MIDDLE.sha, START.sha]);
        expect(progress?.range).toMatchObject({ start: START, end: END });
        const urls = fetchCachedTextMock.mock.calls.map(([options]) => new URL(options.url));
        const historyUrls = urls.filter((url) => url.pathname.endsWith('/commits'));
        expect(historyUrls.map((url) => url.searchParams.get('sha'))).toEqual(['main', 'client-demo']);
        expect(historyUrls.every((url) => url.searchParams.has('since') && url.searchParams.has('until'))).toBe(true);
    });

    it('expands only selected histories and keeps the range metadata for highlighting', async () => {
        const progress = await fetchWorkshopRepositoryHistory({ ...REPOSITORY, startCommit: START.sha, endCommit: END.sha }, { page: 2, isExpanded: true });
        expect(progress?.commits.map((commit) => commit.sha)).toEqual([AFTER.sha, END.sha, MIDDLE.sha, START.sha, BEFORE.sha]);
        expect(progress?.range).toMatchObject({ start: START, end: END });
        const historyUrls = fetchCachedTextMock.mock.calls.map(([options]) => new URL(options.url)).filter((url) => url.pathname.endsWith('/commits'));
        expect(historyUrls.every((url) => url.searchParams.get('page') === '2' && !url.searchParams.has('since') && !url.searchParams.has('until'))).toBe(true);
    });

    it.each([
        [{ start: START, end: null }, [true, true, true, false]],
        [{ start: null, end: END }, [false, true, true, true]],
        [{ start: null, end: null }, [true, true, true, true]],
        [{ start: START, end: START }, [false, false, true, false]],
    ] as const)('treats each absent boundary independently', (range, expected) => {
        expect([AFTER, END, START, BEFORE].map((commit) => isCommitInWorkshopRepositoryRange(commit, range))).toEqual(expected);
    });

    it('uses the actual default branch when no branches were specified', async () => {
        const progress = await fetchWorkshopRepositoryHistory({ ...REPOSITORY, branch: null, endCommit: END.sha }, { page: 1, isExpanded: false });
        expect(progress?.commits.map((commit) => commit.sha)).toEqual([END.sha, START.sha, BEFORE.sha]);
        expect(progress?.branches?.map((branch) => branch.name)).toEqual(['main']);
    });

    it('rejects reversed dates and commits only reachable from excluded branches', async () => {
        await expect(resolveWorkshopRepositoryCommitBounds({ ...REPOSITORY, startCommit: END.sha, endCommit: START.sha })).rejects.toThrow('Počáteční');
        await expect(resolveWorkshopRepositoryCommitBounds({ ...REPOSITORY, startCommit: OTHER_BRANCH.sha })).rejects.toThrow('vybraných větví');
    });

    it('saves canonical IDs and clears both bounds with the repository', async () => {
        const repository = await resolveWorkshopRepositoryCommitBounds({ ...REPOSITORY, startCommit: START.sha.slice(0, 7) });
        const values = createWorkshopUpdateDatabaseValues({ repository });
        expect(values).toMatchObject({ github_repository_start_commit: START.sha, github_repository_end_commit: null });
        expect(createWorkshopRepositoryOrNull({ repository: values.github_repository!, branch: values.github_repository_branches!,
            deploymentUrls: values.deployment_urls!, startCommit: values.github_repository_start_commit, endCommit: values.github_repository_end_commit })).toEqual(repository);
        expect(createWorkshopUpdateDatabaseValues({ repository: null })).toMatchObject({ github_repository_start_commit: null, github_repository_end_commit: null });
    });

    it('normalizes manually entered IDs before asking GitHub for their preview', async () => {
        expect(await resolveWorkshopRepositoryCommit(REPOSITORY, ` ${START.sha.slice(0, 7).toUpperCase()} `))
            .toMatchObject(START);
    });

    it('validates commit IDs while allowing independently omitted or null bounds', () => {
        expect(workshopUpdateSchema.parse({ repository: { url: 'example/workshop', startCommit: 'ABCDEF1', endCommit: null } }).repository).toMatchObject({ startCommit: 'abcdef1' });
        for (const commitId of ['main', 'xyz1234', 'abc', 'a'.repeat(41)]) {
            expect(workshopUpdateSchema.safeParse({ repository: { url: 'example/workshop', endCommit: commitId } }).success).toBe(false);
        }
    });

    it('autofills the first commit at or after the start even beyond the latest 100 commits', async () => {
        fetchCachedTextMock.mockImplementation(async ({ url }: { url: string }) => {
            const address = new URL(url);
            if (!address.pathname.endsWith('/commits')) return JSON.stringify(mockGithubResponse(address));
            if (address.searchParams.get('sha') === 'client-demo') return JSON.stringify([toPayload(MIDDLE)]);
            return JSON.stringify(address.searchParams.get('page') === '1'
                ? Array.from({ length: 100 }, () => toPayload(AFTER)) : [toPayload(START), toPayload(BEFORE)]);
        });
        expect(await findWorkshopRepositoryCommitByDate(REPOSITORY, 'start', START.committedAt)).toMatchObject(START);
        expect(fetchCachedTextMock.mock.calls.some(([options]) => new URL(options.url).searchParams.get('page') === '2')).toBe(true);
    });

    it('autofills the latest commit at or before the end across matching branches', async () => {
        expect(await findWorkshopRepositoryCommitByDate(REPOSITORY, 'end', END.committedAt)).toMatchObject(END);
        await expect(findWorkshopRepositoryCommitByDate(REPOSITORY, 'end', '2010-01-01T00:00:00Z')).rejects.toThrow('odpovídající');
    });

    it('does not turn a failed branch request into a successful partial autofill or graph', async () => {
        fetchCachedTextMock.mockImplementation(async ({ url }: { url: string }) => {
            const address = new URL(url);
            return address.searchParams.get('sha') === 'client-demo' ? null : JSON.stringify(mockGithubResponse(address));
        });
        await expect(findWorkshopRepositoryCommitByDate(REPOSITORY, 'end', END.committedAt)).rejects.toThrow('nepodařilo');
        expect(await fetchWorkshopRepositoryHistory(REPOSITORY, { page: 1, isExpanded: true })).toBeNull();
    });

    it('does not autofill from a partially loaded wildcard branch list', async () => {
        fetchCachedTextMock.mockImplementation(async ({ url }: { url: string }) => {
            const address = new URL(url);
            if (address.pathname.endsWith('/branches')) return address.searchParams.get('page') === '1'
                ? JSON.stringify(Array.from({ length: 100 }, (_, index) => ({ name: `client-${index}`, commit: { sha: AFTER.sha } }))) : null;
            return JSON.stringify(mockGithubResponse(address));
        });
        await expect(findWorkshopRepositoryCommitByDate(REPOSITORY, 'end', END.committedAt)).rejects.toThrow();
        expect(fetchCachedTextMock.mock.calls.some(([options]) => new URL(options.url).pathname.endsWith('/commits'))).toBe(false);
    });
});
