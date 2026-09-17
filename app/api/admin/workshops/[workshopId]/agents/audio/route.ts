import { getAdminWorkshopAgentRequest } from '@/lib/workshops/agents/workshopAgentAdminRequest';
import { hasWorkshopListeningAgents, isWorkshopAgentAudioFileValid, transcribeWorkshopAgentAudio } from '@/lib/workshops/agents/workshopAgentAudio';
import { isWorkshopAgentConfigured, isWorkshopAgentLiveAudioAllowed } from '@/lib/workshops/agents/workshopAgentPolicy';
import { MAXIMAL_WORKSHOP_AGENT_AUDIO_BYTES, WORKSHOP_AGENT_TRANSCRIPT_TABLE_NAME } from '@/lib/workshops/agents/workshopAgentTypes';
import { scheduleWorkshopAgentWork } from '@/lib/workshops/agents/scheduleWorkshopAgentWork';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 90;
const AUDIO_METADATA_SCHEMA = z.object({ sessionId: z.string().uuid(), sequence: z.coerce.number().int().min(0).max(1_000_000) });
const MULTIPART_OVERHEAD_BYTES = 16_384;
type RouteContext = { readonly params: Promise<{ readonly workshopId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopAgentRequest(request, workshopId);
    if ('response' in workshopData) return workshopData.response;
    if (!isWorkshopAgentConfigured()) return NextResponse.json({ error: 'Na serveru chybí OPENAI_API_KEY.' }, { status: 503 });
    if (!isWorkshopAgentLiveAudioAllowed(workshopData.workshopRow)) {
        return NextResponse.json({ error: 'Živý workshop nebo jeho chat již není dostupný.' }, { status: 409 });
    }
    if (Number(request.headers.get('content-length')) > MAXIMAL_WORKSHOP_AGENT_AUDIO_BYTES + MULTIPART_OVERHEAD_BYTES) {
        return NextResponse.json({ error: 'Zvukový úsek je příliš velký.' }, { status: 413 });
    }
    const form = await request.formData().catch(() => null);
    const file = form?.get('audio');
    const parsed = AUDIO_METADATA_SCHEMA.safeParse({ sessionId: form?.get('sessionId'), sequence: form?.get('sequence') ?? undefined });
    if (!(file instanceof File) || !isWorkshopAgentAudioFileValid(file) || !parsed.success) {
        return NextResponse.json({ error: 'Neplatný zvukový úsek.' }, { status: 400 });
    }
    try {
        if (!await hasWorkshopListeningAgents(workshopData.supabase, workshopId)) {
            return NextResponse.json({ error: 'Žádný agent již nenaslouchá.' }, { status: 409 });
        }
        const { data: isReserved, error } = await workshopData.supabase.rpc('reserve_workshop_agent_audio_chunk', {
            target_workshop_id: workshopId, target_session_id: parsed.data.sessionId, target_sequence: parsed.data.sequence,
        });
        if (error) throw new Error('Audio session unavailable');
        if (!isReserved) return NextResponse.json({ error: 'Relace zvuku vypršela nebo byl úsek již odeslán.' }, { status: 409 });
        const transcript = await transcribeWorkshopAgentAudio(file);
        if (transcript !== null) {
            const { error: saveError } = await workshopData.supabase.from(WORKSHOP_AGENT_TRANSCRIPT_TABLE_NAME).insert({
                workshop_id: workshopId, session_id: parsed.data.sessionId, sequence: parsed.data.sequence, body: transcript,
            });
            if (saveError) throw new Error('Transcript unavailable');
            scheduleWorkshopAgentWork(workshopId);
        }
        return NextResponse.json({ transcript });
    } catch {
        return NextResponse.json({ error: 'Přepis zvuku se nezdařil. Spusťte naslouchání znovu.' }, { status: 502 });
    }
}
