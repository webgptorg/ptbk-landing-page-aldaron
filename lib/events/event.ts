import { isEventLocationKind, type EventLocationKind } from '@/lib/events/eventLocation';
import { isEventType, type EventType } from '@/lib/events/eventTypes';
import { normalizePublicWebPageUrl } from '@/lib/network/publicWebPageUrl';

/**
 * What one term of a public event is, beside the moment it happens at
 *
 * Note: Only a room which happens at a time is an event. A permanent room such as the community has none of this,
 *       which is why every occurrence carries it and every other room carries `null` instead.
 */
export type EventDetails = {
    /**
     * The kind of event this term is, which decides the landing page it is listed on
     */
    readonly type: EventType;
    readonly locationKind: EventLocationKind;

    /**
     * Where a term is held, which only a term held somewhere has
     */
    readonly locationLabel: string;

    /**
     * The price of one seat, where zero is a free event
     */
    readonly priceCzk: number;

    /**
     * How many people fit into this term, or `null` when nobody has to be turned away
     */
    readonly maximumParticipantCount: number | null;

    /**
     * The public address this term is held at, which only a term of an event held by somebody else has
     *
     * Note: An event this application holds itself is reached through the page or the room of its kind of event, so it
     *       carries no address of its own, see `isExternalEventType`.
     */
    readonly externalUrl: string | null;
};

/**
 * What a term of an event is before anybody describes it: a free online term of the workshop everybody starts with
 */
export const DEFAULT_EVENT_DETAILS: EventDetails = {
    type: 'online-workshop',
    locationKind: 'online',
    locationLabel: '',
    priceCzk: 0,
    maximumParticipantCount: null,
    externalUrl: null,
};

/**
 * The stored event fields of one room, as far as they can be trusted
 *
 * Note: A room which is not an event has no event fields at all, and a stored kind of event or place which the
 *       application does not know is deliberately read as no event rather than as a made-up one, so nothing lists a
 *       term it could not describe.
 */
export function createEventDetailsOrNull(values: {
    readonly type: string | null;
    readonly locationKind: string | null;
    readonly locationLabel: string;
    readonly priceCzk: number | null;
    readonly maximumParticipantCount: number | null;
    readonly externalUrl: string | null;
}): EventDetails | null {
    const { type, locationKind, locationLabel, priceCzk, maximumParticipantCount, externalUrl } = values;

    if (type === null || locationKind === null || priceCzk === null) {
        return null;
    }

    if (!isEventType(type) || !isEventLocationKind(locationKind)) {
        console.error(`Unknown event type "${type}" or event location "${locationKind}" was read from the database.`);
        return null;
    }

    return {
        type,
        locationKind,
        locationLabel,
        priceCzk,
        maximumParticipantCount,
        // Note: The address is read as defensively as it is written, so an old or a manually altered row can never
        //       hand an unsafe address on to the browser of a member reading a list of terms.
        externalUrl: externalUrl === null ? null : normalizePublicWebPageUrl(externalUrl),
    };
}
