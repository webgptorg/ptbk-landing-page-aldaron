/**
 * @vitest-environment jsdom
 */

import { WorkshopRepositoryPanel } from '@/businesses/online-workshop/participant/WorkshopRepositoryPanel';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

describe('the workshop repository panel', () => {
    it('offers every deployment of the connected project in its configured order', () => {
        render(
            <WorkshopRepositoryPanel
                repository={{
                    owner: 'hejny',
                    name: 'promptbook',
                    branch: 'main',
                    deploymentUrls: ['https://workshop.example/app', 'https://preview.workshop.example/app'],
                }}
                progressController={{ progress: null, isProgressRead: false, newCommitShas: new Set<string>() }}
            />,
        );

        expect(screen.getByRole('link', { name: /Živá aplikace 1/ }).getAttribute('href')).toBe(
            'https://workshop.example/app',
        );
        expect(screen.getByRole('link', { name: /Živá aplikace 2/ }).getAttribute('href')).toBe(
            'https://preview.workshop.example/app',
        );
    });
});
