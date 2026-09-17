import type { WorkshopRow } from '@/lib/workshops/workshopDatabase';
import { isWorkshopPanelOffered, type WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import { NextResponse } from 'next/server';

export function getWorkshopInteractionBanResponseOrNull(participant: WorkshopParticipant): NextResponse | null {
    return participant.isInteractionBanned
        ? NextResponse.json(
              { error: 'Interakce nejsou pro tento účet dostupné.' },
              { status: 403 },
          )
        : null;
}

/**
 * Refuses an action of a participant which the room does not offer anymore
 *
 * Note: The room already takes away a switched-off panel and one its kind never had, so this only rejects a stale or
 *       a forged request.
 * Note: Only participants are held back here. The administration writes through its own routes and therefore keeps
 *       reacting and moderating in a room whose panels are switched off.
 */
export function getDisabledWorkshopPanelResponseOrNull(
    workshopRow: WorkshopRow,
    panelKey: WorkshopPanelKey,
): NextResponse | null {
    return isWorkshopPanelOffered(workshopRow.room_kind, workshopRow.disabled_panels, panelKey)
        ? null
        : NextResponse.json({ error: 'Tato část workshopu je právě vypnutá.' }, { status: 403 });
}
