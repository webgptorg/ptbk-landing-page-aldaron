/**
 * @vitest-environment jsdom
 */

import { WorkshopFeedback } from '@/businesses/online-workshop/participant/WorkshopFeedback';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

describe('workshop wrap-up feedback', () => {
    it('previews every star up to the hovered rating', () => {
        const onSave = vi.fn().mockResolvedValue(true);
        render(<WorkshopFeedback feedback={null} onSave={onSave} />);

        const firstStar = screen.getByRole('button', { name: 'Ohodnotit workshop 1 z 5 hvězd' });
        const thirdStar = screen.getByRole('button', { name: 'Ohodnotit workshop 3 z 5 hvězd' });
        const fourthStar = screen.getByRole('button', { name: 'Ohodnotit workshop 4 z 5 hvězd' });

        fireEvent.mouseEnter(thirdStar);

        expect(firstStar.className).toContain('text-room-warning');
        expect(thirdStar.className).toContain('text-room-warning');
        expect(fourthStar.className).toContain('text-room-subtle');

        fireEvent.mouseLeave(screen.getByRole('group', { name: 'Hodnocení workshopu' }));

        expect(firstStar.className).toContain('text-room-subtle');
        expect(thirdStar.className).toContain('text-room-subtle');
    });

    it('asks for improvement first after a lower score and persists each answered step', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        render(<WorkshopFeedback feedback={null} onSave={onSave} />);

        fireEvent.click(screen.getByRole('button', { name: 'Ohodnotit workshop 2 z 5 hvězd' }));

        await waitFor(() => expect(onSave).toHaveBeenCalledWith({ rating: 2 }));
        expect(screen.getByRole('heading', { name: 'Co bychom mohli příště zlepšit?' })).not.toBeNull();

        fireEvent.change(screen.getByPlaceholderText(/Třeba něco, co chybělo/), {
            target: { value: 'Více času na dotazy.' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Pokračovat' }));

        await waitFor(() => expect(onSave).toHaveBeenLastCalledWith({ whatWasBad: 'Více času na dotazy.' }));
        expect(screen.getByRole('heading', { name: 'Co pro vás bylo na workshopu přínosné?' })).not.toBeNull();
    });

    it('asks for the benefit first after a higher score', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        render(<WorkshopFeedback feedback={null} onSave={onSave} />);

        fireEvent.click(screen.getByRole('button', { name: 'Ohodnotit workshop 5 z 5 hvězd' }));

        await waitFor(() => expect(onSave).toHaveBeenCalledWith({ rating: 5 }));
        expect(screen.getByRole('heading', { name: 'Co pro vás bylo na workshopu přínosné?' })).not.toBeNull();
    });

    it('does not advance to optional questions when saving the score failed', async () => {
        const onSave = vi.fn().mockResolvedValue(false);
        render(<WorkshopFeedback feedback={null} onSave={onSave} />);

        fireEvent.click(screen.getByRole('button', { name: 'Ohodnotit workshop 4 z 5 hvězd' }));

        await waitFor(() => expect(onSave).toHaveBeenCalledWith({ rating: 4 }));
        expect(screen.queryByText('Děkujeme za zpětnou vazbu.')).toBeNull();
        expect(screen.queryByRole('heading', { name: 'Co pro vás bylo na workshopu přínosné?' })).toBeNull();
        expect(screen.getByRole('heading', { name: 'Jak byste workshop ohodnotili?' })).not.toBeNull();
    });
});
