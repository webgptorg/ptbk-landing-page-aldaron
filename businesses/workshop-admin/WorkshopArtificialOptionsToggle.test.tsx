/**
 * @vitest-environment jsdom
 */

import { WorkshopArtificialOptionsToggle } from '@/businesses/workshop-admin/WorkshopArtificialOptionsToggle';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

describe('WorkshopArtificialOptionsToggle', () => {
    it('keeps the artificial-controls switch one quiet click behind display settings', () => {
        const onChangeArtificialOptionsShown = vi.fn();
        render(
            <WorkshopArtificialOptionsToggle
                isArtificialOptionsShown={false}
                onChangeArtificialOptionsShown={onChangeArtificialOptionsShown}
            />,
        );

        expect(screen.queryByText('Umělé možnosti')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Nastavení zobrazení' }));
        fireEvent.click(screen.getByRole('switch', { name: 'Zobrazit umělé možnosti' }));

        expect(onChangeArtificialOptionsShown).toHaveBeenCalledWith(true);
    });
});
