/**
 * @vitest-environment jsdom
 */

import { WorkshopRepositoryPanel } from '@/businesses/online-workshop/participant/WorkshopRepositoryPanel';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

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
            repository={{ ...REPOSITORY, deploymentUrls }}
            progressController={PROGRESS_CONTROLLER}
        />,
    );
}

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
    });
});
