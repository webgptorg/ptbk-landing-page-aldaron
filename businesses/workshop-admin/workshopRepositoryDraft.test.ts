import {
    createWorkshopRepositoryDraft,
    createWorkshopRepositoryWriteValues,
} from '@/businesses/workshop-admin/workshopRepositoryDraft';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import { describe, expect, it } from 'vitest';

const REPOSITORY: WorkshopRepository = {
    owner: 'hejny',
    name: 'promptbook',
    branch: ['main', 'feature/rooms'],
    deploymentUrl: 'https://workshop.example/app',
};

describe('the workshop repository administration draft', () => {
    it('round-trips selected branches as one branch per line', () => {
        const draft = createWorkshopRepositoryDraft(REPOSITORY);

        expect(draft).toEqual({
            repositoryUrl: 'https://github.com/hejny/promptbook',
            branch: 'main\nfeature/rooms',
            isAllBranches: false,
            deploymentUrl: 'https://workshop.example/app',
        });
        expect(createWorkshopRepositoryWriteValues(draft)).toEqual({
            url: 'https://github.com/hejny/promptbook',
            branch: ['main', 'feature/rooms'],
            deploymentUrl: 'https://workshop.example/app',
        });
    });

    it('writes an explicit all-branches choice separately from an empty default-branch field', () => {
        expect(
            createWorkshopRepositoryWriteValues({
                repositoryUrl: 'hejny/promptbook',
                branch: '',
                isAllBranches: true,
                deploymentUrl: '',
            }),
        ).toEqual({ url: 'hejny/promptbook', branch: [], deploymentUrl: null });
        expect(
            createWorkshopRepositoryWriteValues({
                repositoryUrl: 'hejny/promptbook',
                branch: '',
                isAllBranches: false,
                deploymentUrl: '',
            }),
        ).toEqual({ url: 'hejny/promptbook', branch: null, deploymentUrl: null });
    });
});
