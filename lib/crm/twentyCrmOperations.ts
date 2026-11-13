import { createHash, randomUUID } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { createTwentyContactApi, getTwentyContactRecordId, type TwentyContactApiSettings } from './twentyContactApi';
import { getObjectStorage, putStoredObject } from '@/lib/storage/objectStorage';
import { getTwentySourceCategory, type TwentySourceGroups } from './twentySourceGrouping';
import { runDatabaseTransaction } from '@/lib/database/runDatabaseTransaction';

export const CRM_OPERATION_VERSION = '2026-11-13-v1';
const BACKUP_PREFIX = 'private/crm-operations/';
type CrmRecord = { id: string; [key: string]: unknown };
type Field = { id: string; name: string; label: string; type: string; options?: unknown; [key: string]: unknown };
type MetadataObject = { id: string; nameSingular: string; namePlural: string; labelPlural: string; fields: Field[] | { edges: { node: Field }[] }; [key: string]: unknown };
type Snapshot = { version: string; createdAt: string; metadata: MetadataObject[]; records: Record<string, CrmRecord[]>; unavailable: Record<string, number> };
type Backup = { key: string; sha256: string; createdAt: string; counts: Record<string, number>; verified: true };
const tables = ['people', 'companies', 'contactSources', 'opportunities', 'tasks', 'dashboards', 'ptbkPurchases', 'ptbkPayments'] as const;

function apiFor(settings: TwentyContactApiSettings) {
    return createTwentyContactApi({ ...settings, timeoutMs: 30000, minRequestIntervalMs: 1100 });
}
export function metadataFields(object: MetadataObject): Field[] {
    return Array.isArray(object.fields) ? object.fields : object.fields?.edges?.map(({ node }) => node) ?? [];
}
export async function readTwentyCrmMetadata(settings: TwentyContactApiSettings): Promise<MetadataObject[]> {
    const api = apiFor(settings);
    const objects: MetadataObject[] = [];
    const params = new URLSearchParams({ limit: '100' });
    for (;;) {
        const response = await api.request<{ data: MetadataObject[] | { objects: MetadataObject[] }; pageInfo?: { hasNextPage: boolean; endCursor: string | null } }>(`metadata/objects?${params}`, 'GET');
        const page = Array.isArray(response.data) ? response.data : response.data?.objects;
        if (!Array.isArray(page)) throw new Error('crm_invalid_metadata');
        objects.push(...page);
        if (!response.pageInfo?.hasNextPage) return objects;
        const cursor = response.pageInfo.endCursor;
        if (!cursor || params.get('starting_after') === cursor) throw new Error('crm_invalid_cursor');
        params.set('starting_after', cursor);
    }
}

async function snapshot(settings: TwentyContactApiSettings): Promise<Snapshot> {
    const api = apiFor(settings);
    const metadata = await readTwentyCrmMetadata(settings);
    const records: Snapshot['records'] = {};
    const unavailable: Snapshot['unavailable'] = {};
    // Read-only: a refused optional object never leads to an expanded integration permission.
    for (const table of tables) {
        try { records[table] = await api.listRecords<CrmRecord>(table); }
        catch (error) {
            const status = (error as { status?: number }).status;
            if (status !== 403 && status !== 404) throw error;
            unavailable[table] = status;
        }
    }
    return { version: CRM_OPERATION_VERSION, createdAt: new Date().toISOString(), metadata, records, unavailable };
}

