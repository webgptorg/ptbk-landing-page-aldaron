import {
    COMMUNITY_VERIFIED_EMAIL_COOKIE,
    isCommunityEmailVerificationRequired,
    readVerifiedCommunityEmail,
    writeVerifiedCommunityEmailCookie,
} from '@/lib/community-membership/communityMembershipIdentity';
import { NextResponse } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
});

describe('verified community e-mail proof', () => {
    it('accepts the same normalized e-mail and rejects a different, changed or expired proof', () => {
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-signing-key');
        vi.stubEnv('COMMUNITY_EMAIL_VERIFICATION_ENABLED', 'true');
        vi.useFakeTimers();
        const response = new NextResponse();

        expect(writeVerifiedCommunityEmailCookie(response, ' Jana@EXAMPLE.com ')).toBe(true);
        const cookie = response.cookies.get(COMMUNITY_VERIFIED_EMAIL_COOKIE);
        expect(cookie?.httpOnly).toBe(true);
        expect(cookie?.path).toBe('/');
        expect(readVerifiedCommunityEmail(cookie?.value)).toBe('jana@example.com');

        const request = { cookies: response.cookies };
        expect(isCommunityEmailVerificationRequired(request, 'Jana@example.com')).toBe(false);
        expect(isCommunityEmailVerificationRequired(request, 'jiri@example.com')).toBe(true);
        expect(readVerifiedCommunityEmail(`a${cookie?.value}`)).toBeNull();

        vi.setSystemTime(Date.now() + 31 * 24 * 60 * 60 * 1000);
        expect(readVerifiedCommunityEmail(cookie?.value)).toBeNull();
    });

    it('requires no proof from existing rooms until verification is explicitly enabled', () => {
        vi.stubEnv('COMMUNITY_EMAIL_VERIFICATION_ENABLED', '');
        expect(isCommunityEmailVerificationRequired({ cookies: new NextResponse().cookies }, 'jana@example.com')).toBe(false);
    });
});
