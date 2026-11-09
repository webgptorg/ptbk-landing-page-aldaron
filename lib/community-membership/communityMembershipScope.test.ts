import { getPaidCommunityIdForRoom } from '@/lib/community-membership/communityMembershipScope';
import { describe, expect, it } from 'vitest';

describe('room membership scope', () => {
    it('keeps paid membership in the existing Developers room', () => {
        expect(getPaidCommunityIdForRoom('community', 'komunita', undefined)).toBe('vyvojari');
        expect(getPaidCommunityIdForRoom('community', 'komunita-promptbook', undefined)).toBeNull();
    });

    it('keeps historical and shared event access in Developers and makes Promptbook-only events free', () => {
        expect(getPaidCommunityIdForRoom('workshop', 'old-event', undefined)).toBe('vyvojari');
        expect(getPaidCommunityIdForRoom('workshop', 'unlisted-event', [])).toBe('vyvojari');
        expect(getPaidCommunityIdForRoom('workshop', 'shared-event', ['promptbook', 'vyvojari'])).toBe('vyvojari');
        expect(getPaidCommunityIdForRoom('workshop', 'promptbook-event', ['promptbook'])).toBeNull();
    });
});
