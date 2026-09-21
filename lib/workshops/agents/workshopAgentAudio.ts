import {
    MAXIMAL_WORKSHOP_AGENT_AUDIO_BYTES, WORKSHOP_AGENT_AUDIO_MIME_TYPES,
    WORKSHOP_AGENT_ASSIGNMENT_TABLE_NAME, WORKSHOP_AGENT_TABLE_NAME,
} from './workshopAgentTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requestOpenAiAudioTranscription } from '@/lib/audio/openAiAudioTranscription';

const TRANSCRIPTION_TIMEOUT_MILLISECONDS = 20_000;
const DEFAULT_TRANSCRIPTION_MODEL = 'gpt-4o-mini-transcribe';
const AUDIO_FILE_EXTENSIONS: Readonly<Record<string, string>> = {
    'audio/webm': 'webm', 'audio/mp4': 'mp4', 'audio/ogg': 'ogg', 'audio/wav': 'wav',
};

export function isWorkshopAgentAudioFileValid(file: File): boolean {
    return file.size > 0 && file.size <= MAXIMAL_WORKSHOP_AGENT_AUDIO_BYTES &&
        WORKSHOP_AGENT_AUDIO_MIME_TYPES.some((mimeType) => mimeType === file.type.split(';')[0]);
}

export async function hasWorkshopListeningAgents(supabase: SupabaseClient, workshopId: string): Promise<boolean> {
    const { data: assignments, error: assignmentError } = await supabase.from(WORKSHOP_AGENT_ASSIGNMENT_TABLE_NAME)
        .select('agent_id').eq('workshop_id', workshopId).eq('is_listening', true);
    if (assignmentError) throw new Error('Listening agents unavailable');
    if (!assignments?.length) return false;
    const { data: agents, error: agentError } = await supabase.from(WORKSHOP_AGENT_TABLE_NAME)
        .select('id').in('id', assignments.map((assignment) => assignment.agent_id)).eq('is_enabled', true).limit(1);
    if (agentError) throw new Error('Listening agents unavailable');
    return Boolean(agents?.length);
}

/** Audio stays in memory; only its private, bounded transcript is persisted. */
export async function transcribeWorkshopAgentAudio(file: File): Promise<string | null> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey || !isWorkshopAgentAudioFileValid(file)) throw new Error('Invalid audio transcription request');
    const mimeType = file.type.split(';')[0]!;
    const result = await requestOpenAiAudioTranscription({
        file, filename: `workshop.${AUDIO_FILE_EXTENSIONS[mimeType]}`,
        model: process.env.WORKSHOP_AGENT_TRANSCRIPTION_MODEL?.trim() || DEFAULT_TRANSCRIPTION_MODEL,
        responseFormat: 'json', language: 'cs', timeoutMilliseconds: TRANSCRIPTION_TIMEOUT_MILLISECONDS,
    });
    if (!result || typeof result !== 'object' || !('text' in result) || typeof result.text !== 'string' || result.text.length > 6000) {
        throw new Error('Invalid audio transcription');
    }
    return result.text.trim() || null;
}
