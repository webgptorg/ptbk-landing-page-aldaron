import type { WorkshopRow } from '@/lib/workshops/workshopDatabase';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';

export function isWorkshopAgentConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY?.trim()) && process.env.E2E_IN_MEMORY_SUPABASE !== 'true';
}

export function isWorkshopAgentRoomEnabled(room: WorkshopRow): boolean {
    return getWorkshopKindCapabilities(room.room_kind).isAgentsOffered && room.is_published &&
        !room.is_deleted && !room.external_url && !room.disabled_panels.includes('chat');
}

export function isWorkshopAgentLiveAudioAllowed(room: WorkshopRow): boolean {
    return isWorkshopAgentRoomEnabled(room) && getWorkshopKindCapabilities(room.room_kind).isStageOffered &&
        getWorkshopPhase({ startsAt: room.starts_at, endsAt: room.ends_at }) === 'ongoing';
}

/** Silence and invalid/oversized output never become visible chat messages. */
export function parseWorkshopAgentReply(output: string): string | null {
    const body = output.trim();
    return body.length === 0 || body === '[SKIP]' || body.length > 2000 ? null : body;
}