function counts(value: Snapshot) {
    return Object.fromEntries(Object.entries(value.records).map(([table, records]) => [table, records.length]));
}
export async function inspectTwentyCrm(settings: TwentyContactApiSettings) {
    const data = await snapshot(settings);
    const sources = data.records.contactSources ?? [];
    const typeCounts: Record<string, number> = {};
    for (const source of sources) {
        const type = String(source.sourceType ?? '(empty)');
        typeCounts[type] = (typeCounts[type] ?? 0) + 1;
    }
    return {
        version: data.version, capturedAt: data.createdAt, counts: counts(data), unavailable: data.unavailable,
        objects: data.metadata.map((object) => ({ id: object.id, name: object.nameSingular, plural: object.namePlural,
            fields: metadataFields(object).map(({ id, name, label, type, options }) => ({ id, name, label, type, options })),
        })),
        sourceTypes: typeCounts,
        // Group definitions carry no person's identity. Never return raw submissions in inspection.
        groups: sources.filter((source) => String(source.sourceType ?? '').includes('group')
            || String(source.externalId ?? '').startsWith('google-contacts:')
            || ['Projekt ptbk coder', 'Reklamy Meta – Neonmedia', 'Webové formuláře', 'Workshopy Promptbooku', 'Komunita Promptbook – členství a akce', 'Gmail - pavol@ptbk.io'].includes(String(source.name)))
            .map(({ id, name, sourceType, externalId }) => ({ id, name, sourceType, externalId })),
        sourceDetailKeys: Object.fromEntries(Array.from(new Set(sources.map((source) => String(source.sourceType ?? '')))).map((type) => {
            const source = sources.find((candidate) => candidate.sourceType === type && typeof candidate.details === 'string');
            try {
                const details: unknown = JSON.parse(String(source?.details ?? '{}'));
                return [type, details && typeof details === 'object' ? Object.keys(details) : []];
            } catch { return [type, []]; }
        })),
    };
}

export async function inspectTwentyCrmSyncHealth(settings: TwentyContactApiSettings & { from: string }) {
    const api = apiFor(settings);
    await api.verifyConnectivity();
    const health = await runDatabaseTransaction('inspect CRM delivery health', async (transaction) => {
        const state = await transaction.query<{ processed: string; needs_review: string; retrying: string }>(
            `SELECT count(*) FILTER (WHERE last_error IS NULL)::text AS processed,
                    count(*) FILTER (WHERE last_error LIKE 'review_%')::text AS needs_review,
                    count(*) FILTER (WHERE next_attempt_at IS NOT NULL AND last_error NOT LIKE 'review_%')::text AS retrying
             FROM public.twenty_contact_sync`,
        );
        const latest = await transaction.query<{ external_id: string; occurred_at: string; last_error: string | null; has_state: boolean }>(
            `SELECT 'web:contact:' || c.id AS external_id, c."createdAt"::text AS occurred_at,
                    s.last_error, s.external_id IS NOT NULL AS has_state
             FROM public."Contact" c LEFT JOIN public.twenty_contact_sync s ON s.external_id = 'web:contact:' || c.id
             WHERE c."promptbookBillingOrderId" IS NULL AND c."createdAt" >= $1::timestamptz
             ORDER BY c."createdAt" DESC, c.id DESC LIMIT 1`, [settings.from],
        );
        return { state: state.rows[0], latest: latest.rows[0] ?? null };
    });
    const latestSources = health.latest ? await api.listRecords<CrmRecord>('contactSources', `externalId[eq]:${JSON.stringify(health.latest.external_id)}`, 'id,externalId') : [];
    return { connected: true, cutover: settings.from, groupingConfigured: Object.keys(settings.sourceGroups ?? {}),
        operationalFrom: settings.operationalFrom ?? null, ...health,
        latestWebContactExistsInCrm: health.latest ? latestSources.some((source) => source.externalId === health.latest?.external_id) : null };
}

export async function backupTwentyCrm(settings: TwentyContactApiSettings): Promise<Backup> {
    const value = await snapshot(settings);
    for (const table of ['people', 'companies', 'contactSources']) {
        if (!value.records[table]) throw new Error('crm_required_backup_permission');
    }
    const bytes = gzipSync(Buffer.from(JSON.stringify(value)));
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const key = `${BACKUP_PREFIX}${randomUUID()}.json.gz`;
    await putStoredObject(key, bytes, 'application/gzip');
    const loaded = await loadTwentyCrmBackup(key);
    if (createHash('sha256').update(loaded.bytes).digest('hex') !== sha256) throw new Error('crm_backup_verification_failed');
    return { key, sha256, createdAt: value.createdAt, counts: counts(value), verified: true };
}

