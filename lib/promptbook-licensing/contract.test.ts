import { describe, expect, it } from 'vitest';
import { capabilitiesForPlan, isGrantCurrent, licenseSnapshotSchema } from './contract';
describe('numeric advisory license contract', () => {
    it('keeps plan names, price, community seats and engine assignment outside App snapshots', () => {
        const snapshot = {
            version: 1,
            subject: '4408b4d6-6005-4b77-97eb-fdd67847ee92',
            generatedAt: '2026-11-13T00:00:00.000Z',
            refreshAfterSeconds: 900,
            enforcement: 'advisory',
            manageUrl: 'https://www.ptbk.io/cs/pricing/predplatne',
            grants: [
                {
                    id: '4408b4d6-6005-4b77-97eb-fdd67847ee93',
                    validFrom: '2026-11-13T00:00:00.000Z',
                    validUntil: null,
                    capabilities: capabilitiesForPlan('business'),
                },
            ],
        };
        expect(licenseSnapshotSchema.parse(snapshot).grants[0].capabilities.harnessInstances).toBeNull();
        expect(licenseSnapshotSchema.safeParse({ ...snapshot, enforcement: 'blocking' }).success).toBe(false);
        expect(licenseSnapshotSchema.safeParse({ ...snapshot, communitySeats: 10 }).success).toBe(false);
    });
    it('ends contractual grants precisely, independently of software operation', () => {
        const grant = { validFrom: '2026-11-13T00:00:00.000Z', validUntil: '2026-11-27T00:00:00.000Z' };
        expect(isGrantCurrent(grant, Date.parse(grant.validFrom) - 1)).toBe(false);
        expect(isGrantCurrent(grant, Date.parse(grant.validUntil) - 1)).toBe(true);
        expect(isGrantCurrent(grant, Date.parse(grant.validUntil))).toBe(false);
    });
});
