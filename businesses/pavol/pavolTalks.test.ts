import { describe, it, expect } from 'vitest';
import { getPavolTalks } from './pavolTalks';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';

const workshop: WorkshopSummary = { id: '1', kind: 'workshop', slug: 'own-event', title: 'Own workshop', description: 'Public description',
    startsAt: '2026-11-10T10:00:00Z', endsAt: null, isPublished: true, event: DEFAULT_EVENT_DETAILS };

describe('personal calendar projection', () => {
    it('imports public workshops taught by Pavol while excluding other lecturers and unpublished rooms', () => {
        const result = getPavolTalks([workshop, { ...workshop, slug: 'private', isPublished: false },
            { ...workshop, slug: 'someone-else', event: { ...DEFAULT_EVENT_DETAILS, type: 'external', externalUrl: 'https://example.com/event' } }], 'cs');
        expect(result.some(event => event.id === 'own-event')).toBe(true);
        expect(result.some(event => ['private', 'someone-else'].includes(event.id))).toBe(false);
        expect(result.find(event => event.id === 'own-event')?.description).toBe('Public description');
    });
});
