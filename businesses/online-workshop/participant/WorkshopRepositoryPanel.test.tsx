/**
 * @vitest-environment jsdom
 */

import { WorkshopRepositoryPanel } from '@/businesses/online-workshop/participant/WorkshopRepositoryPanel';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import { createWorkshopProjectPreviewFallback } from '@/lib/workshops/workshopProjectPreview';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const PREVIEW_MOCKS = vi.hoisted(() => ({ fetchWorkshopProjectPreview: vi.fn() }));
vi.mock('@/businesses/online-workshop/participant/workshopParticipantApi', () => PREVIEW_MOCKS);

const REPOSITORY: WorkshopRepository = {
    owner: 'hejny',
    name: 'promptbook',
    branch: 'main',
    deploymentUrls: [],
};

const PROGRESS_CONTROLLER = {
    progress: { commits: [] },
    isProgressRead: true,
    newCommitShas: new Set<string>(),
};

function renderWorkshopRepositoryPanel(deploymentUrls: readonly string[]) {
    render(
        <WorkshopRepositoryPanel
            workshopSlug="test-workshop"
            repository={{ ...REPOSITORY, deploymentUrls }}
            progressController={PROGRESS_CONTROLLER}
        />,
    );
}

beforeEach(() => {
    PREVIEW_MOCKS.fetchWorkshopProjectPreview.mockReset().mockResolvedValue({ preview: null });
});

afterEach(() => {
    cleanup();
});

describe('the project panel of a workshop room', () => {
    it('opens the one place a project runs at as its live application', () => {
        renderWorkshopRepositoryPanel(['https://workshop.example/app']);

        expect(screen.getByRole('link', { name: /Živá aplikace/ }).getAttribute('href')).toBe(
            'https://workshop.example/app',
        );
    });

    it('offers every place a project runs at, named by its own address', () => {
        renderWorkshopRepositoryPanel(['https://workshop.example/app', 'https://staging.workshop.example/app']);

        expect(screen.getByRole('link', { name: 'workshop.example/app' }).getAttribute('href')).toBe(
            'https://workshop.example/app',
        );
        expect(screen.getByRole('link', { name: 'staging.workshop.example/app' }).getAttribute('href')).toBe(
            'https://staging.workshop.example/app',
        );

        // Note: One repeated name would say nothing about which of the deployments a participant is opening.
        expect(screen.queryByRole('link', { name: /Živá aplikace/ })).toBeNull();
    });

    it('still names the repository of a project which is published nowhere', () => {
        renderWorkshopRepositoryPanel([]);

        expect(screen.getByRole('link', { name: /Repozitář/ })).not.toBeNull();
        expect(screen.queryByRole('link', { name: /Živá aplikace/ })).toBeNull();
        expect(PREVIEW_MOCKS.fetchWorkshopProjectPreview).not.toHaveBeenCalled();
    });

    it('previews the deployed application and keeps its separate repository and deployment links', async () => {
        PREVIEW_MOCKS.fetchWorkshopProjectPreview.mockResolvedValue({
            preview: {
                ...createWorkshopProjectPreviewFallback({ ...REPOSITORY, deploymentUrls: ['https://workshop.example/app'] }),
                title: 'Workshop dashboard',
                description: 'The application built in the workshop.',
                previewImageUrl: 'https://workshop.example/preview.png',
            },
        });
        renderWorkshopRepositoryPanel(['https://workshop.example/app', 'https://staging.workshop.example/app']);

        const previewLink = await screen.findByRole('link', { name: 'Otevřít aplikaci Workshop dashboard' });
        expect(previewLink.getAttribute('href')).toBe('https://workshop.example/app');
        expect(previewLink.getAttribute('target')).toBe('_blank');
        expect(within(previewLink).getByRole('img').getAttribute('src')).toBe('https://workshop.example/preview.png');
        expect(previewLink.textContent).toContain('The application built in the workshop.');
        expect(screen.getByRole('link', { name: /Repozitář/ }).getAttribute('href')).toBe('https://github.com/hejny/promptbook');
        expect(screen.getByRole('link', { name: 'staging.workshop.example/app' })).not.toBeNull();

        fireEvent.error(within(previewLink).getByRole('img'));
        expect(within(previewLink).getByRole('img', { name: 'Živá aplikace workshop.example/app' })).not.toBeNull();
        expect(previewLink.getAttribute('href')).toBe('https://workshop.example/app');
    });
});
