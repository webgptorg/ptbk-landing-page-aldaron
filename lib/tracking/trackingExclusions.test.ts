import {
    isGoogleAnalyticsAllowed,
    isGoogleAnalyticsPageViewAllowed,
    isThirdPartyTrackingAllowed,
    removeSensitiveTrackingParameters,
} from '@/lib/tracking/trackingExclusions';
import { describe, expect, it } from 'vitest';

describe('sensitive page tracking exclusions', () => {
    it('keeps community room URLs and article content out of third-party recording', () => {
        for (const community of ['vyvojari', 'promptbook']) {
            const room = `/cs/komunity/${community}`;
            expect(isThirdPartyTrackingAllowed(room)).toBe(false);
            expect(isGoogleAnalyticsPageViewAllowed(room)).toBe(false);
            expect(isGoogleAnalyticsAllowed(`${room}/clanky/cs/clensky-clanek`)).toBe(false);
        }
        expect(isThirdPartyTrackingAllowed('/cs/komunity')).toBe(true);
    });

    it('excludes admin and workshop participant pages', () => {
        expect(isThirdPartyTrackingAllowed('/admin')).toBe(false);
        expect(isThirdPartyTrackingAllowed('/admin/workshops')).toBe(false);
        expect(isThirdPartyTrackingAllowed('/cs/online-workshop/participant')).toBe(false);
        expect(isThirdPartyTrackingAllowed('/cs/online-workshop')).toBe(true);
    });

    it('allows anonymized Google Analytics events from the participant room without a page view', () => {
        expect(isGoogleAnalyticsAllowed('/admin/workshops')).toBe(false);
        expect(isGoogleAnalyticsAllowed('/cs/online-workshop/participant')).toBe(true);
        expect(isGoogleAnalyticsPageViewAllowed('/cs/online-workshop/participant')).toBe(false);
        expect(isGoogleAnalyticsPageViewAllowed('/cs/online-workshop')).toBe(true);
    });

    it('removes bearer and identity parameters from recorded URLs', () => {
        const sanitizedUrl = removeSensitiveTrackingParameters(
            'https://promptbook.studio/admin?token=secret&email=jane%40example.com&view=workshops',
        );

        expect(sanitizedUrl).toBe('https://promptbook.studio/admin?view=workshops');
    });
});
