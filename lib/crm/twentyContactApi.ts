import { createHash } from 'node:crypto';
import type { TwentyContactSource } from './twentyContactSource';

type TwentyRecord = { id: string };
type Person = TwentyRecord & {
    emails?: { primaryEmail?: string | null; additionalEmails?: string[] | null };
};
type SourceRecord = TwentyRecord & Partial<Pick<
    TwentyContactSource, 'externalId' | 'name' | 'sourceType' | 'sourceName' | 'sourceUrl' | 'occurredAt'
>> & {
    personId?: string | null;
    details?: string | null;
};
type TwentyList<RecordType> = {
    data: Record<string, RecordType[]>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
};
type TwentyResult<RecordType> = { data: Record<string, RecordType> };

export class TwentyContactDeliveryError extends Error {
    constructor(readonly code: string, readonly status?: number) {
        super(code);
    }
}

export type TwentyContactApiSettings = { url: URL; key: string; ingressKey?: string; signal?: AbortSignal; timeoutMs?: number };

/** Twenty accepts a caller-supplied UUID. The same identifier survives a lost create response. */
export function getTwentyContactRecordId(namespace: 'person' | 'source' | 'purchase' | 'payment' | 'company', key: string): string {
    const uuidNamespace = Buffer.from('de15a140b9b84edd8ee3be1db4f6263d', 'hex');
    const bytes = createHash('sha1').update(uuidNamespace).update(`${namespace}:${key}`).digest().subarray(0, 16);
    bytes[6] = (bytes[6] & 0x0f) | 0x50;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = bytes.toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function getTwentyPersonName(fullname: string): { firstName: string; lastName: string } {
    const [firstName, ...rest] = fullname.split(/\s+/);
    return { firstName, lastName: rest.join(' ') };
}

function normalizeEmail(value?: string | null): string | undefined {
    return value?.trim().toLowerCase();
}

export function createTwentyContactApi({ url, key, ingressKey, signal, timeoutMs = 4000 }: TwentyContactApiSettings) {
    async function request<Result>(path: string, method: 'GET' | 'POST' | 'PATCH', body?: object): Promise<Result> {
        const timeout = AbortSignal.timeout(timeoutMs);
        let response: Response;
        try {
            response = await fetch(new URL(`/rest/${path}`, url), {
                method,
                body: body === undefined ? undefined : JSON.stringify(body),
                headers: {
                    Authorization: `Bearer ${key}`,
                    'Content-Type': 'application/json',
                    ...(ingressKey ? { 'X-PTBK-Twenty-Sync': ingressKey } : {}),
                },
                signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
                cache: 'no-store',
                redirect: 'error',
            });
        } catch {
            throw new TwentyContactDeliveryError('twenty_unreachable');
        }
        if (!response.ok) throw new TwentyContactDeliveryError(`twenty_http_${response.status}`, response.status);

        try {
            return (await response.json()) as Result;
        } catch {
            throw new TwentyContactDeliveryError('twenty_invalid_response');
        }
    }

    async function getRecord<RecordType extends TwentyRecord>(plural: string, singular: string, id: string) {
        try {
            const response = await request<TwentyResult<RecordType>>(`${plural}/${id}`, 'GET');
            const record = response.data?.[singular];
            if (!record?.id) throw new TwentyContactDeliveryError('twenty_invalid_record');
            return record;
        } catch (error) {
            if (error instanceof TwentyContactDeliveryError && error.status === 404) return null;
            throw error;
        }
    }

    async function listRecords<RecordType extends TwentyRecord>(plural: string, filter?: string, fields?: string) {
        const records: RecordType[] = [];
        const params = new URLSearchParams({ limit: '100' });
        if (filter) params.set('filter', filter);
        if (fields) params.set('fields', fields);
        for (;;) {
            const response = await request<TwentyList<RecordType>>(`${plural}?${params}`, 'GET');
            const page = response.data?.[plural];
            if (!Array.isArray(page) || !response.pageInfo) {
                throw new TwentyContactDeliveryError('twenty_invalid_list');
            }
            records.push(...page);
            if (!response.pageInfo.hasNextPage) return records;

            const cursor = response.pageInfo.endCursor;
            if (!cursor || params.get('starting_after') === cursor) {
                throw new TwentyContactDeliveryError('twenty_invalid_cursor');
            }
            params.set('starting_after', cursor);
        }
    }

    async function createRecord<RecordType extends TwentyRecord>(
        plural: string,
        singular: string,
        responseKey: string,
        id: string,
        fields: object,
    ): Promise<RecordType> {
        try {
            const response = await request<TwentyResult<RecordType>>(plural, 'POST', { id, ...fields });
            const created = response.data?.[responseKey];
            if (created?.id === id) return created;
            throw new TwentyContactDeliveryError('twenty_invalid_create');
        } catch (error) {
            // The database may have committed before the request errored. Confirm via its deterministic id.
            if (error instanceof TwentyContactDeliveryError && [401, 403, 404, 429].includes(error.status ?? 0)) {
                throw error;
            }
            const saved = await getRecord<RecordType>(plural, singular, id).catch(() => null);
            if (saved) return saved;
            throw error;
        }
    }

    async function findPeopleByEmail(email: string): Promise<readonly Person[]> {
        // The REST filter grammar uses quotes, commas and parentheses for grouping.
        // Fall back to a paged scan for valid addresses that contain these delimiters.
        const pattern = email.replace(/[\\%_]/g, '\\$&');
        const filter = /[[\]\\'"(),]/.test(email)
            ? undefined
            : `or(emails.primaryEmail[ilike]:"${pattern}",emails.additionalEmails[ilike]:"%${pattern}%")`;
        const people = await listRecords<Person>('people', filter, 'id,emails');
        return people.filter(({ emails }) =>
            normalizeEmail(emails?.primaryEmail) === email || emails?.additionalEmails?.some(
                (candidate) => normalizeEmail(candidate) === email,
            ),
        );
    }

    async function findOrCreatePerson(source: TwentyContactSource, email: string): Promise<Person | null> {
        const matches = await findPeopleByEmail(email);
        if (matches.length > 1) return null;
        if (matches.length === 1) return matches[0];

        const phone = source.phone?.trim().replace(/[\s().-]/g, '');
        const person = await createRecord<Person>('people', 'person', 'createPerson', getTwentyContactRecordId('person', email), {
            name: getTwentyPersonName(source.fullname),
            emails: { primaryEmail: email },
            ...(/^\+\d{7,15}$/.test(phone ?? '') ? { phones: { primaryPhoneNumber: phone } } : {}),
        });
        if (normalizeEmail(person.emails?.primaryEmail) !== email) {
            throw new TwentyContactDeliveryError('review_person_identity_changed');
        }
        return person;
    }

    async function deliverSource(source: TwentyContactSource): Promise<'linked' | 'unlinked'> {
        const { externalId, name, sourceType, sourceName, sourceUrl, occurredAt, details } = source;
        const candidates = await listRecords<SourceRecord>('contactSources', `externalId[eq]:${JSON.stringify(externalId)}`);
        const existingSources = candidates.filter((record) => record.externalId === externalId);
        if (existingSources.length > 1) throw new TwentyContactDeliveryError('review_duplicate_source');
        const existing = existingSources[0];
        // Keep any Person relation already chosen in Twenty. The integration owns the provenance fields only.
        let personId = existing?.personId ?? null;
        if (personId === null && source.email !== null) {
            personId = (await findOrCreatePerson(source, source.email))?.id ?? null;
        }
        const fields = {
            externalId, name, sourceType, sourceName, sourceUrl, occurredAt,
            details: JSON.stringify(
                personId === null && source.email !== null ? { ...details, identityReview: 'ambiguous_email' } : details,
                null,
                2,
            ),
        };

        if (existing) {
            const hasSameProvenance = existing.name === name && existing.sourceType === sourceType
                && existing.sourceName === sourceName && (existing.sourceUrl || null) === sourceUrl
                && Date.parse(existing.occurredAt ?? '') === Date.parse(occurredAt) && existing.details === fields.details;
            if (!hasSameProvenance || (existing.personId == null && personId !== null)) {
                const updated = await request<TwentyResult<SourceRecord>>(`contactSources/${existing.id}`, 'PATCH', {
                    ...fields,
                    ...(existing.personId == null && personId !== null ? { personId } : {}),
                });
                if (updated.data?.updateContactSource?.id !== existing.id) {
                    throw new TwentyContactDeliveryError('twenty_invalid_update');
                }
            }
            return personId === null ? 'unlinked' : 'linked';
        }

        const saved = await createRecord<SourceRecord>(
            'contactSources', 'contactSource', 'createContactSource', getTwentyContactRecordId('source', externalId),
            { ...fields, ...(personId === null ? {} : { personId }) },
        );
        if (saved.externalId !== externalId || (saved.personId ?? null) !== personId) {
            throw new TwentyContactDeliveryError('review_source_identity_changed');
        }
        return personId === null ? 'unlinked' : 'linked';
    }

    async function verifyConnectivity() {
        for (const plural of ['people', 'contactSources']) {
            const response = await request<TwentyList<TwentyRecord>>(`${plural}?limit=1&fields=id`, 'GET');
            if (!Array.isArray(response.data?.[plural])) {
                throw new TwentyContactDeliveryError('twenty_invalid_list');
            }
        }
    }

    return { deliverSource, verifyConnectivity, request, listRecords, getRecord, createRecord, findPeopleByEmail, findOrCreatePerson };
}
