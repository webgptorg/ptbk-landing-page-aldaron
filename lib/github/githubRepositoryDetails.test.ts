import { parseGithubRepositoryDetails } from '@/lib/github/githubRepositoryDetails';
import { describe, expect, it } from 'vitest';

const REPOSITORY_ANSWER = JSON.stringify({
    full_name: 'hejny/promptbook',
    description: '  Book of prompts  ',
    default_branch: 'main',
    language: 'TypeScript',
    stargazers_count: 1_275,
    private: false,
});

describe('what GitHub says about a repository', () => {
    it('is read as the few facts which describe the project', () => {
        expect(parseGithubRepositoryDetails(REPOSITORY_ANSWER)).toEqual({
            description: 'Book of prompts',
            defaultBranch: 'main',
            primaryLanguage: 'TypeScript',
            starCount: 1_275,
        });
    });

    it('leaves out what the answer does not say', () => {
        expect(
            parseGithubRepositoryDetails(
                JSON.stringify({ full_name: 'hejny/promptbook', description: null, language: '   ' }),
            ),
        ).toEqual({ description: null, defaultBranch: null, primaryLanguage: null, starCount: 0 });
    });

    it('is nothing at all when the answer describes no repository', () => {
        ['', 'not json', '[]', 'null', JSON.stringify({ message: 'Not Found' })].forEach((answer) => {
            expect(parseGithubRepositoryDetails(answer)).toBeNull();
        });
    });
});
