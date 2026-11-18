import { describe, expect, it } from 'vitest';
import fixtures from '@/docs/fixtures/app-license-email-lookup.json';
import { licenseSnapshotSchema } from './contract';
import { licenseLookupRequestSchema, licenseLookupResponseSchema } from './lookupContract';

describe('copyable V0 integration fixtures', () => {
    it.each(fixtures.filter((fixture) => fixture.httpStatus === 200))('validates the documented $name response', (fixture) => {
        expect(licenseLookupRequestSchema.parse(fixture.request).email).toBe('customer@example.test');
        const parsed = licenseLookupResponseSchema.parse(fixture.response);
        if (parsed.snapshot) expect(licenseSnapshotSchema.parse(parsed.snapshot)).toEqual(parsed.snapshot);
        expect(parsed.manageUrl).toBe('https://www.ptbk.io/cs/pricing/predplatne');
    });
    it.each(fixtures.filter((fixture) => fixture.httpStatus !== 200))('never parses $name as a license absence', (fixture) => {
        expect(licenseLookupResponseSchema.safeParse(fixture.response).success).toBe(false);
    });
    it('keeps presentation out of strict v1 and rejects unsafe links, HTML and mismatched metadata', () => {
        const active = fixtures[0]!.response;
        expect(licenseSnapshotSchema.safeParse(active).success).toBe(false);
        expect(licenseLookupResponseSchema.safeParse({ ...active, manageUrl: 'https://external.example.test' }).success).toBe(false);
        expect(licenseLookupResponseSchema.safeParse({ ...active, display: { label: '<script>unsafe</script>' } }).success).toBe(false);
        expect(licenseLookupResponseSchema.safeParse({ ...active, generatedAt: '2026-11-18T21:00:00Z' }).success).toBe(false);
        expect(licenseLookupResponseSchema.safeParse({ ...active, status: 'none' }).success).toBe(false);
        expect(licenseLookupResponseSchema.safeParse({ ...active, snapshot: null }).success).toBe(false);
    });
});
