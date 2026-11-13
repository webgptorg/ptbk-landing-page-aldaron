import { z } from 'zod';

/** Numeric capacity, independent of names, prices and promotions. Null means unlimited. */
const capacity = z.number().int().nonnegative().max(1_000_000).nullable();
export const licenseCapabilitiesSchema = z
    .object({
        engineProjects: capacity,
        specialists: capacity,
        controllingUsers: capacity,
        harnessInstances: capacity,
        browserProfiles: capacity,
        remoteControl: z.boolean(),
    })
    .strict();
export type LicenseCapabilities = z.infer<typeof licenseCapabilitiesSchema>;
export const licenseGrantSchema = z
    .object({
        id: z.string().uuid(),
        validFrom: z.string().datetime(),
        validUntil: z.string().datetime().nullable(),
        capabilities: licenseCapabilitiesSchema,
    })
    .strict();
export const licenseSnapshotSchema = z
    .object({
        version: z.literal(1),
        subject: z.string().uuid(),
        generatedAt: z.string().datetime(),
        refreshAfterSeconds: z.number().int().min(60).max(86400),
        enforcement: z.literal('advisory'),
        manageUrl: z.literal('https://www.ptbk.io/cs/pricing/predplatne'),
        grants: z.array(licenseGrantSchema).max(1000),
    })
    .strict();
export type LicenseGrant = z.infer<typeof licenseGrantSchema>;
export type LicenseSnapshot = z.infer<typeof licenseSnapshotSchema>;
/** The commercial mapping belongs only to the website; the App never needs it. */
export function capabilitiesForPlan(plan: 'start' | 'business'): LicenseCapabilities {
    return {
        engineProjects: 1,
        specialists: plan === 'business' ? 10 : 3,
        controllingUsers: plan === 'business' ? 5 : 1,
        harnessInstances: plan === 'business' ? null : 1,
        browserProfiles: plan === 'business' ? 5 : 1,
        remoteControl: true,
    };
}
/** Paid-through access survives cancellation; status alone is not proof of a paid period. */
export function isGrantCurrent(grant: Pick<LicenseGrant, 'validFrom' | 'validUntil'>, now: number): boolean {
    return Date.parse(grant.validFrom) <= now && (grant.validUntil === null || Date.parse(grant.validUntil) > now);
}
