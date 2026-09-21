import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminWorkshopSubtitleRequest, subtitleErrorResponse, type WorkshopSubtitleRouteContext } from '@/lib/workshops/subtitles/workshopSubtitleRequest';
import { fetchYoutubeSubtitles } from '@/lib/youtube/fetchYoutubeSubtitles';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 60;
const YOUTUBE_SUBTITLE_REQUEST_SCHEMA = z.object({ language: z.enum(['cs', 'en']), videoId: z.string() });

export async function POST(request: NextRequest, context: WorkshopSubtitleRouteContext) {
    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopSubtitleRequest(request, workshopId);
    if ('response' in workshopData) return workshopData.response;
    const parsed = YOUTUBE_SUBTITLE_REQUEST_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) return subtitleErrorResponse('Vyberte češtinu nebo angličtinu.', 400);
    const videoId = workshopData.workshopRow.youtube_video_id;
    if (!videoId) return subtitleErrorResponse('Workshop nemá nastavené YouTube video.', 400);
    if (parsed.data.videoId !== videoId) return subtitleErrorResponse('Video workshopu se změnilo. Obnovte stránku.', 409);
    try {
        return NextResponse.json({ cues: await fetchYoutubeSubtitles(videoId, parsed.data.language), sourceYoutubeVideoId: videoId },
            { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        return subtitleErrorResponse(error instanceof Error ? error.message : 'Titulky z YouTube nelze načíst.', 502);
    }
}
