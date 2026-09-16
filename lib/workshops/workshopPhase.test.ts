import {
    groupWorkshopsByPhase,
    getMostProminentWorkshopPhase,
    getWorkshopExpectedEndsAtMilliseconds,
    getWorkshopPhase,
    isWorkshopEndOpen,
    isWorkshopPhasePast,
    sortWorkshopsByPhase,
    type WorkshopOccurrenceTiming,
} from '@/lib/workshops/workshopPhase';
import { describe, expect, it } from 'vitest';

const CURRENT_TIME_MILLISECONDS = Date.parse('2026-08-21T19:30:00+02:00');

const PAST_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-07-10T19:00:00+02:00',
    endsAt: '2026-07-10T20:30:00+02:00',
};

/**
 * A workshop of yesterday evening, which ended a few hours before the moment these terms are placed against
 */
const FRESHLY_PAST_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-08-20T19:00:00+02:00',
    endsAt: '2026-08-20T20:30:00+02:00',
};
const OLDER_PAST_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-06-10T19:00:00+02:00',
    endsAt: '2026-06-10T20:30:00+02:00',
};
const ONGOING_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
};
const UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
};
const LATER_UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-10-10T19:00:00+02:00',
    endsAt: '2026-10-10T20:30:00+02:00',
};
const OPEN_ENDED_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: null,
};

describe('workshop phase', () => {
    it('places an occurrence against the given moment', () => {
        expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
        expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('freshly-past');
        expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
    });

    it('keeps an occurrence freshly past for a whole day after the end recorded for it', () => {
        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-20T20:30:01+02:00'))).toBe('freshly-past');
        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:01+02:00'))).toBe('past');
    });

    it('counts an occurrence which has only just been held among the ones which are over', () => {
        expect(isWorkshopPhasePast('freshly-past')).toBe(true);
        expect(isWorkshopPhasePast('past')).toBe(true);
        expect(isWorkshopPhasePast('ongoing')).toBe(false);
        expect(isWorkshopPhasePast('upcoming')).toBe(false);
    });

    it('never calls an occurrence whose end is left open freshly past, however long ago it started', () => {
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-22T19:00:00+02:00'))).toBe('ongoing');
    });

    it('keeps a workshop whose end is left open running until an end is recorded', () => {
        expect(isWorkshopEndOpen(OPEN_ENDED_WORKSHOP)).toBe(true);
        expect(isWorkshopEndOpen(ONGOING_WORKSHOP)).toBe(false);
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('ongoing');
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-12-24T18:00:00+01:00'))).toBe('ongoing');
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe('upcoming');
    });

    it('ends a workshop as soon as the administration records the moment it was ended', () => {
        const endedWorkshop: WorkshopOccurrenceTiming = {
            ...OPEN_ENDED_WORKSHOP,
            endsAt: '2026-08-21T20:12:00+02:00',
        };

        expect(isWorkshopEndOpen(endedWorkshop)).toBe(false);
        expect(getWorkshopPhase(endedWorkshop, Date.parse('2026-08-21T20:11:00+02:00'))).toBe('ongoing');
        expect(getWorkshopPhase(endedWorkshop, Date.parse('2026-08-21T20:13:00+02:00'))).toBe('freshly-past');
        expect(getWorkshopPhase(endedWorkshop, Date.parse('2026-08-23T20:13:00+02:00'))).toBe('past');
    });

    it('expects an open end to take as long as a workshop usually does, without ending it', () => {
        expect(getWorkshopExpectedEndsAtMilliseconds(OPEN_ENDED_WORKSHOP)).toBe(
            Date.parse('2026-08-21T20:00:00+02:00'),
        );
        expect(getWorkshopExpectedEndsAtMilliseconds(ONGOING_WORKSHOP)).toBe(
            Date.parse('2026-08-21T20:30:00+02:00'),
        );
    });

    it('keeps an occurrence ongoing until its very end and upcoming until its very start', () => {
        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe('upcoming');
        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
    });
});

describe('workshop phase ordering', () => {
    it('lists what runs now first, then what starts soonest, then what has only just been held, and finally the history', () => {
        const sortedWorkshops = sortWorkshopsByPhase(
            [
                OLDER_PAST_WORKSHOP,
                LATER_UPCOMING_WORKSHOP,
                PAST_WORKSHOP,
                FRESHLY_PAST_WORKSHOP,
                UPCOMING_WORKSHOP,
                ONGOING_WORKSHOP,
            ],
            CURRENT_TIME_MILLISECONDS,
        );

        expect(sortedWorkshops).toEqual([
            ONGOING_WORKSHOP,
            UPCOMING_WORKSHOP,
            LATER_UPCOMING_WORKSHOP,
            FRESHLY_PAST_WORKSHOP,
            PAST_WORKSHOP,
            OLDER_PAST_WORKSHOP,
        ]);
    });

    it('leaves the listed workshops untouched', () => {
        const workshops = [UPCOMING_WORKSHOP, ONGOING_WORKSHOP];

        sortWorkshopsByPhase(workshops, CURRENT_TIME_MILLISECONDS);

        expect(workshops).toEqual([UPCOMING_WORKSHOP, ONGOING_WORKSHOP]);
    });

    it('groups every phase in the same priority and date order as the workshop list', () => {
        const workshopsByPhase = groupWorkshopsByPhase(
            [
                OLDER_PAST_WORKSHOP,
                LATER_UPCOMING_WORKSHOP,
                PAST_WORKSHOP,
                FRESHLY_PAST_WORKSHOP,
                UPCOMING_WORKSHOP,
                ONGOING_WORKSHOP,
            ],
            CURRENT_TIME_MILLISECONDS,
        );

        expect(workshopsByPhase).toEqual({
            ongoing: [ONGOING_WORKSHOP],
            upcoming: [UPCOMING_WORKSHOP, LATER_UPCOMING_WORKSHOP],
            'freshly-past': [FRESHLY_PAST_WORKSHOP],
            past: [PAST_WORKSHOP, OLDER_PAST_WORKSHOP],
        });
    });

    it('lets the most pressing phase speak for a group of occurrences', () => {
        expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'ongoing'])).toBe('ongoing');
        expect(getMostProminentWorkshopPhase(['past', 'freshly-past', 'upcoming'])).toBe('upcoming');
        expect(getMostProminentWorkshopPhase(['past', 'freshly-past'])).toBe('freshly-past');
        expect(getMostProminentWorkshopPhase(['past'])).toBe('past');
        expect(getMostProminentWorkshopPhase([])).toBe('past');
    });
});
