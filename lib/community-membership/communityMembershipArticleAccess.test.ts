import { canReadCommunityMemberArticle } from '@/lib/community-membership/communityMembershipArticleAccess';
import { writeCommunityArticleSessionCookie } from '@/lib/community-membership/communityArticleSessionCookie';
import { writeVerifiedCommunityEmailCookie } from '@/lib/community-membership/communityMembershipIdentity';
import { createInMemorySupabaseClient } from '@/lib/e2e/inMemorySupabase';
import { createWorkshopSessionToken, hashWorkshopSessionToken } from '@/lib/workshops/workshopSession';
import { NextResponse } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { readCookies, getWorkshopDatabase } = vi.hoisted(() => ({
    readCookies: vi.fn(),
    getWorkshopDatabase: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies: readCookies }));
vi.mock('@/lib/workshops/workshopDatabase', () => ({
    getWorkshopDatabaseOrNull: getWorkshopDatabase,
    findWorkshopBySlug: (_supabase: unknown, slug: string) => ({ id: slug, room_kind: 'community' }),
}));

const MEMBER_EMAIL = 'jana@example.com';

function setupCommunitySession({ isTestPayment = false, daysAgo = 0 } = {}) {
    const response = new NextResponse();
    const token = createWorkshopSessionToken();
    writeCommunityArticleSessionCookie(response, 'komunita', token);
    readCookies.mockResolvedValue(response.cookies);
    getWorkshopDatabase.mockReturnValue(createInMemorySupabaseClient({
        workshop_participants: [{
            id: 'member',
            workshop_id: 'komunita',
            email: MEMBER_EMAIL,
            connected_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
            session_token_hash: hashWorkshopSessionToken(token),
        }],
        community_memberships: [{
            id: 'paid',
            community_id: 'vyvojari',
            email: MEMBER_EMAIL,
            status: 'active',
            is_test_payment: isTestPayment,
        }],
    }));
    return response;
}

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
});

describe('community article access', () => {
    it('accepts only the matching current room session for member articles', async () => {
        const response = setupCommunitySession();
        expect(response.cookies.get('community_article_session_vyvojari')?.path).toBe('/cs/komunity/vyvojari');
        expect(await canReadCommunityMemberArticle('vyvojari')).toBe(true);
        expect(await canReadCommunityMemberArticle('promptbook')).toBe(false);

        setupCommunitySession({ daysAgo: 31 });
        expect(await canReadCommunityMemberArticle('vyvojari')).toBe(false);
    });

    it('requires verified e-mail and rejects test memberships for paid articles', async () => {
        vi.stubEnv('COMMUNITY_EMAIL_VERIFICATION_ENABLED', 'true');
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'article-proof-test-key');
        const response = setupCommunitySession();

        expect(await canReadCommunityMemberArticle('vyvojari', 'paid')).toBe(false);
        writeVerifiedCommunityEmailCookie(response, 'different@example.com');
        expect(await canReadCommunityMemberArticle('vyvojari', 'paid')).toBe(false);
        writeVerifiedCommunityEmailCookie(response, MEMBER_EMAIL);
        expect(await canReadCommunityMemberArticle('vyvojari', 'paid')).toBe(true);

        const testPaymentResponse = setupCommunitySession({ isTestPayment: true });
        writeVerifiedCommunityEmailCookie(testPaymentResponse, MEMBER_EMAIL);
        expect(await canReadCommunityMemberArticle('vyvojari', 'paid')).toBe(false);

        vi.stubEnv('COMMUNITY_EMAIL_VERIFICATION_ENABLED', '');
        readCookies.mockResolvedValue(response.cookies);
        expect(await canReadCommunityMemberArticle('vyvojari', 'paid')).toBe(false);
    });
});
