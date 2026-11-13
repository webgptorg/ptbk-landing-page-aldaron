import 'server-only';
import { readMemberEmailCookie } from '@/lib/promptbook-billing/memberAccess';
import { hasLicenseCommunityAccess } from './accounts';
import type { NextRequest } from 'next/server';
/** A typed guest email can never unlock a license seat. */
export async function verifiedLicenseCommunityAccess(request: NextRequest, email: string): Promise<boolean> {
    return readMemberEmailCookie(request) === email.trim().toLowerCase() && (await hasLicenseCommunityAccess(email));
}
export function isPromptbookLicenseRoom(kind: string, slug: string, communities?: readonly string[] | null): boolean {
    return kind === 'community'
        ? slug === 'komunita-promptbook'
        : communities?.length === 1 && communities[0] === 'promptbook';
}
