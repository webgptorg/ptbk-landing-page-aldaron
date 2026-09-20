/**
 * @vitest-environment jsdom
 */

import { WorkshopArtificialComment } from '@/businesses/workshop-admin/WorkshopArtificialComment';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

describe('artificial workshop comments', () => {
    it('can create arbitrary text and select it for the stage in the same action', async () => {
        const onCreate = vi.fn().mockResolvedValue(true);
        render(<WorkshopArtificialComment onCreate={onCreate} isStageOffered />);

        fireEvent.click(screen.getByRole('button', { name: 'Přidat umělý komentář' }));

        fireEvent.change(screen.getByLabelText('Zobrazené jméno autora'), {
            target: { value: 'Moderátor' },
        });
        fireEvent.change(screen.getByLabelText('Text komentáře'), {
            target: { value: 'Máte otázku k nasazení?' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Přidat a poslat na stage' }));

        await waitFor(() =>
            expect(onCreate).toHaveBeenCalledWith(
                { authorName: 'Moderátor', body: 'Máte otázku k nasazení?' },
                true,
            ),
        );
    });

    it('does not offer a stage action in a room without a stage', () => {
        render(<WorkshopArtificialComment onCreate={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Přidat umělý komentář' }));

        expect(screen.queryByRole('button', { name: 'Přidat a poslat na stage' })).toBeNull();
    });
});