export async function loadTwentyCrmBackup(key: string): Promise<{ bytes: Buffer; snapshot: Snapshot }> {
    if (!/^private\/crm-operations\/[a-f0-9-]{36}\.json\.gz$/.test(key)) throw new Error('crm_invalid_backup_key');
    const { data, error } = await getObjectStorage().download(key);
    if (error || !data) throw new Error('crm_backup_unavailable');
    const bytes = Buffer.from(await data.arrayBuffer());
    const value = JSON.parse(gunzipSync(bytes).toString('utf8')) as Snapshot;
    if (value.version !== CRM_OPERATION_VERSION || !Number.isFinite(Date.parse(value.createdAt)) || !Array.isArray(value.metadata)
        || !value.records || typeof value.records !== 'object') throw new Error('crm_invalid_backup');
    return { bytes, snapshot: value };
}

type NewField = { object: string; name: string; type: string; label: string; description: string; options?: { value: string; label: string }[] };
const select = (object: string, name: string, label: string, description: string, options: [string, string][], type = 'SELECT'): NewField => ({
    object, name, label, description, type, options: options.map(([value, label]) => ({ value, label })),
});
const text = (object: string, name: string, label: string, description: string): NewField => ({ object, name, label, description, type: 'TEXT' });
export const CRM_OPERATION_FIELDS: NewField[] = [
    ...['person', 'company', 'opportunity'].map((object) => select(object, 'ptbkRecordKind', 'Druh záznamu', 'Prázdná hodnota neznamená test. Ukázkové a testovací záznamy se nemažou, pouze oddělují od provozních pohledů.', [['REAL', 'Skutečný'], ['DEMO', 'Ukázkový'], ['TEST', 'Testovací']])),
    select('person', 'ptbkRelationshipStage', 'Stav obchodního vztahu', 'Obchodní kvalifikace potvrzená týmem. Historická účast nebo import adresáře sama nezakládá novou poptávku.', [['NEW_ENQUIRY', 'Nová poptávka'], ['IN_CONTACT', 'V komunikaci'], ['QUALIFIED', 'Potřeba potvrzena'], ['CUSTOMER', 'Zákazník'], ['DEFERRED', 'Odloženo'], ['OTHER', 'Jiný vztah']]),
    { object: 'person', name: 'ptbkLastEnquiryAt', label: 'Poslední doložená poptávka', type: 'DATE_TIME', description: 'Nejnovější známá webová žádost se zaznamenaným účelem request. Účast ani nákup nejsou novou poptávkou.' },
    text('person', 'ptbkAgenda', 'Řešená agenda', 'Konkrétní opakující se práce, kterou má klient dlouhodobě zlepšit. Ručně spravovaný údaj.'),
    text('person', 'ptbkExpectedOutcome', 'Očekávaný výsledek', 'Jak poznáme, že první agenda klientovi pomohla. Ručně spravovaný údaj.'),
    text('person', 'ptbkHistoricalNeed', 'Dříve uvedená potřeba', 'Historická odpověď ze zachované zdrojové události; není potvrzením dnešního zájmu.'),
    text('person', 'ptbkHistoricalTeamSize', 'Dříve uvedená velikost týmu', 'Historická odpověď, ne aktuálně ověřená velikost firmy.'),
    text('person', 'ptbkHistoricalRole', 'Dříve uvedená role', 'Historická odpověď z formuláře, nikoli automatické přepsání dnešní pracovní pozice.'),
    text('person', 'ptbkHistoricalEvidence', 'Podklad historického kontextu', 'Identifikátor zachované události v CRM, z níž historické odpovědi pocházejí.'),
    { object: 'person', name: 'ptbkHistoricalAt', label: 'Datum historického kontextu', type: 'DATE_TIME', description: 'Datum nejnovější použité doložené historické odpovědi. Staré „ihned“ není aktuální priorita.' },
    select('company', 'ptbkRoles', 'Role ve vztahu k nám', 'Jedna společnost může mít více rolí. Kandidát ani zájemce nejsou aktivním partnerem.', [['PROSPECT', 'Zájemce o naše služby'], ['CUSTOMER', 'Zákazník'], ['PARTNER_CANDIDATE', 'Kandidát na partnerství'], ['PARTNER_INTERESTED', 'Zájemce o partnerství'], ['PARTNER_CONFIRMED', 'Potvrzený partner'], ['SUPPLIER', 'Dodavatel'], ['INSTITUTION', 'Instituce'], ['INTERNAL', 'Vlastní firma']], 'MULTI_SELECT'),
    select('opportunity', 'ptbkOfferType', 'Typ obchodu', 'Odděluje licenci, jednorázovou práci a teprve vznikající partnerské vztahy.', [['LICENSE', 'Licence Promptbooku'], ['IMPLEMENTATION', 'Nasazení a implementace'], ['CONSULTATION', 'Konzultace'], ['TALK_WORKSHOP', 'Přednáška nebo workshop'], ['PARTNERSHIP', 'Rozvoj partnerství']]),
    text('opportunity', 'ptbkAgenda', 'Řešená agenda', 'Konkrétní opakující se práce; samotné „zájem o AI“ nestačí.'),
    text('opportunity', 'ptbkExpectedOutcome', 'Očekávaný výsledek', 'Dohodnutý výsledek první verze nebo služby.'),
    text('opportunity', 'ptbkBlocker', 'Co brání dalšímu kroku', 'Ověřená překážka nebo chybějící rozhodnutí. Další krok patří do souvisejícího úkolu.'),
    { object: 'opportunity', name: 'ptbkDecisionAt', label: 'Cílové datum rozhodnutí', type: 'DATE_TIME', description: 'Dohodnuté datum rozhodnutí nebo kontroly odloženého případu.' },
    { object: 'opportunity', name: 'ptbkLicenseMrr', label: 'Očekávaná měsíční licence', type: 'CURRENCY', description: 'Předpokládaný opakovaný měsíční příjem za software; ne hrubé inkaso a ne hodnota služeb.' },
    { object: 'opportunity', name: 'ptbkOneOffValue', label: 'Jednorázové služby', type: 'CURRENCY', description: 'Samostatná očekávaná hodnota implementace nebo jiné jednorázové práce.' },
    select('ptbkPurchase', 'ptbkOnboardingStage', 'Spuštění a první hodnota', 'U licencí eviduje ověřený stav nasazení. Zaplacení samo nepotvrzuje instalaci ani první výsledek.', [['NEEDS_REVIEW', 'K ověření'], ['ARRANGING', 'Domlouváme spuštění'], ['INSTALLED', 'Instalace ověřena'], ['FIRST_VALUE', 'První agenda funguje'], ['IN_USE', 'Průběžně používá'], ['BLOCKED', 'Zablokováno']]),
    text('ptbkPurchase', 'ptbkAgenda', 'První klientská agenda', 'Konkrétní dlouhodobě opakovaná práce spojená s tímto nákupem / licencí.'),
    text('ptbkPurchase', 'ptbkOnboardingBlocker', 'Překážka spuštění', 'Ověřený důvod, proč klient ještě nemá první fungující výsledek.'),
    { object: 'ptbkPurchase', name: 'ptbkFirstValueAt', label: 'První fungující výsledek', type: 'DATE_TIME', description: 'Vyplnit až po potvrzení zákazníkem nebo pověřeným partnerem.' },
];

