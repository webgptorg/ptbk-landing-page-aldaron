import { describe, expect, it, vi } from 'vitest';
import { getPromptbookOrderConfirmedAt } from './billingEvents';

vi.mock('server-only', () => ({}));

describe('original order confirmation time', () => {
    it('uses confirmed zero-invoice time too and converges when an initial invoice arrives after a renewal', () => {
        const first = '2026-11-11T09:00:00.000Z';
        const renewal = '2026-12-11T09:00:00.000Z';
        expect(getPromptbookOrderConfirmedAt(null, first)).toBe(first);
        expect(getPromptbookOrderConfirmedAt(renewal, first)).toBe(first);
        expect(getPromptbookOrderConfirmedAt(first, renewal)).toBe(first);
        expect(getPromptbookOrderConfirmedAt(first, null)).toBe(first);
        expect(getPromptbookOrderConfirmedAt(null, null)).toBeNull();
    });
});
