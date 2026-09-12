import {
    createGithubCommitFeedUrl,
    createGithubCommitsUrlForBranchSelection,
    createGithubCommitsUrl,
    createGithubCommitUrl,
    createGithubRepositoryUrl,
    extractGithubBranchName,
    extractGithubBranchSelection,
    extractGithubRepository,
    formatGithubBranchSelection,
    formatGithubRepositoryName,
    serializeGithubBranchSelection,
} from '@/lib/github/githubRepository';
import { describe, expect, it } from 'vitest';

const PROMPTBOOK_REPOSITORY = { owner: 'hejny', name: 'promptbook' };

describe('the repository one workshop is about', () => {
    it('is read from every way a repository is written down', () => {
        [
            'hejny/promptbook',
            'https://github.com/hejny/promptbook',
            'https://www.github.com/hejny/promptbook/',
            'https://github.com/hejny/promptbook.git',
            'https://github.com/hejny/promptbook/tree/main/src',
            'git@github.com:hejny/promptbook.git',
            '  https://github.com/hejny/promptbook  ',
        ].forEach((writtenRepository) => {
            expect(extractGithubRepository(writtenRepository)).toEqual(PROMPTBOOK_REPOSITORY);
        });
    });

    it('keeps a repository which is named with dots, dashes and underscores', () => {
        expect(extractGithubRepository('hejny/promptbook.io_2-0')).toEqual({
            owner: 'hejny',
            name: 'promptbook.io_2-0',
        });
    });

    it('is nothing when what was written names no repository on GitHub', () => {
        [
            '',
            '   ',
            null,
            undefined,
            'hejny',
            'hejny/promptbook/issues',
            'https://gitlab.com/hejny/promptbook',
            'https://github.com/hejny',
            'https://github.com/hejny/..',
            'https://example.com/github.com/hejny/promptbook',
            'not an address at all',
        ].forEach((writtenRepository) => {
            expect(extractGithubRepository(writtenRepository)).toBeNull();
        });
    });

    it('is written the way GitHub itself writes it', () => {
        expect(formatGithubRepositoryName(PROMPTBOOK_REPOSITORY)).toBe('hejny/promptbook');
    });
});

describe('the branch one workshop follows', () => {
    it('is read as it was written, including a branch whose name carries slashes', () => {
        expect(extractGithubBranchName('main')).toBe('main');
        expect(extractGithubBranchName('  feature/repository-panel  ')).toBe('feature/repository-panel');
        expect(extractGithubBranchName('release-1.0')).toBe('release-1.0');
    });

    it('is nothing when what was written is no branch name', () => {
        ['', '   ', null, undefined, 'main..next', '/main', 'main/', 'my branch', 'main?x=1'].forEach(
            (writtenBranch) => {
                expect(extractGithubBranchName(writtenBranch)).toBeNull();
            },
        );
    });

    it('reads one, several, and all branches without confusing all branches with the default branch', () => {
        expect(extractGithubBranchSelection('main')).toBe('main');
        expect(extractGithubBranchSelection(['main', 'feature/rooms'])).toEqual(['main', 'feature/rooms']);
        expect(extractGithubBranchSelection([])).toEqual([]);
        expect(extractGithubBranchSelection(['main', 'main'])).toBeNull();
        expect(serializeGithubBranchSelection(null)).toBeNull();
        expect(serializeGithubBranchSelection('main')).toEqual(['main']);
        expect(serializeGithubBranchSelection([])).toEqual([]);
        expect(formatGithubBranchSelection(null)).toBeNull();
        expect(formatGithubBranchSelection(['main', 'feature/rooms'])).toBe('main, feature/rooms');
        expect(formatGithubBranchSelection([])).toBe('Všechny větve');
    });
});

describe('the addresses of a connected repository', () => {
    it('are all built from the repository itself, so a room can only ever link into it', () => {
        expect(createGithubRepositoryUrl(PROMPTBOOK_REPOSITORY)).toBe('https://github.com/hejny/promptbook');
        expect(createGithubCommitUrl(PROMPTBOOK_REPOSITORY, 'a1b2c3d')).toBe(
            'https://github.com/hejny/promptbook/commit/a1b2c3d',
        );
    });

    it('follow the branch of the workshop, or the branch of the repository itself when it follows none', () => {
        expect(createGithubCommitsUrl(PROMPTBOOK_REPOSITORY, null)).toBe('https://github.com/hejny/promptbook/commits');
        expect(createGithubCommitFeedUrl(PROMPTBOOK_REPOSITORY, null)).toBe(
            'https://github.com/hejny/promptbook/commits.atom',
        );
        expect(createGithubCommitFeedUrl(PROMPTBOOK_REPOSITORY, 'feature/rooms')).toBe(
            'https://github.com/hejny/promptbook/commits/feature/rooms.atom',
        );
        expect(createGithubCommitsUrlForBranchSelection(PROMPTBOOK_REPOSITORY, ['feature/rooms'])).toBe(
            'https://github.com/hejny/promptbook/commits/feature/rooms',
        );
        expect(createGithubCommitsUrlForBranchSelection(PROMPTBOOK_REPOSITORY, ['main', 'feature/rooms'])).toBe(
            'https://github.com/hejny/promptbook/commits',
        );
    });
});