export async function ensureTwentyCrmOperationalFields(settings: TwentyContactApiSettings, backupKey: string) {
    const saved = await loadTwentyCrmBackup(backupKey);
    if (Date.now() - Date.parse(saved.snapshot.createdAt) > 24 * 60 * 60 * 1000) throw new Error('crm_fresh_backup_required');
    const objects = await readTwentyCrmMetadata(settings);
    // Validate every existing field before the first mutation. Never change a type or overwrite its values.
    for (const spec of CRM_OPERATION_FIELDS) {
        const object = objects.find((candidate) => candidate.nameSingular === spec.object);
        if (!object) throw new Error('crm_required_object_missing');
        const existing = metadataFields(object).find((candidate) => candidate.name === spec.name);
        if (existing && existing.type !== spec.type) throw new Error('crm_existing_field_type_mismatch');
    }
    const api = apiFor(settings);
    const created: string[] = [];
    for (const spec of CRM_OPERATION_FIELDS) {
        const object = objects.find((candidate) => candidate.nameSingular === spec.object)!;
        const fields = metadataFields(object);
        if (fields.some((candidate) => candidate.name === spec.name)) continue;
        await new Promise((resolve) => setTimeout(resolve, 750));
        const result = await api.request<Field | { data: { createOneField: Field } }>('metadata/fields', 'POST', {
            objectMetadataId: object.id, name: spec.name, label: spec.label, type: spec.type,
            description: spec.description, icon: spec.type === 'CURRENCY' ? 'IconCurrencyDollar' : 'IconList',
            isLabelSyncedWithName: false,
            ...(spec.options ? { options: spec.options.map((option, position) => ({ id: randomUUID(), ...option, position, color: ['blue', 'green', 'orange', 'purple', 'gray'][position % 5] })) } : {}),
        });
        const field = 'id' in result ? result : result.data?.createOneField;
        if (!field?.id || field.name !== spec.name) throw new Error('crm_invalid_field_create');
        fields.push(field); object.fields = fields;
        created.push(`${spec.object}.${spec.name}`);
    }
    return { version: CRM_OPERATION_VERSION, created, backupKey, deletes: 0, recordWrites: 0 };
}

