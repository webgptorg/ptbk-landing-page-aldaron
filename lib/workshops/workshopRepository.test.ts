import { createWorkshopRepositoryOrNull } from '@/lib/workshops/workshopRepository';
import { describe, expect, it } from 'vitest';

describe('the stored project of a workshop', () => {
    it('is read as the repository, the branch which is followed, and where the project runs', () => {
        expect(
            createWorkshopRepositoryOrNull({
                repository: 'hejny/promptbook',
                branch: 'main',
                deploymentUrl: 'https://workshop.example/app',
            }),
        ).toEqual({
            owner: 'hejny',
            name: 'promptbook',
            branch: 'main',
            deploymentUrl: 'https://workshop.example/app',
        });
    });

    it('reads selected branches and preserves an explicit all-branches selection', () => {
        expect(
            createWorkshopRepositoryOrNull({
                repository: 'hejny/promptbook',
                branch: ['main', 'feature/rooms'],
                deploymentUrl: null,
            }),
        ).toEqual({
            owner: 'hejny',
            name: 'promptbook',
            branch: ['main', 'feature/rooms'],
            deploymentUrl: null,
        });
        expect(
            createWorkshopRepositoryOrNull({ repository: 'hejny/promptbook', branch: [], deploymentUrl: null }),
        ).toEqual({ owner: 'hejny', name: 'promptbook', branch: [], deploymentUrl: null });
    });

    it('is no project at all for a room which is about none', () => {
        expect(
            createWorkshopRepositoryOrNull({ repository: null, branch: null, deploymentUrl: null }),
        ).toBeNull();
    });

    it('is no project when what is stored names no repository, whatever else is stored beside it', () => {
        expect(
            createWorkshopRepositoryOrNull({
                repository: 'not a repository',
                branch: 'main',
                deploymentUrl: 'https://workshop.example/app',
            }),
        ).toBeNull();
    });

    it('keeps the repository while leaving out a branch or a deployment which cannot be read', () => {
        expect(
            createWorkshopRepositoryOrNull({
                repository: 'https://github.com/hejny/promptbook',
                branch: 'main..next',
                deploymentUrl: 'javascript:alert(1)',
            }),
        ).toEqual({ owner: 'hejny', name: 'promptbook', branch: null, deploymentUrl: null });
    });
});
