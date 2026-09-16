/**
 * @vitest-environment jsdom
 */

import { DurationPicker } from '@/components/admin/DurationPicker';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const MAXIMAL_DURATION_IN_SECONDS = 2_147_483_647;

function renderDurationPicker(durationInSeconds: number, maximalDurationInSeconds = MAXIMAL_DURATION_IN_SECONDS) {
    const onChange = vi.fn();

    render(
        <DurationPicker
            id="duration"
            durationInSeconds={durationInSeconds}
            onChange={onChange}
            maximalDurationInSeconds={maximalDurationInSeconds}
        />,
    );

    return {
        onChange,
        part: (partLabel: string) => screen.getByRole('spinbutton', { name: partLabel }) as HTMLInputElement,
    };
}

afterEach(cleanup);

describe('duration picker', () => {
    it('shows the seconds it was given as hours, minutes and seconds', () => {
        const { part } = renderDurationPicker(5_425);

        expect(part('Hodiny').value).toBe('1');
        expect(part('Minuty').value).toBe('30');
        expect(part('Sekundy').value).toBe('25');
    });

    it('says the whole length of time back in seconds when one of its parts changes', () => {
        const { onChange, part } = renderDurationPicker(75);

        fireEvent.change(part('Hodiny'), { target: { value: '2' } });

        expect(onChange).toHaveBeenCalledWith(7_275);
    });

    it('keeps a part inside the clock it belongs to', () => {
        const { onChange, part } = renderDurationPicker(0);

        fireEvent.change(part('Minuty'), { target: { value: '90' } });

        expect(onChange).toHaveBeenCalledWith(59 * 60);
    });

    it('writes no length of time shorter than none and none longer than it may be', () => {
        const { onChange, part } = renderDurationPicker(30, 90);

        fireEvent.change(part('Sekundy'), { target: { value: '-5' } });
        expect(onChange).toHaveBeenCalledWith(0);

        fireEvent.change(part('Minuty'), { target: { value: '59' } });
        expect(onChange).toHaveBeenLastCalledWith(90);
    });
});
