import type { SupabaseClient } from '@supabase/supabase-js';
import { WORKSHOP_SUBTITLE_TABLE_NAME, type WorkshopSubtitleTrack, type WorkshopSubtitleDraft, type WorkshopSubtitleValues } from './workshopSubtitleTypes';

type WorkshopSubtitleRow = {
    id: string; language: WorkshopSubtitleTrack['language']; cues: WorkshopSubtitleTrack['cues'];
    source: WorkshopSubtitleTrack['source']; source_youtube_video_id: string | null; source_filename: string | null;
    created_at: string; updated_at: string;
};

function mapWorkshopSubtitle(row: WorkshopSubtitleRow): WorkshopSubtitleTrack {
    return { id: row.id, language: row.language, cues: row.cues, source: row.source,
        sourceYoutubeVideoId: row.source_youtube_video_id, sourceFilename: row.source_filename,
        createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function loadWorkshopSubtitles(database: SupabaseClient, workshopId: string): Promise<WorkshopSubtitleTrack[]> {
    const { data, error } = await database.from(WORKSHOP_SUBTITLE_TABLE_NAME).select('*').eq('workshop_id', workshopId).order('created_at');
    if (error) throw new Error('Titulky se nepodařilo načíst.');
    return (data as WorkshopSubtitleRow[]).map(mapWorkshopSubtitle);
}

export async function createWorkshopSubtitle(database: SupabaseClient, workshopId: string, values: WorkshopSubtitleDraft): Promise<WorkshopSubtitleTrack> {
    const { data, error } = await database.from(WORKSHOP_SUBTITLE_TABLE_NAME).insert({
        workshop_id: workshopId, language: values.language, cues: values.cues, source: values.source,
        source_youtube_video_id: values.sourceYoutubeVideoId, source_filename: values.sourceFilename,
    }).select('*').single();
    if (error || !data) throw new Error('Titulky se nepodařilo uložit.');
    return mapWorkshopSubtitle(data as WorkshopSubtitleRow);
}

export async function updateWorkshopSubtitle(database: SupabaseClient, workshopId: string, trackId: string, values: WorkshopSubtitleValues): Promise<WorkshopSubtitleTrack | null> {
    const { data, error } = await database.from(WORKSHOP_SUBTITLE_TABLE_NAME).update({
        language: values.language, cues: values.cues, updated_at: new Date().toISOString(),
    }).eq('workshop_id', workshopId).eq('id', trackId).select('*').maybeSingle();
    if (error) throw new Error('Titulky se nepodařilo uložit.');
    return data ? mapWorkshopSubtitle(data as WorkshopSubtitleRow) : null;
}

export async function deleteWorkshopSubtitle(database: SupabaseClient, workshopId: string, trackId: string): Promise<boolean> {
    const { data, error } = await database.from(WORKSHOP_SUBTITLE_TABLE_NAME).delete().eq('workshop_id', workshopId).eq('id', trackId).select('id');
    if (error) throw new Error('Titulky se nepodařilo smazat.');
    return Boolean(data?.length);
}
