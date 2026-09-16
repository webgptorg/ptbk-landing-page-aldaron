import {
    formatWorkshopDeploymentName,
    formatWorkshopDeploymentUrls,
    getPrimaryWorkshopDeploymentUrl,
    normalizeWorkshopDeploymentUrls,
} from '@/lib/workshops/workshopDeployments';
import { describe, expect, it } from 'vitest';

describe('the places a workshop project runs at', () => {
    it('keeps every readable address once, in the order it was written', () => {
        expect(
            normalizeWorkshopDeploymentUrls([
                'https://workshop.example/app',
                'https://staging.workshop.example/app',
                'https://workshop.example/app#top',
            ]),
        ).toEqual(['https://workshop.example/app', 'https://staging.workshop.example/app']);
    });

    it('leaves out an address which cannot be opened instead of taking the rest down', () => {
        expect(
            normalizeWorkshopDeploymentUrls(['javascript:alert(1)', 'https://workshop.example/app', 'not an address']),
        ).toEqual(['https://workshop.example/app']);
    });

    it('is nowhere at all for a project which is published nowhere', () => {
        expect(normalizeWorkshopDeploymentUrls(null)).toEqual([]);
        expect(normalizeWorkshopDeploymentUrls([])).toEqual([]);
        expect(getPrimaryWorkshopDeploymentUrl([])).toBeNull();
        expect(formatWorkshopDeploymentUrls([])).toBeNull();
    });

    it('is stood for by the address which was written first', () => {
        expect(
            getPrimaryWorkshopDeploymentUrl(['https://workshop.example/app', 'https://staging.workshop.example/app']),
        ).toBe('https://workshop.example/app');
    });

    it('is exported as one readable line of addresses', () => {
        expect(
            formatWorkshopDeploymentUrls(['https://workshop.example/app', 'https://staging.workshop.example/app']),
        ).toBe('https://workshop.example/app, https://staging.workshop.example/app');
    });

    it('names one deployment by the address it is reached at', () => {
        expect(formatWorkshopDeploymentName('https://workshop.example/')).toBe('workshop.example');
        expect(formatWorkshopDeploymentName('https://www.workshop.example/app/')).toBe('workshop.example/app');
        expect(formatWorkshopDeploymentName('https://staging.workshop.example/app?branch=main')).toBe(
            'staging.workshop.example/app?branch=main',
        );
    });
});
