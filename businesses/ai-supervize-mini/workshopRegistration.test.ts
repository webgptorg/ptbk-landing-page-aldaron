import { AI_SUPERVIZE_MINI_EVENT_TYPE } from '@/businesses/ai-supervize-mini/config';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { describe, expect, it } from 'vitest';
import {
    createAiSupervizeMiniStoredWorkshopRegistration,
    createAiSupervizeMiniWorkshopAvailability,
    createAiSupervizeMiniWorkshopAvailabilityFromRegistrationContacts,
    createAiSupervizeMiniWorkshopPrice,
    createAiSupervizeMiniWorkshopRegistrationContactNote,
} from './workshopRegistration';

/**
 * One administered term, as the landing page reads it out of the shared table of events
 */
function createEventOccurrence(occurrence: {
    readonly slug: string;
    readonly startsAt: string;
    readonly locationKind: 'online' | 'onsite';
    readonly locationLabel: string;
    readonly priceCzk: number;
    readonly maximumParticipantCount: number | null;
}): EventOccurrence {
    return {
        id: `id-${occurrence.slug}`,
        kind: 'workshop',
        slug: occurrence.slug,
        title: 'AI Supervize Mini',
        description: 'Workshop AI Supervize Mini pro vývojáře a produkťáky.',
        startsAt: occurrence.startsAt,
        endsAt: null,
        isPublished: true,
        event: {
            type: AI_SUPERVIZE_MINI_EVENT_TYPE,
            locationKind: occurrence.locationKind,
            locationLabel: occurrence.locationLabel,
            priceCzk: occurrence.priceCzk,
            maximumParticipantCount: occurrence.maximumParticipantCount,
            externalUrl: null,
        },
    };
}

const ONSITE_EVENT = createEventOccurrence({
    slug: 'ai-supervize-mini-2026-09-04',
    startsAt: '2026-09-04T10:00:00+02:00',
    locationKind: 'onsite',
    locationLabel: 'Praha',
    priceCzk: 12000,
    maximumParticipantCount: 10,
});
const ONLINE_EVENT = createEventOccurrence({
    slug: 'ai-supervize-mini-2026-09-09',
    startsAt: '2026-09-09T13:00:00+02:00',
    locationKind: 'online',
    locationLabel: '',
    priceCzk: 3000,
    maximumParticipantCount: 50,
});
const UNLIMITED_EVENT = createEventOccurrence({
    slug: 'ai-supervize-mini-2026-09-18',
    startsAt: '2026-09-18T13:00:00+02:00',
    locationKind: 'online',
    locationLabel: '',
    priceCzk: 3000,
    maximumParticipantCount: null,
});

const EVENTS: readonly EventOccurrence[] = [ONSITE_EVENT, ONLINE_EVENT, UNLIMITED_EVENT];

function createRegistrationContactNote(event: EventOccurrence, participantCount: number): string {
    return createAiSupervizeMiniWorkshopRegistrationContactNote(
        createAiSupervizeMiniStoredWorkshopRegistration(
            {
                eventSlug: event.slug,
                participantCount,
                fullname: 'Jana Nováková',
                email: 'jana@example.com',
                company: 'Firma s.r.o.',
                invoiceType: 'company',
                billingDetails: 'Firma s.r.o., IČO 12345678',
                userNote: '',
                discountCode: '',
            },
            event,
            null,
        ),
    );
}

describe('AI Supervize Mini workshop availability', () => {
    it('counts participant totals from actual registration contacts instead of a configured countdown', () => {
        // A registration written before the terms were administered from one place names its term by the day it is
        // held on, so its seats keep being counted against that very term.
        const legacyRegistrationContactNote = [
            'AI Supervize Mini registration',
            'Workshop date: 9. 9. 2026',
            '',
            JSON.stringify({
                workshop: 'AI Supervize Mini',
                selectedDateId: '2026-09-09',
                participantCount: 4,
            }),
        ].join('\n');
        const workshopAvailabilities = createAiSupervizeMiniWorkshopAvailability(EVENTS, [
            createRegistrationContactNote(ONSITE_EVENT, 3),
            legacyRegistrationContactNote,
            JSON.stringify({ workshop: 'AI Supervize Mini', leadType: 'Interested, but cannot attend' }),
            '{not a registration}',
        ]);

        expect(workshopAvailabilities).toEqual([
            {
                eventSlug: ONSITE_EVENT.slug,
                registeredParticipantCount: 3,
                remainingSeatCount: 7,
            },
            {
                eventSlug: ONLINE_EVENT.slug,
                registeredParticipantCount: 4,
                remainingSeatCount: 46,
            },
            {
                eventSlug: UNLIMITED_EVENT.slug,
                registeredParticipantCount: 0,
                remainingSeatCount: null,
            },
        ]);
    });

    it('never shows a negative number of remaining seats when existing contacts exceed capacity', () => {
        const workshopAvailabilities = createAiSupervizeMiniWorkshopAvailability(EVENTS, [
            createRegistrationContactNote(ONSITE_EVENT, 12),
        ]);

        expect(workshopAvailabilities[0]).toMatchObject({ registeredParticipantCount: 12, remainingSeatCount: 0 });
    });

    it('does not let waitlisted registrations consume confirmed workshop seats', () => {
        const workshopAvailabilities = createAiSupervizeMiniWorkshopAvailabilityFromRegistrationContacts(EVENTS, [
            {
                userNote: createRegistrationContactNote(ONSITE_EVENT, 3),
                isWaitlisted: false,
            },
            {
                userNote: createRegistrationContactNote(ONSITE_EVENT, 2),
                isWaitlisted: true,
            },
        ]);

        expect(workshopAvailabilities[0]).toMatchObject({ registeredParticipantCount: 3, remainingSeatCount: 7 });
    });

    it('calculates the 25 percent webinar price from the administered price of each term', () => {
        const webinarDiscount = {
            code: 'WEBINAR_2026_08_20',
            percent: 25,
            remainingUseCount: null,
            subscriptionDiscountDurationMonths: null,
        };

        expect(createAiSupervizeMiniWorkshopPrice(ONSITE_EVENT, 1, webinarDiscount)).toEqual({
            basePriceCzk: 12000,
            discountAmountCzk: 3000,
            finalPriceCzk: 9000,
        });
        expect(createAiSupervizeMiniWorkshopPrice(ONLINE_EVENT, 1, webinarDiscount)).toEqual({
            basePriceCzk: 3000,
            discountAmountCzk: 750,
            finalPriceCzk: 2250,
        });
    });

    it('describes the term a registration was written for by what the administration published', () => {
        const storedRegistration = createAiSupervizeMiniStoredWorkshopRegistration(
            {
                eventSlug: ONSITE_EVENT.slug,
                participantCount: 2,
                fullname: 'Jana Nováková',
                email: 'jana@example.com',
                company: 'Firma s.r.o.',
                invoiceType: 'company',
                billingDetails: 'Firma s.r.o., IČO 12345678',
                userNote: '',
                discountCode: '',
            },
            ONSITE_EVENT,
            null,
        );

        expect(storedRegistration).toMatchObject({
            selectedDateId: ONSITE_EVENT.slug,
            selectedFormat: 'Prezenčně · Praha',
            place: 'Praha',
            unitPriceCzk: 12000,
            basePriceCzk: 24000,
            computedFinalPriceCzk: 24000,
        });
    });
});
