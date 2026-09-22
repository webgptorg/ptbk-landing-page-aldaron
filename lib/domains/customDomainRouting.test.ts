import {
    CUSTOM_DOMAIN_ROUTES,
    createCustomDomainUrlForSourcePath,
    findCustomDomainRouteByHostname,
    findCustomDomainRouteBySourcePath,
    getCustomDomainPublicPathForSourcePath,
    getCustomDomainSourcePathForPublicPath,
} from '@/lib/domains/customDomainRouting';
import { describe, expect, it } from 'vitest';

describe('custom domain routing', () => {
    it('maps every internal page path to its custom-domain equivalent', () => {
        expect(createCustomDomainUrlForSourcePath('/ai-ta-krajta?episode=64')).toBe(
            'https://ai-ta-krajta.cz/?episode=64',
        );
        expect(createCustomDomainUrlForSourcePath('/ai-ta-krajta/media-kit#kontakt')).toBe(
            'https://ai-ta-krajta.cz/media-kit#kontakt',
        );
        expect(createCustomDomainUrlForSourcePath('/cs/pavol')).toBe('https://pavolhejny.cz/');
        expect(createCustomDomainUrlForSourcePath('/en/pavol')).toBe('https://pavolhejny.com/');
    });

    it('does not confuse similarly named ordinary paths with a custom-domain source route', () => {
        expect(findCustomDomainRouteBySourcePath('/ai-ta-krajtarium')).toBeNull();
        expect(getCustomDomainPublicPathForSourcePath('/ai-ta-krajtarium')).toBeNull();
        expect(createCustomDomainUrlForSourcePath('/cs/pavolovna')).toBeNull();
    });

    it('recognizes an incoming hostname regardless of case, trailing dot, or port', () => {
        expect(findCustomDomainRouteByHostname('AI-TA-KRAJTA.CZ.:443')).toEqual(CUSTOM_DOMAIN_ROUTES.AI_TA_KRAJTA);
    });

    it('rewrites only the published paths of a custom domain', () => {
        const route = CUSTOM_DOMAIN_ROUTES.AI_TA_KRAJTA;

        expect(getCustomDomainSourcePathForPublicPath(route, '/')).toBe('/ai-ta-krajta');
        expect(getCustomDomainSourcePathForPublicPath(route, '/media-kit/')).toBe('/ai-ta-krajta/media-kit');
        expect(getCustomDomainSourcePathForPublicPath(route, '/api/ai-ta-krajta/episodes/search')).toBeNull();
        expect(getCustomDomainSourcePathForPublicPath(route, '/privacy')).toBeNull();
    });
});
