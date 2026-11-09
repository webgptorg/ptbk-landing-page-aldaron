import { describe, expect, it } from 'vitest';
import { COMMUNITY_MEMBERSHIP_METADATA, COMMUNITY_MEMBERSHIP_PAGE_DEFINITION } from './communityMembershipMetadata';

describe('community membership metadata', () => {
    it('keeps personalized query values out of every navigation referrer', () => {
        expect(COMMUNITY_MEMBERSHIP_METADATA.referrer).toBe('origin');
    });

    it('registers the public Czech membership route', () => {
        expect(COMMUNITY_MEMBERSHIP_PAGE_DEFINITION).toMatchObject({
            path: '/cs/komunity/vyvojari/clenstvi',
            language: 'cs',
        });
    });

    it('describes the 199 Kč monthly membership without the retired Premium offer', () => {
        expect(COMMUNITY_MEMBERSHIP_PAGE_DEFINITION.title).toContain('199 Kč měsíčně');
        expect(COMMUNITY_MEMBERSHIP_PAGE_DEFINITION.description).toContain('Živě se připojíte zdarma');
        expect(COMMUNITY_MEMBERSHIP_PAGE_DEFINITION.title).not.toContain('Premium');
        expect(COMMUNITY_MEMBERSHIP_PAGE_DEFINITION.socialDescription).not.toContain('Sedm dní zdarma');
    });
});
