import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { isSubtitleAudioFileValid, transcribeWorkshopSubtitles } from '@/lib/workshops/subtitles/transcribeWorkshopSubtitles';
import { MAXIMAL_SUBTITLE_AUDIO_BYTES, SUBTITLE_LANGUAGE_SCHEMA } from '@/lib/workshops/subtitles/workshopSubtitleTypes';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 90;
const MULTIPART_OVERHEAD_BYTES = 20_000;

/** Browser-local audio is sent only after an administrator explicitly starts subtitle generation. */
export async function POST(request: NextRequest) {
    const unauthorized = getUnauthorizedResponseOrNull(request);
    if (unauthorized) return unauthorized;
    if (!process.env.OPENAI_API_KEY?.trim()) return NextResponse.json({ error: 'Přepis není nastavený. Správce serveru musí nastavit OPENAI_API_KEY.' }, { status: 503 });
    if (Number(request.headers.get('content-length')) > MAXIMAL_SUBTITLE_AUDIO_BYTES + MULTIPART_OVERHEAD_BYTES) {
        return NextResponse.json({ error: 'Zvuková část je příliš velká.' }, { status: 413 });
    }
    const form = await request.formData().catch(() => null);
    const file = form?.get('file');
    const language = SUBTITLE_LANGUAGE_SCHEMA.safeParse(form?.get('language'));
    if (!(file instanceof File) || !isSubtitleAudioFileValid(file) || !language.success) {
        return NextResponse.json({ error: 'Neplatný jazyk nebo zvuková část. Použijte WAV do 3 MB.' }, { status: 400 });
    }
    try {
        return NextResponse.json({ cues: await transcribeWorkshopSubtitles(file, language.data) }, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
        return NextResponse.json({ error: 'Přepis se nezdařil. Zkontrolujte zdrojový zvuk, nastavení OpenAI a zkuste to znovu.' }, { status: 502 });
    }
}
