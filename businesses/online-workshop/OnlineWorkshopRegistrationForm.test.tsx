/**
 * @vitest-environment jsdom
 */

import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ImgHTMLAttributes } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
    default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

import { OnlineWorkshopRegistrationForm } from './OnlineWorkshopRegistrationForm';

/**
 * Moment the page is read at, which is far enough from both terms for neither of them to be named rather than dated
 */
const CURRENT_TIME = '2026-08-20T09:00:00+02:00';

const FIRST_WORKSHOP: EventOccurrence = {
    id: 'first-workshop-id',
    kind: 'workshop',
    slug: 'production-ai-2026-09-04',
    title: 'Produkční kód s AI agenty',
    description: 'Celé workflow od issue po merge na reálném repu.',
    startsAt: '2026-09-04T16:00:00+02:00',
    endsAt: '2026-09-04T17:00:00+02:00',
    isPublished: true,
    event: DEFAULT_EVENT_DETAILS,
};

const SECOND_WORKSHOP: EventOccurrence = {
    id: 'second-workshop-id',
    kind: 'workshop',
    slug: 'git-a-ai-2026-09-09',
    title: 'Git a AI',
    description: 'Jak držet změny malé a dohledatelné, i když je píše agent.',
    startsAt: '2026-09-09T13:00:00+02:00',
    endsAt: '2026-09-09T14:00:00+02:00',
    isPublished: true,
    event: DEFAULT_EVENT_DETAILS,
};

describe('Online workshop registration form', () => {
    afterEach(() => {
        cleanup();
    });

    it('uses one form to choose between terms without clearing contact details', () => {
        const { container } = render(
            <OnlineWorkshopRegistrationForm workshops={[FIRST_WORKSHOP, SECOND_WORKSHOP]} currentTime={CURRENT_TIME} />,
        );

        expect(container.querySelectorAll('form')).toHaveLength(1);

        const firstWorkshopButton = screen.getByRole('button', { name: /4\. 9\. 2026/ });
        const secondWorkshopButton = screen.getByRole('button', { name: /9\. 9\. 2026/ });
        expect(firstWorkshopButton.getAttribute('aria-pressed')).toBe('true');
        expect(secondWorkshopButton.getAttribute('aria-pressed')).toBe('false');

        fireEvent.change(screen.getByLabelText('Jméno'), { target: { value: 'Jana Nováková' } });
        fireEvent.click(secondWorkshopButton);

        expect(firstWorkshopButton.getAttribute('aria-pressed')).toBe('false');
        expect(secondWorkshopButton.getAttribute('aria-pressed')).toBe('true');
        expect(container.querySelector('[aria-live="polite"]')?.textContent).toContain(SECOND_WORKSHOP.title);
        expect((screen.getByLabelText('Jméno') as HTMLInputElement).value).toBe('Jana Nováková');
    });

    it('says on every term what that very workshop is called and what it is about', () => {
        render(
            <OnlineWorkshopRegistrationForm workshops={[FIRST_WORKSHOP, SECOND_WORKSHOP]} currentTime={CURRENT_TIME} />,
        );

        const firstWorkshopButton = screen.getByRole('button', { name: /4\. 9\. 2026/ });
        expect(firstWorkshopButton.textContent).toContain(FIRST_WORKSHOP.title);
        expect(firstWorkshopButton.textContent).toContain(FIRST_WORKSHOP.description);

        const secondWorkshopButton = screen.getByRole('button', { name: /9\. 9\. 2026/ });
        expect(secondWorkshopButton.textContent).toContain(SECOND_WORKSHOP.title);
        expect(secondWorkshopButton.textContent).toContain(SECOND_WORKSHOP.description);
    });

    it('offers no registration form until an online workshop is published', () => {
        const { container } = render(<OnlineWorkshopRegistrationForm workshops={[]} currentTime={CURRENT_TIME} />);

        expect(container.querySelector('form')).toBeNull();
        expect(screen.getByText(/Zatím není vypsaný další termín\./)).toBeTruthy();
    });
});