const groupDefinitions = [
    { category: 'website', name: 'Webové formuláře', create: false },
    { category: 'workshop', name: 'Workshopy Promptbooku', create: false },
    { category: 'community', name: 'Komunita Promptbook – členství a akce', create: false },
    { category: 'license', name: 'Licence Promptbooku', create: true },
    { category: 'project', name: 'Projektové akce', create: true },
] as const;

/** Source grouping is explicitly configured after its groups and existing relation have been verified. */
async function ensureCanonicalSourceGroups(settings: TwentyContactApiSettings, current: Snapshot) {
    const metadata = current.metadata.find((object) => object.nameSingular === 'contactSource');
    if (!metadata || metadataFields(metadata).find((field) => field.name === 'nadrazenyZdroj')?.type !== 'RELATION') throw new Error('crm_source_parent_relation_required');
    const sources = current.records.contactSources;
    if (!sources) throw new Error('crm_source_read_permission_required');
    const sourceGroups: TwentySourceGroups = {};
    // Resolve and validate all pre-existing groups before creating the two optional categories.
    for (const definition of groupDefinitions) {
        const matches = sources.filter((source) => source.name === definition.name && !source.personId && !source.nadrazenyZdrojId);
        if (matches.length > 1) throw new Error('crm_ambiguous_source_group');
        if (!matches.length && !definition.create) throw new Error('crm_source_group_missing');
        if (matches.length === 1) sourceGroups[definition.category] = matches[0].id;
    }
    const api = apiFor(settings);
    const created: string[] = [];
    for (const definition of groupDefinitions) {
        if (sourceGroups[definition.category]) continue;
        const externalId = `crm:source-group:${definition.category}`;
        const id = getTwentyContactRecordId('source', externalId);
        const existing = await api.getRecord<CrmRecord>('contactSources', 'contactSource', id);
        if (existing && existing.externalId !== externalId) throw new Error('crm_source_group_identity_changed');
        const group = existing ?? await api.createRecord<CrmRecord>('contactSources', 'contactSource', 'createContactSource', id, {
            externalId, name: definition.name, sourceName: definition.name, sourceType: 'source-group',
            details: JSON.stringify({ description: 'Stabilní nadřazená skupina. Původní události zůstávají zachované.', version: CRM_OPERATION_VERSION }),
        });
        sourceGroups[definition.category] = group.id;
        if (!existing) created.push(group.id);
    }
    return { sourceGroups, created };
}

type HistoricalMeta = { need?: string; teamSize?: string; role?: string };
const normalizeKey = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const metaAliases = {
    need: ['ai_need', 'aiNeed', 's_čím_potřebujete_u_ai_nejvíce_pomoci?'],
    teamSize: ['team_size', 'teamSize', 'jak_velký_je_váš_tým?'],
    role: ['role', 'companyRole', 'jaká_je_vaše_role_ve_firmě?'],
};
/** Read only explicit questionnaire fields, including Meta field_data arrays; never mine unrelated private prose. */
export function readHistoricalMetaContext(details: unknown): HistoricalMeta {
    const result: HistoricalMeta = {};
    let visited = 0;
    function add(name: string, value: unknown) {
        const first = Array.isArray(value) ? value[0] : value;
        if (typeof first !== 'string' || !first.trim()) return;
        for (const [target, names] of Object.entries(metaAliases)) {
            if (names.some((nameAlias) => normalizeKey(nameAlias) === normalizeKey(name))) result[target as keyof HistoricalMeta] ??= first.trim().slice(0, 400);
        }
    }
    function visit(value: unknown, depth: number) {
        if (depth > 5 || visited++ > 300 || !value || typeof value !== 'object') return;
        if (Array.isArray(value)) { value.slice(0, 100).forEach((item) => visit(item, depth + 1)); return; }
        const object = value as Record<string, unknown>;
        if (typeof object.name === 'string' && 'values' in object) add(object.name, object.values);
        for (const [key, entry] of Object.entries(object)) { add(key, entry); visit(entry, depth + 1); }
    }
    visit(details, 0);
    return result;
}

