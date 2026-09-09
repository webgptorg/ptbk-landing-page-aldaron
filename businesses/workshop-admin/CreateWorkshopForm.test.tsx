/**
 * @vitest-environment jsdom
 */

import { CreateWorkshopForm } from '@/businesses/workshop-admin/CreateWorkshopForm';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const WORKSHOP: WorkshopDetails = {
    id: 'a1000000-0000-4000-8000-000000000001',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'production-ai-workshop-2026-09',
    title: 'Produkční kód s AI agenty',
    description: 'Celodenní workshop pro vývojáře.',
    startsAt: '2026-09-12T08:00:00.000Z',
    endsAt: '2026-09-12T15:00:00.000Z',
    youtubeVideoId: 'dQw4w9WgXcQ',
    previewYoutubeVideoId: 'M7lc1UVf-VE',
    repository: null,
    isPublished: true,
    allowedReactions: ['👍', '❤️'],
    disabledPanels: ['reactions'],
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
};

afterEach(cleanup);

describe('create workshop form', () => {
    it('opens a selected workshop as an unpublished duplicate draft and creates it through the normal callback', async () => {
        const onCreate = vi.fn().mockResolvedValue(true);
        const { container } = render(<CreateWorkshopForm onCreate={onCreate} workshopToDuplicate={WORKSHOP} />);

        fireEvent.click(screen.getByRole('button', { name: 'Duplikovat workshop' }));

        expect(screen.getByText('Kopie workshopu')).not.toBeNull();
        expect(screen.getByDisplayValue(WORKSHOP.title)).not.toBeNull();
        expect(screen.getByDisplayValue('production-ai-workshop-2026-09-copy')).not.toBeNull();

        fireEvent.submit(container.querySelector('form') as HTMLFormElement);

        await waitFor(() =>
            expect(onCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    slug: 'production-ai-workshop-2026-09-copy',
                    title: WORKSHOP.title,
                    description: WORKSHOP.description,
                    youtubeVideoId: WORKSHOP.youtubeVideoId,
                    previewYoutubeVideoId: WORKSHOP.previewYoutubeVideoId,
                    isPublished: false,
                    allowedReactions: WORKSHOP.allowedReactions,
                    disabledPanels: WORKSHOP.disabledPanels,
                }),
            ),
        );
        await waitFor(() => expect(screen.queryByText('Kopie workshopu')).toBeNull());
    });

    it('resets a dismissed duplicate back to a blank new workshop', () => {
        render(<CreateWorkshopForm onCreate={vi.fn().mockResolvedValue(true)} workshopToDuplicate={WORKSHOP} />);

        fireEvent.click(screen.getByRole('button', { name: 'Duplikovat workshop' }));
        fireEvent.click(screen.getByRole('button', { name: 'Zavřít' }));
        fireEvent.click(screen.getByRole('button', { name: 'Nový workshop' }));

        expect((screen.getByPlaceholderText('Název') as HTMLInputElement).value).toBe('');
        expect((screen.getByPlaceholderText('slug-workshopu') as HTMLInputElement).value).toBe('');
        expect(screen.queryByDisplayValue(WORKSHOP.title)).toBeNull();
        expect(screen.queryByDisplayValue('production-ai-workshop-2026-09-copy')).toBeNull();
    });
});
