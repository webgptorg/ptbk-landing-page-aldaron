import { AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME } from '@/businesses/ai-supervize-mini/config';
import {
    ONLINE_WORKSHOP_PARTICIPANT_PATH,
    ONLINE_WORKSHOP_PATH,
    ONLINE_WORKSHOP_REGISTRATION_PLACE_NAME,
} from '@/businesses/online-workshop/config';
import { AI_SUPERVIZE_MINI_PATH } from '@/lib/discounts/discountPlaces';

/**
 * Every kind of event which can be administered, ordered as an administration offers them
 */
export const EVENT_TYPE_VALUES = ['online-workshop', 'ai-supervize-mini', 'external'] as const;

export type EventType = (typeof EVENT_TYPE_VALUES)[number];

export function isEventType(value: string): value is EventType {
    return EVENT_TYPE_VALUES.includes(value as EventType);
}

export type EventTypeDefinition = {
    readonly id: EventType;

    /**
     * How this kind of event is named wherever a term of it is listed
     */
    readonly label: string;

    /**
     * The page of this application which lists the terms of this kind of event and registers visitors for them, or
     * `null` for an event somebody else holds
     *
     * Note: This is what tells an event held by this application apart from an event held elsewhere, see
     *       `isExternalEventType`. An event nobody here holds is reached at the address written on the term itself,
     *       because this application has no page of its own to offer for it.
     */
    readonly landingPagePath: string | null;

    /**
     * Where that landing page records its registrations, which is the `placeName` of every contact it gathers, or
     * `null` when this application registers nobody for this kind of event
     *
     * Note: The term a registration was made for is recorded in the note of that contact, so counting the people
     *       registered for a term means reading the notes gathered in this one place rather than every contact there
     *       is.
     */
    readonly registrationPlaceName: string | null;

    /**
     * The live room the terms of this kind of event are held in, or `null` when this kind of event has no room
     *
     * Note: A kind of event without a room is led to its landing page instead, so nothing ever offers a room which
     *       an event does not have.
     */
    readonly participantPath: string | null;
};

/**
 * Every kind of event together with what it is
 *
 * Note: This is the one place a kind of event is described. Its landing page, the administration, and every list of
 *       terms read it, so offering another kind of event means adding it here rather than changing any of them.
 */
const EVENT_TYPE_DEFINITIONS: Readonly<Record<EventType, EventTypeDefinition>> = {
    'online-workshop': {
        id: 'online-workshop',
        label: 'Online workshop',
        landingPagePath: ONLINE_WORKSHOP_PATH,
        registrationPlaceName: ONLINE_WORKSHOP_REGISTRATION_PLACE_NAME,
        participantPath: ONLINE_WORKSHOP_PARTICIPANT_PATH,
    },
    'ai-supervize-mini': {
        id: 'ai-supervize-mini',
        label: 'AI Supervize Mini',
        landingPagePath: AI_SUPERVIZE_MINI_PATH,
        registrationPlaceName: AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME,
        participantPath: null,
    },

    // Note: A conference or a workshop which a lecturer of the community speaks at is held by its own organizer. This
    //       application only says that it is happening and leads to the organizer, so it has no page, no registration
    //       and no room of its own to name here.
    external: {
        id: 'external',
        label: 'Externí akce',
        landingPagePath: null,
        registrationPlaceName: null,
        participantPath: null,
    },
};

export function getEventTypeDefinition(eventType: EventType): EventTypeDefinition {
    return EVENT_TYPE_DEFINITIONS[eventType];
}

export const EVENT_TYPE_DEFINITION_LIST: readonly EventTypeDefinition[] = EVENT_TYPE_VALUES.map(getEventTypeDefinition);

/**
 * Whether the terms of this kind of event are held by somebody else, so each of them leads to the address written on
 * the term rather than to a page of this application
 *
 * Note: An event held elsewhere is listed exactly like every other event, but this application runs no room for it and
 *       gathers no registration for it, because neither of them is its to run.
 */
export function isExternalEventType(eventType: EventType): boolean {
    return getEventTypeDefinition(eventType).landingPagePath === null;
}

/**
 * Whether this application gathers the registrations for the terms of this kind of event at all
 *
 * Note: A term nobody registers for here has no registered audience to read, which is a different thing from a term
 *       nobody has registered for yet.
 */
export function isEventRegistrationGathered(eventType: EventType): boolean {
    return getEventTypeDefinition(eventType).registrationPlaceName !== null;
}

/**
 * Every place a landing page of this application records a registration for a term in
 */
export const EVENT_REGISTRATION_PLACE_NAMES: readonly string[] = EVENT_TYPE_DEFINITION_LIST.flatMap(
    (eventTypeDefinition) =>
        eventTypeDefinition.registrationPlaceName === null ? [] : [eventTypeDefinition.registrationPlaceName],
);

/**
 * Whether one gathered contact comes from a landing-page registration form of an administered event.
 *
 * Note: Registration notes are meaningful only at these origins. Reusing this rule whenever contacts are selected
 *       keeps an ordinary contact whose note happens to resemble a registration out of an event audience.
 */
export function isEventRegistrationPlaceName(placeName: string | null): boolean {
    return placeName !== null && EVENT_REGISTRATION_PLACE_NAMES.includes(placeName);
}