function parseDetails(source: CrmRecord): Record<string, unknown> {
    try {
        const details: unknown = typeof source.details === 'string' ? JSON.parse(source.details) : source.details;
        return details && typeof details === 'object' && !Array.isArray(details) ? details as Record<string, unknown> : {};
    } catch { return {}; }
}
const isBlank = (value: unknown) => value === null || value === undefined || value === '';
type Patch = { table: string; singular: string; record: CrmRecord; fields: Record<string, unknown> };
const historicalFields = ['ptbkHistoricalNeed', 'ptbkHistoricalTeamSize', 'ptbkHistoricalRole', 'ptbkHistoricalAt', 'ptbkHistoricalEvidence'];
export function planTwentyCrmEnrichment(records: Snapshot['records'], sourceGroups: TwentySourceGroups): Patch[] {
    const sources = records.contactSources ?? [];
    const patches: Patch[] = [];
    const historical = new Map<string, { source: CrmRecord; context: HistoricalMeta }>();
    const customers = new Set<string>();
    for (const source of sources) {
        const category = getTwentySourceCategory(String(source.sourceType ?? ''));
        const groupId = category ? sourceGroups[category] : undefined;
        if (groupId && groupId !== source.id && isBlank(source.nadrazenyZdrojId)) {
            patches.push({ table: 'contactSources', singular: 'contactSource', record: source, fields: { nadrazenyZdrojId: groupId } });
        }
        if (typeof source.personId !== 'string') continue;
        const details = parseDetails(source);
        if (source.sourceType === 'promptbook-subscription' && details.paidCustomer === true) customers.add(source.personId);
        if (!String(source.sourceType ?? '').toLowerCase().startsWith('meta')) continue;
        const context = readHistoricalMetaContext(details);
        if (!Object.keys(context).length || !Number.isFinite(Date.parse(String(source.occurredAt)))) continue;
        const previous = historical.get(source.personId);
        if (!previous || Date.parse(String(source.occurredAt)) > Date.parse(String(previous.source.occurredAt))) historical.set(source.personId, { source, context });
    }
    for (const person of records.people ?? []) {
        const fields: Record<string, unknown> = {};
        const context = historical.get(person.id);
        const emptyHistory = historicalFields.every((field) => isBlank(person[field]));
        const sameHistory = context && person.ptbkHistoricalEvidence === String(context.source.externalId ?? context.source.id)
            && Date.parse(String(person.ptbkHistoricalAt)) === Date.parse(String(context.source.occurredAt));
        if (context && (emptyHistory || sameHistory)) {
            const { need, teamSize, role } = context.context;
            if (need && isBlank(person.ptbkHistoricalNeed)) fields.ptbkHistoricalNeed = need;
            if (teamSize && isBlank(person.ptbkHistoricalTeamSize)) fields.ptbkHistoricalTeamSize = teamSize;
            if (role && isBlank(person.ptbkHistoricalRole)) fields.ptbkHistoricalRole = role;
            if (emptyHistory) {
                fields.ptbkHistoricalAt = context.source.occurredAt;
                fields.ptbkHistoricalEvidence = String(context.source.externalId ?? context.source.id);
            }
        }
        if (customers.has(person.id) && isBlank(person.ptbkRelationshipStage)) fields.ptbkRelationshipStage = 'CUSTOMER';
        const emails = person.emails as { primaryEmail?: string } | undefined;
        const domain = emails?.primaryEmail?.trim().toLowerCase().split('@')[1] ?? '';
        if (isBlank(person.ptbkRecordKind) && ['example.com', 'example.net', 'example.org'].includes(domain)) fields.ptbkRecordKind = 'TEST';
        if (Object.keys(fields).length) patches.push({ table: 'people', singular: 'person', record: person, fields });
    }
    for (const company of records.companies ?? []) {
        if (!isBlank(company.ptbkRoles) && !(Array.isArray(company.ptbkRoles) && company.ptbkRoles.length === 0)) continue;
        if (company.name === 'AI Web s.r.o.') patches.push({ table: 'companies', singular: 'company', record: company, fields: { ptbkRoles: ['INTERNAL'] } });
        else if (company.name === 'manGoweb s.r.o.' && JSON.stringify(company.domainName ?? '').includes('mangoweb.cz')) patches.push({ table: 'companies', singular: 'company', record: company, fields: { ptbkRoles: ['SUPPLIER'] } });
    }
    const demoNames = ['Enterprise Plan Upgrade', 'Design Partnership', 'API Integration Deal', 'Workspace Expansion', 'Platform Migration', 'AI Model Training'];
    for (const opportunity of records.opportunities ?? []) {
        const creator = opportunity.createdBy as { name?: string; source?: string } | undefined;
        if (isBlank(opportunity.ptbkRecordKind) && demoNames.includes(String(opportunity.name)) && (creator?.name === 'System' || creator?.source === 'SYSTEM')) {
            patches.push({ table: 'opportunities', singular: 'opportunity', record: opportunity, fields: { ptbkRecordKind: 'DEMO' } });
        }
    }
    for (const purchase of records.ptbkPurchases ?? []) {
        if (isBlank(purchase.ptbkOnboardingStage) && /promptbook.*(start|business)|^(start|business)$/i.test(String(purchase.product ?? ''))) {
            patches.push({ table: 'ptbkPurchases', singular: 'ptbkPurchase', record: purchase, fields: { ptbkOnboardingStage: 'NEEDS_REVIEW' } });
        }
    }
    return patches;
}

