import { getAdminWorkshopSubtitleRequest, subtitleErrorResponse, type WorkshopSubtitleRouteContext } from '@/lib/workshops/subtitles/workshopSubtitleRequest';
import { isSubtitleAudioFileValid, transcribeWorkshopSubtitles } from '@/lib/workshops/subtitles/transcribeWorkshopSubtitles';
import { MAXIMAL_SUBTITLE_AUDIO_BYTES, SUBTITLE_LANGUAGE_SCHEMA } from '@/lib/workshops/subtitles/workshopSubtitleTypes';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 90;
const MULTIPART_OVERHEAD_BYTES = 20_000;

export async function POST(request: NextRequest, context: WorkshopSubtitleRouteContext) {
    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopSubtitleRequest(request, workshopId);
    if ('response' in workshopData) return workshopData.response;
    if (!process.env.OPENAI_API_KEY?.trim()) return subtitleErrorResponse('Generování titulků vyžaduje nastavený OPENAI_API_KEY.', 503);
    if (Number(request.headers.get('content-length')) > MAXIMAL_SUBTITLE_AUDIO_BYTES + MULTIPART_OVERHEAD_BYTES) {
        return subtitleErrorResponse('Zvuková část je příliš velká.', 413);
    }
    const form = await request.formData().catch(() => null);
    const file = form?.get('file');
    const language = SUBTITLE_LANGUAGE_SCHEMA.safeParse(form?.get('language'));
    if (!(file instanceof File) || !isSubtitleAudioFileValid(file) || !language.success) {
        return subtitleErrorResponse('Neplatný jazyk nebo zvuková část. Použijte WAV do 3 MB.', 400);
    }
    try {
        return NextResponse.json({ cues: await transcribeWorkshopSubtitles(file, language.data) }, { headers: { 'Cache-Control': 'no-store' } });
    } catch { return subtitleErrorResponse('Přepis zvuku se nezdařil. Zkontrolujte nahrávku a dostupnost přepisu a zkuste to znovu.', 502); }
}
