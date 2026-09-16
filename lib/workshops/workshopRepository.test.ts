import { createWorkshopRepositoryOrNull } from '@/lib/workshops/workshopRepository';
import { describe, expect, it } from 'vitest';

describe('the stored project of a workshop', () => {
    it('is read as the repository, the branch which is followed, and where the project runs', () => {
        expect(
            createWorkshopRepositoryOrNull({
                repository: 'hejny/promptbook',
                branch: 'main',
                deploymentUrls: ['https://workshop.example/app'],
            }),
        ).toEqual({
            owner: 'hejny',
            name: 'promptbook',
            branch: 'main',
            deploymentUrls: ['https://workshop.example/app'],
        });
    });

    it('keeps every place the project runs at, in the order they were written', () => {
        expect(
            createWorkshopRepositoryOrNull({
                repository: 'hejny/promptbook',
                branch: null,
                deploymentUrls: ['https://workshop.example/app', 'https://staging.workshop.example/app'],
            }),
        ).toEqual({
            owner: 'hejny',
            name: 'promptbook',
            branch: null,
            deploymentUrls: ['https://workshop.example/app', 'https://staging.workshop.example/app'],
        });
    });

    it('reads selected branch patterns and keeps old all-branches rows as a wildcard', () => {
        expect(
            createWorkshopRepositoryOrNull({
                repository: 'hejny/promptbook',
                branch: ['main', 'feature/*'],
                deploymentUrls: null,
            }),
        ).toEqual({
            owner: 'hejny',
            name: 'promptbook',
            branch: ['main', 'feature/*'],
            deploymentUrls: [],
        });
        expect(
            createWorkshopRepositoryOrNull({ repository: 'hejny/promptbook', branch: [], deploymentUrls: null }),
        ).toEqual({ owner: 'hejny', name: 'promptbook', branch: '*', deploymentUrls: [] });
    });

    it('is no project at all for a room which is about none', () => {
        expect(
            createWorkshopRepositoryOrNull({ repository: null, branch: null, deploymentUrls: null }),
        ).toBeNull();
    });

    it('is no project when what is stored names no repository, whatever else is stored beside it', () => {
        expect(
            createWorkshopRepositoryOrNull({
                repository: 'not a repository',
                branch: 'main',
                deploymentUrls: ['https://workshop.example/app'],
            }),
        ).toBeNull();
    });

    it('keeps the repository while leaving out a branch or a deployment which cannot be read', () => {
        expect(
            createWorkshopRepositoryOrNull({
                repository: 'https://github.com/hejny/promptbook',
                branch: 'main..next',
                deploymentUrls: ['javascript:alert(1)', 'https://workshop.example/app'],
            }),
        ).toEqual({
            owner: 'hejny',
            name: 'promptbook',
            branch: null,
            deploymentUrls: ['https://workshop.example/app'],
        });
    });
});
