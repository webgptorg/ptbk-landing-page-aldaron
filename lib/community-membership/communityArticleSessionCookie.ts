import { getCommunityByRoomSlug, type CommunityDefinition } from '@/businesses/community/config';
import { WORKSHOP_SESSION_MAX_AGE_SECONDS } from '@/lib/workshops/workshopConstants';
import type { NextResponse } from 'next/server';

export function getCommunityArticleSessionCookieName(community: CommunityDefinition): string {
    return `community_article_session_${community.id}`;
}

/** A room can extend its session to article pages in its own community. It does not travel to other sites or rooms. */
export function writeCommunityArticleSessionCookie(
    response: NextResponse,
    roomSlug: string,
    sessionToken: string | null,
): void {
    const community = getCommunityByRoomSlug(roomSlug);
    if (community === undefined) {
        return;
    }

    response.cookies.set(getCommunityArticleSessionCookieName(community), sessionToken ?? '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: community.path,
        maxAge: sessionToken === null ? 0 : WORKSHOP_SESSION_MAX_AGE_SECONDS,
    });
}