function canonical(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
    return value ?? null;
}
/** Neither the plan nor a stale backup can overwrite a newer human decision. */
export function canApplyTwentyCrmPatch(current: CrmRecord, patch: Patch): boolean {
    return current.id === patch.record.id && Object.keys(patch.fields).every((field) =>
        JSON.stringify(canonical(current[field])) === JSON.stringify(canonical(patch.record[field])),
    );
}
function protectedFieldsMatch(before: CrmRecord, after: CrmRecord, fields: Record<string, unknown>) {
    return before.id === after.id && Object.keys(before).filter((key) => !Object.hasOwn(fields, key)
        && !['updatedAt', 'updatedBy'].includes(key) && !(Object.hasOwn(fields, 'nadrazenyZdrojId') && key === 'nadrazenyZdroj'))
        .every((key) => JSON.stringify(canonical(before[key])) === JSON.stringify(canonical(after[key])));
}
export async function enrichTwentyCrm(settings: TwentyContactApiSettings, backupKey: string) {
    const backup = await loadTwentyCrmBackup(backupKey);
    if (Date.now() - Date.parse(backup.snapshot.createdAt) > 24 * 60 * 60 * 1000) throw new Error('crm_fresh_backup_required');
    const current = await snapshot(settings);
    for (const spec of CRM_OPERATION_FIELDS) {
        const object = current.metadata.find((candidate) => candidate.nameSingular === spec.object);
        if (!object || metadataFields(object).find((field) => field.name === spec.name)?.type !== spec.type) throw new Error('crm_operational_schema_required');
    }
    const { sourceGroups, created } = await ensureCanonicalSourceGroups(settings, current);
    const plan = planTwentyCrmEnrichment(current.records, sourceGroups);
    const batch = plan.slice(0, 50);
    const journalKey = `${BACKUP_PREFIX}${randomUUID()}.json.gz`;
    const journal = { version: CRM_OPERATION_VERSION, createdAt: new Date().toISOString(), metadata: current.metadata,
        records: Object.fromEntries(tables.map((table) => [table, batch.filter((patch) => patch.table === table).map((patch) => patch.record)])),
        unavailable: current.unavailable, parentBackupKey: backupKey, changes: batch.map(({ table, record, fields }) => ({ table, id: record.id, fields })), createdGroups: created };
    const bytes = gzipSync(Buffer.from(JSON.stringify(journal)));
    await putStoredObject(journalKey, bytes, 'application/gzip');
    const stored = await loadTwentyCrmBackup(journalKey);
    if (!stored.bytes.equals(bytes)) throw new Error('crm_backup_verification_failed');
    const api = apiFor(settings);
    const result = { written: 0, skippedConcurrent: 0, readbackVerified: 0, remaining: plan.length, groupsCreated: created.length,
        byTable: {} as Record<string, number>, sourceGroups, journalKey, backupKey, deletes: 0 };
    const deadline = Date.now() + 200000;
    for (const patch of batch) {
        if (Date.now() > deadline) break;
        const before = await api.getRecord<CrmRecord>(patch.table, patch.singular, patch.record.id);
        if (!before || !canApplyTwentyCrmPatch(before, patch)) { result.skippedConcurrent++; result.remaining--; continue; }
        await api.request(`${patch.table}/${patch.record.id}`, 'PATCH', patch.fields);
        const after = await api.getRecord<CrmRecord>(patch.table, patch.singular, patch.record.id);
        if (!after || !protectedFieldsMatch(before, after, patch.fields)) throw new Error('crm_protected_field_changed');
        if (!Object.entries(patch.fields).every(([field, value]) => JSON.stringify(canonical(after[field])) === JSON.stringify(canonical(value)))) throw new Error('crm_patch_readback_failed');
        result.written++; result.readbackVerified++; result.remaining--;
        result.byTable[patch.table] = (result.byTable[patch.table] ?? 0) + 1;
    }
    return result;
}

