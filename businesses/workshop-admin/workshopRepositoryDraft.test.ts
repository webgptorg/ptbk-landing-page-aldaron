import {
    createWorkshopRepositoryDraft,
    createWorkshopRepositoryWriteValues,
} from '@/businesses/workshop-admin/workshopRepositoryDraft';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import { describe, expect, it } from 'vitest';

const REPOSITORY: WorkshopRepository = {
    owner: 'hejny',
    name: 'promptbook',
    branch: ['main', 'client-*', 'feature/*'],
    deploymentUrls: ['https://workshop.example/app', 'https://preview.workshop.example/app'],
};

describe('the workshop repository administration draft', () => {
    it('round-trips branch patterns as one pattern per line', () => {
        const draft = createWorkshopRepositoryDraft(REPOSITORY);

        expect(draft).toEqual({
            repositoryUrl: 'https://github.com/hejny/promptbook',
            branch: 'main\nclient-*\nfeature/*',
            deploymentUrls: 'https://workshop.example/app\nhttps://preview.workshop.example/app',
        });
        expect(createWorkshopRepositoryWriteValues(draft)).toEqual({
            url: 'https://github.com/hejny/promptbook',
            branch: ['main', 'client-*', 'feature/*'],
            deploymentUrls: ['https://workshop.example/app', 'https://preview.workshop.example/app'],
        });
    });

    it('writes an asterisk for all branches and leaves the default branch empty', () => {
        expect(
            createWorkshopRepositoryWriteValues({
                repositoryUrl: 'hejny/promptbook',
                branch: '*',
                deploymentUrls: '',
            }),
        ).toEqual({ url: 'hejny/promptbook', branch: '*', deploymentUrls: [] });
        expect(
            createWorkshopRepositoryWriteValues({
                repositoryUrl: 'hejny/promptbook',
                branch: '',
                deploymentUrls: '',
            }),
        ).toEqual({ url: 'hejny/promptbook', branch: null, deploymentUrls: [] });
    });

    it('shows old all-branches records as the editable wildcard pattern', () => {
        expect(
            createWorkshopRepositoryDraft({ ...REPOSITORY, branch: [] }),
        ).toMatchObject({ branch: '*' });
    });
});
