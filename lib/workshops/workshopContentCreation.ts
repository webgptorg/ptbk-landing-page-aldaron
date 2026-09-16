import { WORKSHOP_CONTENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import {
    mapWorkshopContentRow,
    WORKSHOP_CONTENT_COLUMNS,
    type WorkshopRow,
} from '@/lib/workshops/workshopDatabase';
import { ensureWorkshopMaterialShortLinks } from '@/lib/workshops/workshopMaterialLinks';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { createWorkshopContentDatabaseValues, type WorkshopContentCreateValues } from '@/lib/workshops/workshopValues';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Persists one ordinary workshop material and tells the room about it.
 *
 * Note: Both the administration editor and a conversion from chat use this one
 * path, so short links and live participant state cannot differ by how the
 * material was created.
 */
export async function createWorkshopContent(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    values: WorkshopContentCreateValues,
): Promise<{ readonly contentBlock: WorkshopContentBlock | null; readonly errorMessage: string | null }> {
    const { data, error } = await supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .insert({ workshop_id: workshopRow.id, ...createWorkshopContentDatabaseValues(values) })
        .select(WORKSHOP_CONTENT_COLUMNS)
        .single();
    if (error || data === null) {
        return { contentBlock: null, errorMessage: error?.message ?? 'Content was not returned' };
    }

    const materialShortLinkErrorMessage = await ensureWorkshopMaterialShortLinks(supabase, {
        workshopSlug: workshopRow.slug,
        workshopKind: workshopRow.room_kind,
        contentBlockId: data.id,
        bodyMarkdown: data.body_markdown,
    });
    if (materialShortLinkErrorMessage !== null) {
        // The source Markdown was persisted safely. The participant-state load
        // will retry preparation rather than exposing an untracked raw URL.
        console.error('Failed to prepare short links for workshop material:', materialShortLinkErrorMessage);
    }

    await broadcastWorkshopEvent(supabase, workshopRow, { kind: 'state-changed' });
    return { contentBlock: mapWorkshopContentRow(data), errorMessage: null };
}
