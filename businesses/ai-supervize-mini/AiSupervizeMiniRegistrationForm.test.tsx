/**
 * @vitest-environment jsdom
 */

import { AI_SUPERVIZE_MINI_EVENT_TYPE } from '@/businesses/ai-supervize-mini/config';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { submitAiSupervizeMiniWorkshopRegistrationMock } = vi.hoisted(() => ({
    submitAiSupervizeMiniWorkshopRegistrationMock: vi.fn(),
}));

vi.mock('@/businesses/ai-supervize-mini/workshopRegistrationApi', () => ({
    AiSupervizeMiniWorkshopRegistrationError: class AiSupervizeMiniWorkshopRegistrationError extends Error {},
    submitAiSupervizeMiniWorkshopRegistration: submitAiSupervizeMiniWorkshopRegistrationMock,
}));

vi.mock('@/lib/discounts/discountCodeApi', () => ({
    validateDiscountCode: vi.fn().mockResolvedValue(null),
}));

import { AiSupervizeMiniRegistrationForm } from './AiSupervizeMiniRegistrationForm';

/**
 * Moment the page is read at, which is far enough from every term for none of them to be named rather than dated
 */
const CURRENT_TIME = '2026-08-20T09:00:00+02:00';

const ONSITE_EVENT: EventOccurrence = {
    id: 'onsite-event-id',
    kind: 'workshop',
    slug: 'ai-supervize-mini-2026-09-04',
    title: 'AI Supervize Mini · Praha',
    description: 'Celodenní prezenční workshop pro vývojáře a produkťáky.',
    startsAt: '2026-09-04T10:00:00+02:00',
    endsAt: '2026-09-04T16:00:00+02:00',
    isPublished: true,
    event: {
        type: AI_SUPERVIZE_MINI_EVENT_TYPE,
        locationKind: 'onsite',
        locationLabel: 'Praha',
        priceCzk: 12000,
        maximumParticipantCount: 10,
        externalUrl: null,
    },
};

const ONLINE_EVENT: EventOccurrence = {
    id: 'online-event-id',
    kind: 'workshop',
    slug: 'ai-supervize-mini-2026-09-09',
    title: 'AI Supervize Mini · online',
    description: 'Odpolední online varianta workshopu AI Supervize Mini.',
    startsAt: '2026-09-09T13:00:00+02:00',
    endsAt: '2026-09-09T17:00:00+02:00',
    isPublished: true,
    event: {
        type: AI_SUPERVIZE_MINI_EVENT_TYPE,
        locationKind: 'online',
        locationLabel: '',
        priceCzk: 3000,
        maximumParticipantCount: 50,
        externalUrl: null,
    },
};

const EVENTS: readonly EventOccurrence[] = [ONSITE_EVENT, ONLINE_EVENT];

describe('AI Supervize Mini registration form', () => {
    afterEach(() => {
        cleanup();
        submitAiSupervizeMiniWorkshopRegistrationMock.mockReset();
    });

    it('prefills the discount input from the code passed by the route', () => {
        render(
            <AiSupervizeMiniRegistrationForm
                events={EVENTS}
                currentTime={CURRENT_TIME}
                initialDiscountCode="webinar-2026-08-20"
                initialActiveDiscountByPlaceId={{
                    'ai-supervize-mini-onsite': null,
                    'ai-supervize-mini-online': null,
                }}
                initialWorkshopAvailabilities={[
                    { eventSlug: ONSITE_EVENT.slug, registeredParticipantCount: 0, remainingSeatCount: 10 },
                    { eventSlug: ONLINE_EVENT.slug, registeredParticipantCount: 0, remainingSeatCount: 50 },
                ]}
            />,
        );

        expect((screen.getByLabelText('Slevový kód') as HTMLInputElement).value).toBe('webinar-2026-08-20');
    });

    it('shows the remaining uses for a prefilled limited code', () => {
        render(
            <AiSupervizeMiniRegistrationForm
                events={EVENTS}
                currentTime={CURRENT_TIME}
                initialDiscountCode="WEBINAR_2026_08_20"
                initialActiveDiscountByPlaceId={{
                    'ai-supervize-mini-onsite': {
                        code: 'WEBINAR_2026_08_20',
                        percent: 25,
                        remainingUseCount: 3,
                        subscriptionDiscountDurationMonths: null,
                    },
                    'ai-supervize-mini-online': null,
                }}
                initialWorkshopAvailabilities={[
                    { eventSlug: ONSITE_EVENT.slug, registeredParticipantCount: 0, remainingSeatCount: 10 },
                    { eventSlug: ONLINE_EVENT.slug, registeredParticipantCount: 0, remainingSeatCount: 50 },
                ]}
            />,
        );

        expect(screen.getByText('Aktivní sleva 25 %. Zbývající počet použití: 3.')).toBeTruthy();
    });

    it('warns about a full term and still submits the completed form to its waitlist', async () => {
        submitAiSupervizeMiniWorkshopRegistrationMock.mockResolvedValue({
            isWaitlisted: true,
            workshopAvailabilities: [
                { eventSlug: ONSITE_EVENT.slug, registeredParticipantCount: 10, remainingSeatCount: 0 },
                { eventSlug: ONLINE_EVENT.slug, registeredParticipantCount: 0, remainingSeatCount: 50 },
            ],
            workshopPrice: { basePriceCzk: 12000, discountAmountCzk: 0, finalPriceCzk: 12000 },
        });
        render(
            <AiSupervizeMiniRegistrationForm
                events={EVENTS}
                currentTime={CURRENT_TIME}
                initialDiscountCode=""
                initialActiveDiscountByPlaceId={{
                    'ai-supervize-mini-onsite': null,
                    'ai-supervize-mini-online': null,
                }}
                initialWorkshopAvailabilities={[
                    { eventSlug: ONSITE_EVENT.slug, registeredParticipantCount: 10, remainingSeatCount: 0 },
                    { eventSlug: ONLINE_EVENT.slug, registeredParticipantCount: 0, remainingSeatCount: 50 },
                ]}
            />,
        );

        expect(screen.getByRole('alert').textContent).toContain('Tento termín je už plně obsazený.');

        fireEvent.change(screen.getByLabelText('Jméno a příjmení'), { target: { value: 'Jana Nováková' } });
        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'jana@example.com' } });
        fireEvent.change(screen.getByLabelText('Firma / organizace'), { target: { value: 'Firma s.r.o.' } });
        fireEvent.change(screen.getByLabelText('Fakturační údaje'), {
            target: { value: 'Firma s.r.o., IČO 12345678' },
        });

        const submitButton = screen.getByRole('button', { name: 'Přidat na čekací listinu' });
        expect((submitButton as HTMLButtonElement).disabled).toBe(false);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(submitAiSupervizeMiniWorkshopRegistrationMock).toHaveBeenCalledWith(
                expect.objectContaining({ participantCount: 1 }),
            );
        });
        expect(screen.getByText('Jste na čekací listině')).toBeTruthy();
    });
});
