import { readClientIpAddress } from '@/lib/api/readClientIpAddress';
import {
    MAXIMAL_WORKSHOP_PARTICIPANT_USER_AGENT_LENGTH,
    WORKSHOP_PARTICIPANT_TABLE_NAME,
    WORKSHOP_SESSION_MAX_AGE_SECONDS,
    WORKSHOP_SESSION_TOKEN_BYTES,
    getWorkshopSessionCookieName,
} from '@/lib/workshops/workshopConstants';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';

export type WorkshopParticipantRow = {
    readonly id: string;
    readonly fullname: string;
    readonly email: string;
    readonly connected_at: string;
    readonly is_interaction_banned: boolean;
    readonly is_trusted: boolean;
    readonly is_moderator: boolean;
};

/**
 * Columns every query needs to describe a participant to themselves
 *
 * Note: These are only ever read for the participant making the request, so their own contact address is among them.
 *       Everybody else in the room is described by the far smaller author of a message, which carries no contact
 *       details at all.
 */
export const WORKSHOP_PARTICIPANT_COLUMNS =
    'id, fullname, email, connected_at, is_interaction_banned, is_trusted, is_moderator';

export function createWorkshopSessionToken(): string {
    return randomBytes(WORKSHOP_SESSION_TOKEN_BYTES).toString('base64url');
}

export function hashWorkshopSessionToken(sessionToken: string): string {
    return createHash('sha256').update(sessionToken, 'utf8').digest('hex');
}

export function readWorkshopSessionToken(request: NextRequest, workshopSlug: string): string | null {
    return request.cookies.get(getWorkshopSessionCookieName(workshopSlug))?.value ?? null;
}

/**
 * How the session of one room is kept in the browser
 *
 * Note: The path is the narrow one of the very endpoints this session opens, so the cookie of one room never travels
 *       to the endpoints of another. Handing the session out and taking it away are written here together, because a
 *       cookie is only ever cleared by naming exactly the attributes it was set with.
 */
function getWorkshopSessionCookieAttributes(workshopSlug: string) {
    return {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: `/api/workshops/${workshopSlug}`,
    } as const;
}

export function setWorkshopSessionCookie(response: NextResponse, workshopSlug: string, sessionToken: string): void {
    response.cookies.set(getWorkshopSessionCookieName(workshopSlug), sessionToken, {
        ...getWorkshopSessionCookieAttributes(workshopSlug),
        maxAge: WORKSHOP_SESSION_MAX_AGE_SECONDS,
    });
}

/**
 * Takes the session of one room out of the browser, which is what really signs a participant out of it: the cookie is
 * the only copy of their session token there ever was.
 */
export function clearWorkshopSessionCookie(response: NextResponse, workshopSlug: string): void {
    response.cookies.set(getWorkshopSessionCookieName(workshopSlug), '', {
        ...getWorkshopSessionCookieAttributes(workshopSlug),
        maxAge: 0,
    });
}

export function mapWorkshopParticipantRow(row: WorkshopParticipantRow): WorkshopParticipant {
    return {
        id: row.id,
        fullname: row.fullname,
        email: row.email,
        connectedAt: row.connected_at,
        isInteractionBanned: row.is_interaction_banned,
        isTrusted: row.is_trusted,
        isModerator: row.is_moderator,
    };
}

export async function createWorkshopParticipant(
    supabase: SupabaseClient,
    request: NextRequest,
    workshopId: string,
    fullname: string,
    email: string,
): Promise<{ readonly participant: WorkshopParticipant; readonly sessionToken: string } | null> {
    const sessionToken = createWorkshopSessionToken();
    const { data, error } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .insert({
            workshop_id: workshopId,
            fullname,
            email,
            session_token_hash: hashWorkshopSessionToken(sessionToken),
            ip_address: readClientIpAddress(request),
            user_agent: request.headers.get('user-agent')?.slice(0, MAXIMAL_WORKSHOP_PARTICIPANT_USER_AGENT_LENGTH),
        })
        .select(WORKSHOP_PARTICIPANT_COLUMNS)
        .single();

    if (error || data === null) {
        console.error('Failed to connect a workshop participant:', error?.message ?? 'No participant returned');
        return null;
    }

    return { participant: mapWorkshopParticipantRow(data as WorkshopParticipantRow), sessionToken };
}

/**
 * Ends the room session of one participant, leaving everything they did in that room exactly where it is.
 *
 * Note: A participant row is the author of every message, reaction and measured minute they left behind, so signing
 *       out never removes it — it ends the session and nothing else. Because the database keeps a session token of
 *       every participant rather than none at all, the token is replaced by a fresh one which no browser was ever
 *       given, so a copy of the old cookie cannot open the room again either.
 */
export async function endWorkshopParticipantSession(
    supabase: SupabaseClient,
    workshopId: string,
    participantId: string,
): Promise<boolean> {
    const { error } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .update({ session_token_hash: hashWorkshopSessionToken(createWorkshopSessionToken()) })
        .eq('id', participantId)
        .eq('workshop_id', workshopId);

    if (error) {
        console.error('Failed to end the session of a workshop participant:', error.message);
        return false;
    }

    return true;
}

export async function authenticateWorkshopParticipant(
    supabase: SupabaseClient,
    request: NextRequest,
    workshopId: string,
    workshopSlug: string,
): Promise<WorkshopParticipant | null> {
    const sessionToken = readWorkshopSessionToken(request, workshopSlug);

    if (!sessionToken) {
        return null;
    }

    const { data, error } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .select(WORKSHOP_PARTICIPANT_COLUMNS)
        .eq('workshop_id', workshopId)
        .eq('session_token_hash', hashWorkshopSessionToken(sessionToken))
        .maybeSingle();

    if (error) {
        console.error('Failed to authenticate a workshop participant:', error.message);
        return null;
    }

    if (data === null) {
        return null;
    }

    const { error: activityError } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', data.id)
        .eq('workshop_id', workshopId);
    if (activityError) {
        console.error('Failed to update workshop participant activity:', activityError.message);
    }

    return mapWorkshopParticipantRow(data as WorkshopParticipantRow);
}
