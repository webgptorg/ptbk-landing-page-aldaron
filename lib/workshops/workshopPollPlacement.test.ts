import { getWorkshopPollPlacement } from '@/lib/workshops/workshopPollPlacement';
import { WORKSHOP_KIND_VALUES } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

describe('workshop poll placement', () => {
    it('opens the room which owns its polls with them, because that is where its decisions are made', () => {
        expect(getWorkshopPollPlacement('community')).toBe('before-materials');
    });

    it('closes a workshop occurrence with the polls it is only the subject of', () => {
        expect(getWorkshopPollPlacement('workshop')).toBe('after-materials');
    });

    it('places the polls of every room kind, so a kind added later cannot be left without an answer', () => {
        WORKSHOP_KIND_VALUES.forEach((workshopKind) => {
            expect(['before-materials', 'after-materials']).toContain(getWorkshopPollPlacement(workshopKind));
        });
    });
});
