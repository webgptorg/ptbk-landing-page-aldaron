import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { createWorkshopSubtitle, loadWorkshopSubtitles } from '@/lib/workshops/subtitles/workshopSubtitleDatabase';
import { getAdminWorkshopSubtitleRequest, subtitleErrorResponse, type WorkshopSubtitleRouteContext } from '@/lib/workshops/subtitles/workshopSubtitleRequest';
import { SUBTITLE_CREATE_SCHEMA } from '@/lib/workshops/subtitles/workshopSubtitleTypes';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: WorkshopSubtitleRouteContext) {
    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopSubtitleRequest(request, workshopId);
    if ('response' in workshopData) return workshopData.response;
    try {
        return NextResponse.json({ tracks: await loadWorkshopSubtitles(workshopData.supabase, workshopId),
            isTranscriptionConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()) }, { headers: { 'Cache-Control': 'no-store' } });
    } catch { return subtitleErrorResponse('Titulky se nepodařilo načíst.'); }
}

export async function POST(request: NextRequest, context: WorkshopSubtitleRouteContext) {
    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopSubtitleRequest(request, workshopId);
    if ('response' in workshopData) return workshopData.response;
    const parsed = SUBTITLE_CREATE_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) return subtitleErrorResponse('Zkontrolujte jazyk, text a časy titulků.', 400);
    try {
        return NextResponse.json({ track: await createWorkshopSubtitle(workshopData.supabase, workshopId, parsed.data) },
            { status: 201, headers: { 'Cache-Control': 'no-store' } });
    } catch { return subtitleErrorResponse('Titulky se nepodařilo uložit.'); }
}
