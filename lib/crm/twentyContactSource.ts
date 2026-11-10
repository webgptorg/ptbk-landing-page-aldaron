import { COMMUNITY_MEMBERSHIP_REGISTRATION_PLACE_NAME } from '@/businesses/community/membership/communityMembershipConfig';
import { E2E_TEST_EMAIL_DOMAIN } from '@/lib/e2e/testData';
import { EVENT_REGISTRATION_PLACE_NAMES } from '@/lib/events/eventTypes';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { readWorkshopRegistration, readWorkshopRegistrationNotePayload } from '@/lib/workshops/workshopRegistrations';
import type { TwentyContactSyncRow } from './twentyContactSyncDatabase';

const SHARED_EMAIL_LOCAL_PARTS = new Set([
    'admin', 'billing', 'contact', 'hello', 'info', 'kontakt', 'office', 'podpora', 'sales', 'support',
]);
const CAMPAIGN_PARAMETERS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_id'] as const;
const SAFE_CAMPAIGN_VALUE = /^[A-Za-z0-9\u00C0-\u024F _.-]{1,120}$/;

export type TwentyContactSource = {
    externalId: string;
    email: string | null;
    fullname: string;
    phone: string | null;
    name: string;
    sourceType: string;
    sourceName: string;
    sourceUrl: string | null;
    occurredAt: string;
    details: Record<string, unknown>;
};

export type TwentyContactSourceResult = TwentyContactSource | 'test_contact';

function parseWebUrl(rawUrl: unknown): URL | null {
    if (typeof rawUrl !== 'string') return null;

    try {
        const url = new URL(rawUrl);
        if (!['http:', 'https:'].includes(url.protocol)) return null;
        return url;
    } catch {
        return null;
    }
}

function cleanSourceUrl(url: URL | null): string | null {
    return url === null ? null : `${url.origin}${url.pathname}`;
}

function readCampaignParameters(url: URL | null): Record<string, string> | undefined {
    const campaign: Record<string, string> = {};
    for (const name of CAMPAIGN_PARAMETERS) {
        const value = url?.searchParams.get(name)?.trim();
        if (value && SAFE_CAMPAIGN_VALUE.test(value)) campaign[name] = value;
    }
    return Object.keys(campaign).length === 0 ? undefined : campaign;
}

function mapContactDetails(row: TwentyContactSyncRow, sourceName: string): Record<string, unknown> {
    const { referrer, userNote, ...details } = row.details;
    const referrerUrl = cleanSourceUrl(parseWebUrl(referrer));
    if (referrerUrl !== null) details.referrer = referrerUrl;
    if (typeof userNote !== 'string') return details;

    if (sourceName === COMMUNITY_MEMBERSHIP_REGISTRATION_PLACE_NAME) {
        const registration = readWorkshopRegistrationNotePayload(userNote);
        details.planId = registration?.planId;
        details.billingPeriod = registration?.billingPeriod;
    } else if (EVENT_REGISTRATION_PLACE_NAMES.includes(sourceName)) {
        // Workshop registration JSON also carries billing data and discount codes. Project only CRM context.
        const registration = readWorkshopRegistrationNotePayload(userNote);
        details.registration = readWorkshopRegistration(userNote);
        details.company = registration?.company;
        details.message = registration?.userNote;
    } else {
        details.message = userNote;
    }
    return details;
}

function getSourceType(row: TwentyContactSyncRow, sourceName: string): string {
    if (row.kind === 'promptbook-order') return 'promptbook-subscription';
    if (row.kind === 'membership') return 'community-membership';
    if (row.kind === 'attendance' || row.kind === 'feedback') {
        const room = row.details.roomKind === 'community' || row.details.roomKind === 'project'
            ? row.details.roomKind
            : 'workshop';
        return `${room}-${row.kind}`;
    }
    if (sourceName === COMMUNITY_MEMBERSHIP_REGISTRATION_PLACE_NAME) return 'community-registration';
    if (EVENT_REGISTRATION_PLACE_NAMES.includes(sourceName)) return 'workshop-registration';
    return 'website';
}

export function mapTwentyContactSource(row: TwentyContactSyncRow): TwentyContactSourceResult {
    const submittedEmail = row.email?.trim();
    const email = submittedEmail?.toLowerCase() ?? '';
    const [localPart, domain = ''] = email.split('@');
    if ([E2E_TEST_EMAIL_DOMAIN, 'example.net', 'example.org'].includes(domain) || domain.endsWith('.test')) {
        return 'test_contact';
    }

    const sourceName = row.source_name?.trim() || (row.kind === 'contact' ? 'Unspecified form' : row.kind);
    const sourceType = getSourceType(row, sourceName);
    const name = row.kind === 'promptbook-order'
        ? row.details.planId === 'business' ? 'Promptbook Business' : 'Promptbook Start'
        : sourceName;
    const identityReview = !isEmailAddressValid(email) ? 'missing_or_invalid_email'
        : SHARED_EMAIL_LOCAL_PARTS.has(localPart.split('+')[0]) ? 'shared_email' : undefined;
    const details = row.kind === 'contact' ? mapContactDetails(row, sourceName) : row.details;
    const sourceUrl = parseWebUrl(row.source_url);
    return {
        externalId: row.external_id,
        email: identityReview ? null : email,
        fullname: row.fullname?.trim() ?? '',
        phone: row.phone,
        name,
        sourceType,
        sourceName,
        sourceUrl: cleanSourceUrl(sourceUrl),
        occurredAt: row.occurred_at.toISOString(),
        details: {
            ...details,
            campaign: readCampaignParameters(sourceUrl),
            submittedName: row.fullname || undefined,
            submittedEmail: submittedEmail || undefined,
            submittedPhone: row.phone || undefined,
            identityReview,
        },
    };
}
