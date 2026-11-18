import { z } from 'zod';
import { licenseSnapshotSchema } from './contract';

/** Server-to-server V0 lookup. Never take this email from an unverified public form. */
export const licenseLookupRequestSchema = z.object({
    email: z.string().trim().toLowerCase().email().max(254),
}).strict();

export const licenseLookupResponseSchema = z.object({
    schemaVersion: z.literal(1),
    status: z.enum(['active', 'trial', 'scheduled', 'expired', 'none']),
    // Plain Czech text for display only, never an entitlement/plan identifier.
    display: z.object({ label: z.string().min(1).max(160).regex(/^[^<>\u0000-\u001f\u007f]+$/) }).strict(),
    manageUrl: z.literal('https://www.ptbk.io/cs/pricing/predplatne'),
    generatedAt: z.string().datetime(),
    refreshAfterSeconds: z.number().int().min(60).max(86400),
    enforcement: z.literal('advisory'),
    snapshot: licenseSnapshotSchema.nullable(),
}).strict().superRefine((value, context) => {
    const snapshot = value.snapshot;
    if (snapshot && (snapshot.generatedAt !== value.generatedAt || snapshot.manageUrl !== value.manageUrl ||
        snapshot.refreshAfterSeconds !== value.refreshAfterSeconds || snapshot.enforcement !== value.enforcement)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Inconsistent snapshot metadata' });
    }
    const current = value.status === 'active' || value.status === 'trial';
    if ((current && !snapshot?.grants.length) || (!current && snapshot && snapshot.grants.length > 0) ||
        (value.status !== 'none' && !snapshot)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Inconsistent license status' });
    }
});

export type LicenseLookupRequest = z.infer<typeof licenseLookupRequestSchema>;
export type LicenseLookupResponse = z.infer<typeof licenseLookupResponseSchema>;
