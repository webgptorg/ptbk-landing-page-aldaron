import {
    EMPTY_WORKSHOP_REPOSITORY_DRAFT,
    createWorkshopRepositoryDraft,
    createWorkshopRepositoryWriteValues,
} from '@/businesses/workshop-admin/workshopRepositoryDraft';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import { describe, expect, it } from 'vitest';

const REPOSITORY: WorkshopRepository = {
    owner: 'hejny',
    name: 'promptbook',
    branch: ['main', 'client-*', 'feature/*'],
    deploymentUrls: ['https://workshop.example/app', 'https://staging.workshop.example/app'],
};

describe('the workshop repository administration draft', () => {
    it('round-trips branch patterns and deployments as one value per line', () => {
        const draft = createWorkshopRepositoryDraft(REPOSITORY);

        expect(draft).toEqual({
            ...EMPTY_WORKSHOP_REPOSITORY_DRAFT,
            repositoryUrl: 'https://github.com/hejny/promptbook',
            branch: 'main\nclient-*\nfeature/*',
            deploymentUrls: 'https://workshop.example/app\nhttps://staging.workshop.example/app',
        });
        expect(createWorkshopRepositoryWriteValues(draft)).toEqual({
            url: 'https://github.com/hejny/promptbook',
            branch: ['main', 'client-*', 'feature/*'],
            deploymentUrls: ['https://workshop.example/app', 'https://staging.workshop.example/app'],
        });
    });

    it('writes an asterisk for all branches and leaves the default branch empty', () => {
        expect(
            createWorkshopRepositoryWriteValues({
                ...EMPTY_WORKSHOP_REPOSITORY_DRAFT,
                repositoryUrl: 'hejny/promptbook',
                branch: '*',
                deploymentUrls: '',
            }),
        ).toEqual({ url: 'hejny/promptbook', branch: '*', deploymentUrls: [] });
        expect(
            createWorkshopRepositoryWriteValues({
                ...EMPTY_WORKSHOP_REPOSITORY_DRAFT,
                repositoryUrl: 'hejny/promptbook',
                branch: '',
                deploymentUrls: '',
            }),
        ).toEqual({ url: 'hejny/promptbook', branch: null, deploymentUrls: [] });
    });

    it('keeps a comma of a written deployment address, which only whitespace separates', () => {
        expect(
            createWorkshopRepositoryWriteValues({
                ...EMPTY_WORKSHOP_REPOSITORY_DRAFT,
                repositoryUrl: 'hejny/promptbook',
                branch: '',
                deploymentUrls: '  https://workshop.example/app?tags=a,b \n\n https://staging.workshop.example/  ',
            }),
        ).toEqual({
            url: 'hejny/promptbook',
            branch: null,
            deploymentUrls: ['https://workshop.example/app?tags=a,b', 'https://staging.workshop.example/'],
        });
    });

    it('shows old all-branches records as the editable wildcard pattern', () => {
        expect(
            createWorkshopRepositoryDraft({ ...REPOSITORY, branch: [] }),
        ).toMatchObject({ branch: '*' });
    });

    it('drops every deployment together with the repository which was cleared', () => {
        expect(
            createWorkshopRepositoryWriteValues({
                ...EMPTY_WORKSHOP_REPOSITORY_DRAFT,
                repositoryUrl: '   ',
                branch: 'main',
                deploymentUrls: 'https://workshop.example/app',
            }),
        ).toBeNull();
    });
});
