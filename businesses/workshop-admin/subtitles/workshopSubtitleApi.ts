import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import type { SubtitleCue, SubtitleLanguage, WorkshopSubtitleDraft, WorkshopSubtitleTrack, WorkshopSubtitleValues } from '@/lib/workshops/subtitles/workshopSubtitleTypes';

export function createWorkshopSubtitlesApiUrl(workshopId: string): string {
    return `/api/admin/workshops/${encodeURIComponent(workshopId)}/subtitles`;
}

export function saveAdminWorkshopSubtitles(workshopId: string, trackId: string | null, values: WorkshopSubtitleDraft | WorkshopSubtitleValues) {
    return requestAdminJson<{ track: WorkshopSubtitleTrack }>(`${createWorkshopSubtitlesApiUrl(workshopId)}${trackId ? `/${encodeURIComponent(trackId)}` : ''}`, {
        method: trackId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
    });
}

export function importAdminYoutubeSubtitles(workshopId: string, videoId: string, language: 'cs' | 'en', signal: AbortSignal) {
    return requestAdminJson<{ cues: SubtitleCue[]; sourceYoutubeVideoId: string }>(`${createWorkshopSubtitlesApiUrl(workshopId)}/youtube`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId, language }), signal,
    });
}

export async function transcribeAdminWorkshopAudio(workshopId: string, file: File, language: SubtitleLanguage, signal: AbortSignal): Promise<SubtitleCue[]> {
    const form = new FormData();
    form.append('file', file);
    form.append('language', language);
    const { cues } = await requestAdminJson<{ cues: SubtitleCue[] }>(`${createWorkshopSubtitlesApiUrl(workshopId)}/transcribe`, {
        method: 'POST', body: form, signal,
    });
    return cues;
}
