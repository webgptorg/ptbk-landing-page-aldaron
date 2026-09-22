import {
    AI_TA_KRAJTA_INTERNAL_PATH,
    PAVOL_CZECH_INTERNAL_PATH,
    PAVOL_ENGLISH_INTERNAL_PATH,
    createPublicUrl,
    getInternalPathname,
    getPublicDomainRouteByHostname,
    getPublicDomainRouteByInternalPathname,
    getPublicPathname,
    isPrimarySiteHostname,
    normalizeHostname,
} from '@/lib/domains/publicDomainRouting';
import { describe, expect, it } from 'vitest';

describe('public domain routing', () => {
    it('maps every legacy path to exactly one canonical branded URL', () => {
        expect(createPublicUrl(AI_TA_KRAJTA_INTERNAL_PATH)).toBe('https://ai-ta-krajta.cz/');
        expect(createPublicUrl(`${AI_TA_KRAJTA_INTERNAL_PATH}/media-kit?collaboration=partnerstvi#kontakt`)).toBe(
            'https://ai-ta-krajta.cz/media-kit?collaboration=partnerstvi#kontakt',
        );
        expect(createPublicUrl(PAVOL_CZECH_INTERNAL_PATH)).toBe('https://pavolhejny.cz/');
        expect(createPublicUrl(PAVOL_ENGLISH_INTERNAL_PATH)).toBe('https://pavolhejny.com/');
        expect(createPublicUrl(`https://www.ptbk.io${AI_TA_KRAJTA_INTERNAL_PATH}`)).toBe('https://ai-ta-krajta.cz/');
    });

    it('keeps ordinary Promptbook pages and third-party URLs unchanged', () => {
        expect(createPublicUrl('/cs/online-workshop')).toBe('https://ptbk.io/cs/online-workshop');
        expect(createPublicUrl('https://example.com/image.png')).toBe('https://example.com/image.png');
    });

    it('rewrites only the custom-domain paths which have an application route', () => {
        const podcastDomainRoute = getPublicDomainRouteByHostname('ai-ta-krajta.cz');
        const czechPavolDomainRoute = getPublicDomainRouteByHostname('pavolhejny.cz');

        expect(podcastDomainRoute).toBeDefined();
        expect(czechPavolDomainRoute).toBeDefined();
        expect(getInternalPathname(podcastDomainRoute!, '/')).toBe(AI_TA_KRAJTA_INTERNAL_PATH);
        expect(getInternalPathname(podcastDomainRoute!, '/media-kit')).toBe(`${AI_TA_KRAJTA_INTERNAL_PATH}/media-kit`);
        expect(getInternalPathname(podcastDomainRoute!, '/media-kit/')).toBe(`${AI_TA_KRAJTA_INTERNAL_PATH}/media-kit`);
        expect(getInternalPathname(podcastDomainRoute!, '/people/ai-ta-krajta/pavol.png')).toBeUndefined();
        expect(getInternalPathname(czechPavolDomainRoute!, '/')).toBe(PAVOL_CZECH_INTERNAL_PATH);
    });

    it('recognizes nested legacy routes without mistaking a similar prefix for one', () => {
        const podcastDomainRoute = getPublicDomainRouteByInternalPathname(`${AI_TA_KRAJTA_INTERNAL_PATH}/branding`);

        expect(podcastDomainRoute).toBeDefined();
        expect(getPublicPathname(podcastDomainRoute!, `${AI_TA_KRAJTA_INTERNAL_PATH}/branding`)).toBe('/branding');
        expect(getPublicDomainRouteByInternalPathname('/ai-ta-krajtastic')).toBeUndefined();
    });

    it('recognizes the canonical and www primary hostnames', () => {
        expect(isPrimarySiteHostname('ptbk.io')).toBe(true);
        expect(isPrimarySiteHostname('WWW.PTBK.IO.')).toBe(true);
        expect(isPrimarySiteHostname('localhost')).toBe(false);
    });

    it('folds a www. host into its apex for both primary and branded domains', () => {
        expect(normalizeHostname('WWW.AI-TA-KRAJTA.CZ')).toBe('ai-ta-krajta.cz');
        expect(isPrimarySiteHostname('www.ptbk.io')).toBe(true);
        expect(getPublicDomainRouteByHostname('www.pavolhejny.cz')).toBe(getPublicDomainRouteByHostname('pavolhejny.cz'));
        expect(getPublicDomainRouteByHostname('www.pavolhejny.cz')?.internalPath).toBe(PAVOL_CZECH_INTERNAL_PATH);
    });
});
