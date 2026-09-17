import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { autoApproveWorkshopSubmission } from '@/lib/workshops/workshopAutoApproval';
import { WORKSHOP_COMMENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import {
    createWorkshopCommentAuthor,
    mapWorkshopCommentRow,
    WORKSHOP_COMMENT_COLUMNS,
    type WorkshopCommentRow,
} from '@/lib/workshops/workshopDatabase';
import { areWorkshopCommentLinksEnabled } from '@/lib/workshops/workshopCommentLinks';
import { materializeWorkshopCommentShortLinks } from '@/lib/workshops/workshopMaterialLinks';
import { isWorkshopParticipantModerating } from '@/lib/workshops/workshopModeration';
import { getDisabledWorkshopPanelResponseOrNull } from '@/lib/workshops/workshopParticipantInteraction';
import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import {
    getAuthenticatedWorkshopRequest,
    isAuthenticatedWorkshopRequest,
    type AuthenticatedWorkshopRequest,
} from '@/lib/workshops/workshopRequest';
import { workshopCommentSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

const COMMENT_RATE_LIMIT_ERROR = 'WORKSHOP_COMMENT_RATE_LIMITED';

type WorkshopCommentsRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

/**
 * Refuses a reply which does not answer an approved comment opening a thread of this very room
 *
 * Note: The room offers an answer only under such a comment, so this rejects a stale or a forged request.
 */
async function getUnanswerableWorkshopCommentResponseOrNull(
    authenticatedRequest: AuthenticatedWorkshopRequest,
    parentCommentId: string,
): Promise<NextResponse | null> {
    const { data, error } = await authenticatedRequest.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select('id, parent_comment_id')
        .eq('id', parentCommentId)
        .eq('workshop_id', authenticatedRequest.workshopRow.id)
        .eq('status', 'approved')
        .maybeSingle();

    if (error) {
        console.error('Failed to check the answered workshop comment:', error.message);
        return NextResponse.json({ error: 'Answered comment could not be checked' }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Answered comment not found' }, { status: 404 });
    }
    if (data.parent_comment_id !== null) {
        return NextResponse.json({ error: 'A reply cannot be answered by another reply' }, { status: 400 });
    }

    return null;
}

export async function POST(request: NextRequest, context: WorkshopCommentsRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopCommentSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Comment must contain 1 to 2,000 characters' }, { status: 400 });
    }

    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const disabledChatResponse = getDisabledWorkshopPanelResponseOrNull(authenticatedRequest.workshopRow, 'chat');
    if (disabledChatResponse) {
        return disabledChatResponse;
    }

    const { parentCommentId } = parsedResult.data;
    if (parentCommentId !== null) {
        const unanswerableCommentResponse = await getUnanswerableWorkshopCommentResponseOrNull(
            authenticatedRequest,
            parentCommentId,
        );
        if (unanswerableCommentResponse) {
            return unanswerableCommentResponse;
        }
    }

    const commentStatus = getWorkshopParticipantSubmissionStatus(authenticatedRequest.participant);

    const { data, error } = await authenticatedRequest.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .insert({
            workshop_id: authenticatedRequest.workshopRow.id,
            participant_id: authenticatedRequest.participant.id,
            parent_comment_id: parentCommentId,
            author_name: authenticatedRequest.participant.fullname,
            body: parsedResult.data.body,
            status: commentStatus,
        })
        .select(WORKSHOP_COMMENT_COLUMNS)
        .single();

    if (error?.message.includes(COMMENT_RATE_LIMIT_ERROR)) {
        return NextResponse.json({ error: 'Please wait before sending another comment' }, { status: 429 });
    }
    if (error || data === null) {
        console.error('Failed to save a pending workshop comment:', error?.message ?? 'No comment returned');
        return NextResponse.json({ error: 'Comment could not be saved' }, { status: 500 });
    }

    const { participant } = authenticatedRequest;
    let commentRow = data as WorkshopCommentRow;
    if (areWorkshopCommentLinksEnabled({ isArtificial: false, isAuthorModerator: participant.isModerator })) {
        const materializedComment = await materializeWorkshopCommentShortLinks(authenticatedRequest.supabase, {
            workshopSlug: authenticatedRequest.workshopRow.slug,
            workshopKind: authenticatedRequest.workshopRow.room_kind,
            commentId: commentRow.id,
            bodyMarkdown: commentRow.body,
        });
        if (materializedComment.errorMessage !== null) {
            // The comment itself was persisted. State loading retries the same
            // materializer, and the chat renderer never activates an unshortened URL.
            console.error('Failed to prepare short links for a moderator comment:', materializedComment.errorMessage);
        } else if (materializedComment.bodyMarkdown !== null) {
            commentRow = { ...commentRow, body: materializedComment.bodyMarkdown };
        }
    }

    const isAutomaticallyApproved = await autoApproveWorkshopSubmission(authenticatedRequest.supabase, participant, {
        kind: 'comment',
        id: commentRow.id,
        status: commentRow.status,
        content: { body: commentRow.body },
    });
    if (isAutomaticallyApproved) {
        commentRow = { ...commentRow, status: 'approved' };
    }

    // The participant who just wrote this message is the only author it can have, so it is described from them.
    const comment = mapWorkshopCommentRow(commentRow, false, {
        pinnedCommentId: authenticatedRequest.workshopRow.pinned_comment_id,
        authorByParticipantId: new Map([[participant.id, createWorkshopCommentAuthor(participant)]]),
        isModerationOffered: isWorkshopParticipantModerating(participant),
    });

    if (commentRow.status === 'approved') {
        await broadcastWorkshopEvent(authenticatedRequest.supabase, authenticatedRequest.workshopRow, {
            kind: 'state-changed',
        });
    }

    return NextResponse.json(
        {
            comment,
        },
        { status: 201 },
    );
}
