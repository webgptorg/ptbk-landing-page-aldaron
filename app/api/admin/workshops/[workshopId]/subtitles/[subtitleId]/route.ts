import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { deleteWorkshopSubtitle, updateWorkshopSubtitle } from '@/lib/workshops/subtitles/workshopSubtitleDatabase';
import { getAdminWorkshopSubtitleRequest, subtitleErrorResponse, type WorkshopSubtitleRouteContext } from '@/lib/workshops/subtitles/workshopSubtitleRequest';
import { SUBTITLE_WRITE_SCHEMA } from '@/lib/workshops/subtitles/workshopSubtitleTypes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function PATCH(request: NextRequest, context: WorkshopSubtitleRouteContext) {
    const { workshopId, subtitleId } = await context.params;
    const workshopData = await getAdminWorkshopSubtitleRequest(request, workshopId);
    if ('response' in workshopData) return workshopData.response;
    const parsed = SUBTITLE_WRITE_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!subtitleId || !z.string().uuid().safeParse(subtitleId).success || !parsed.success) {
        return subtitleErrorResponse('Zkontrolujte jazyk, text a časy titulků.', 400);
    }
    try {
        const track = await updateWorkshopSubtitle(workshopData.supabase, workshopId, subtitleId, parsed.data);
        return track ? NextResponse.json({ track }, { headers: { 'Cache-Control': 'no-store' } }) : subtitleErrorResponse('Titulky nebyly nalezeny.', 404);
    } catch { return subtitleErrorResponse('Titulky se nepodařilo uložit.'); }
}

export async function DELETE(request: NextRequest, context: WorkshopSubtitleRouteContext) {
    const { workshopId, subtitleId } = await context.params;
    const workshopData = await getAdminWorkshopSubtitleRequest(request, workshopId);
    if ('response' in workshopData) return workshopData.response;
    if (!subtitleId || !z.string().uuid().safeParse(subtitleId).success) return subtitleErrorResponse('Neplatné titulky.', 400);
    try {
        return await deleteWorkshopSubtitle(workshopData.supabase, workshopId, subtitleId)
            ? NextResponse.json({ isDeleted: true }) : subtitleErrorResponse('Titulky nebyly nalezeny.', 404);
    } catch { return subtitleErrorResponse('Titulky se nepodařilo smazat.'); }
}
