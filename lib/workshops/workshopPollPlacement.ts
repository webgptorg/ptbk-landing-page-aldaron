import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import type { WorkshopKind } from '@/lib/workshops/workshopTypes';

/**
 * Where the polls a room shows belong among everything else that room hands over
 *
 * Note: A poll is placed by what it is to the room reading it rather than by a number written beside it, exactly as
 *       every card which shares the material list is, so one rule decides it for every room instead of each room
 *       ordering a column of its own.
 */
export type WorkshopPollPlacement =
    /**
     * Above the materials, which is where a room whose members make their decisions in its polls keeps them
     */
    | 'before-materials'

    /**
     * Below the materials, which is where a room keeps the polls it is merely the subject of
     */
    | 'after-materials';

/**
 * Where a room of one kind shows the polls it has
 *
 * Note: The community owns its polls and decides in them what it does next, so its members are asked before they are
 *       given anything. A workshop occurrence is only the subject of a poll the community attached to it, while
 *       everything the occurrence was held for is in its materials, so an attached poll closes that room rather than
 *       standing between its stage and what it hands over.
 */
export function getWorkshopPollPlacement(workshopKind: WorkshopKind): WorkshopPollPlacement {
    return getWorkshopKindCapabilities(workshopKind).isPollsOffered ? 'before-materials' : 'after-materials';
}
