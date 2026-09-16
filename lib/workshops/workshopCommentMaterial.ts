import { createWorkshopContent } from '@/lib/workshops/workshopContentCreation';
import { loadWorkshopCommentReference, type WorkshopRow } from '@/lib/workshops/workshopDatabase';
import type { WorkshopContentBlock, WorkshopCommentReference } from '@/lib/workshops/workshopTypes';
import type { WorkshopContentCreateValues } from '@/lib/workshops/workshopValues';
import type { SupabaseClient } from '@supabase/supabase-js';

const COMMENT_MATERIAL_TITLE_PREFIX = 'Komentář od ';
const CONVERTED_COMMENT_MATERIAL_SORT_ORDER = 0;
const IS_CONVERTED_COMMENT_MATERIAL_PUBLISHED = true;
const IS_CONVERTED_COMMENT_MATERIAL_FOLLOW_UP = false;
const IS_CONVERTED_COMMENT_MATERIAL_PAID_MEMBERS_ONLY = false;

export type WorkshopCommentMaterialConversionResult =
    | { readonly kind: 'created'; readonly contentBlock: WorkshopContentBlock }
    | { readonly kind: 'comment-not-found' }
    | { readonly kind: 'error'; readonly errorMessage: string };

/**
 * Creates the ordinary material values from a comment without changing the
 * comment body. The material card names its chat author in the title.
 */
export function createWorkshopCommentMaterialValues(
    comment: Pick<WorkshopCommentReference, 'authorName' | 'body'>,
    unlockAt: string,
): WorkshopContentCreateValues {
    return {
        title: `${COMMENT_MATERIAL_TITLE_PREFIX}${comment.authorName}`,
        bodyMarkdown: comment.body,
        unlockAt,
        sortOrder: CONVERTED_COMMENT_MATERIAL_SORT_ORDER,
        isPublished: IS_CONVERTED_COMMENT_MATERIAL_PUBLISHED,
        isFollowUp: IS_CONVERTED_COMMENT_MATERIAL_FOLLOW_UP,
        isPaidMembersOnly: IS_CONVERTED_COMMENT_MATERIAL_PAID_MEMBERS_ONLY,
    };
}

/**
 * Turns one existing chat comment into an immediately visible material while
 * leaving the source comment untouched in its chat.
 *
 * Note: Every caller comes here after its own authorization check. Keeping the
 * comment lookup and material write together makes an identifier from another
 * workshop incapable of creating a material in this one.
 */
export async function convertWorkshopCommentToMaterial(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    commentId: string,
): Promise<WorkshopCommentMaterialConversionResult> {
    const loadedComment = await loadWorkshopCommentReference(supabase, workshopRow.id, commentId);
    if (loadedComment.errorMessage !== null) {
        return { kind: 'error', errorMessage: loadedComment.errorMessage };
    }
    if (loadedComment.comment === null) {
        return { kind: 'comment-not-found' };
    }

    const createdContent = await createWorkshopContent(
        supabase,
        workshopRow,
        createWorkshopCommentMaterialValues(loadedComment.comment, new Date().toISOString()),
    );
    if (createdContent.errorMessage !== null || createdContent.contentBlock === null) {
        return {
            kind: 'error',
            errorMessage: createdContent.errorMessage ?? 'Material was not returned',
        };
    }

    return { kind: 'created', contentBlock: createdContent.contentBlock };
}