/** Read-only comparison with the pre-change snapshot; never automatically roll back newer work. */
export function verifyTwentyCrmPreservation(before: Snapshot, after: Snapshot, sourceGroups: TwentySourceGroups) {
    const missingRecords: Record<string, number> = {};
    const changedFields: Record<string, number> = {};
    const changedDefinitions: string[] = [];
    let preservedRecords = 0;
    let approvedParentFills = 0;
    for (const object of before.metadata) {
        const current = after.metadata.find((candidate) => candidate.id === object.id);
        for (const field of metadataFields(object)) {
            const saved = current && metadataFields(current).find((candidate) => candidate.id === field.id);
            if (!saved || ['name', 'label', 'type', 'options'].some((key) => JSON.stringify(canonical(field[key])) !== JSON.stringify(canonical(saved[key])))) {
                changedDefinitions.push(`${object.nameSingular}.${field.name}`);
            }
        }
    }
    for (const [table, originals] of Object.entries(before.records)) {
        const current = new Map((after.records[table] ?? []).map((record) => [record.id, record]));
        for (const original of originals) {
            const saved = current.get(original.id);
            if (!saved) { missingRecords[table] = (missingRecords[table] ?? 0) + 1; continue; }
            preservedRecords++;
            const category = getTwentySourceCategory(String(original.sourceType ?? ''));
            const approvedParent = table === 'contactSources' && isBlank(original.nadrazenyZdrojId)
                && category && sourceGroups[category] && saved.nadrazenyZdrojId === sourceGroups[category];
            if (approvedParent) approvedParentFills++;
            for (const key of Object.keys(original)) {
                if (['updatedAt', 'updatedBy'].includes(key) || (approvedParent && ['nadrazenyZdrojId', 'nadrazenyZdroj'].includes(key))) continue;
                if (JSON.stringify(canonical(original[key])) !== JSON.stringify(canonical(saved[key]))) {
                    const name = `${table}.${key}`;
                    changedFields[name] = (changedFields[name] ?? 0) + 1;
                }
            }
        }
    }
    return { verified: !Object.keys(missingRecords).length && !Object.keys(changedFields).length && !changedDefinitions.length,
        preservedRecords, approvedParentFills, missingRecords, changedFields, changedDefinitions,
        beforeCounts: counts(before), currentCounts: counts(after), unavailable: after.unavailable };
}

export async function verifyTwentyCrmBackupPreservation(settings: TwentyContactApiSettings, backupKey: string) {
    const before = await loadTwentyCrmBackup(backupKey);
    const after = await snapshot(settings);
    return { backupKey, ...verifyTwentyCrmPreservation(before.snapshot, after, settings.sourceGroups ?? {}) };
}
