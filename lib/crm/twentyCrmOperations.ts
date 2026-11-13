import { createHash, randomUUID } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { createTwentyContactApi, type TwentyContactApiSettings } from './twentyContactApi';
import { getObjectStorage, putStoredObject } from '@/lib/storage/objectStorage';

export const CRM_OPERATION_VERSION = '2026-11-13-v1';
const BACKUP_PREFIX = 'private/crm-operations/';
type CrmRecord = { id: string; [key: string]: unknown };
type Field = { id: string; name: string; label: string; type: string; options?: unknown; [key: string]: unknown };
type MetadataObject = { id: string; nameSingular: string; namePlural: string; labelPlural: string; fields: Field[] | { edges: { node: Field }[] }; [key: string]: unknown };
type Snapshot = { version: string; createdAt: string; metadata: MetadataObject[]; records: Record<string, CrmRecord[]>; unavailable: Record<string, number> };
type Backup = { key: string; sha256: string; createdAt: string; counts: Record<string, number>; verified: true };
const tables = ['people', 'companies', 'contactSources', 'opportunities', 'tasks'] as const;

function apiFor(settings: TwentyContactApiSettings) {
    return createTwentyContactApi({ ...settings, timeoutMs: 30000 });
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
    if (value.version !== CRM_OPERATION_VERSION || !value.createdAt || !value.metadata || !value.records) throw new Error('crm_invalid_backup');
    return { bytes, snapshot: value };
}

type NewField = { object: string; name: string; type: string; label: string; description: string; options?: { value: string; label: string }[] };
const select = (object: string, name: string, label: string, description: string, options: [string, string][], type = 'SELECT'): NewField => ({
    object, name, label, description, type, options: options.map(([value, label]) => ({ value, label })),
});
const text = (object: string, name: string, label: string, description: string): NewField => ({ object, name, label, description, type: 'TEXT' });
export const CRM_OPERATION_FIELDS: NewField[] = [
    ...['person', 'company', 'opportunity'].map((object) => select(object, 'ptbkRecordKind', 'Druh záznamu', 'Prázdná hodnota neznamená test. Ukázkové a testovací záznamy se nemažou, pouze oddělují od provozních pohledů.', [['REAL', 'Skutečný'], ['DEMO', 'Ukázkový'], ['TEST', 'Testovací']])),
    select('person', 'ptbkRelationshipStage', 'Stav obchodního vztahu', 'Obchodní kvalifikace potvrzená týmem. Historická účast nebo import adresáře sama nezakládá novou poptávku.', [['NEW_ENQUIRY', 'Nová poptávka'], ['IN_CONTACT', 'V komunikaci'], ['QUALIFIED', 'Potřeba potvrzena'], ['CUSTOMER', 'Platící zákazník'], ['DEFERRED', 'Odloženo'], ['OTHER', 'Jiný vztah']]),
    text('person', 'ptbkAgenda', 'Řešená agenda', 'Konkrétní opakující se práce, kterou má klient dlouhodobě zlepšit. Ručně spravovaný údaj.'),
    text('person', 'ptbkExpectedOutcome', 'Očekávaný výsledek', 'Jak poznáme, že první agenda klientovi pomohla. Ručně spravovaný údaj.'),
    text('person', 'ptbkHistoricalNeed', 'Dříve uvedená potřeba', 'Historická odpověď ze zachované zdrojové události; není potvrzením dnešního zájmu.'),
    text('person', 'ptbkHistoricalTeamSize', 'Dříve uvedená velikost týmu', 'Historická odpověď, ne aktuálně ověřená velikost firmy.'),
    text('person', 'ptbkHistoricalRole', 'Dříve uvedená role', 'Historická odpověď z formuláře, nikoli automatické přepsání dnešní pracovní pozice.'),
    { object: 'person', name: 'ptbkHistoricalAt', label: 'Datum historického kontextu', type: 'DATE_TIME', description: 'Datum nejnovější použité doložené historické odpovědi. Staré „ihned“ není aktuální priorita.' },
    select('company', 'ptbkRoles', 'Role ve vztahu k nám', 'Jedna společnost může mít více rolí. Kandidát ani zájemce nejsou aktivním partnerem.', [['PROSPECT', 'Zájemce o naše služby'], ['CUSTOMER', 'Zákazník'], ['PARTNER_CANDIDATE', 'Kandidát na partnerství'], ['PARTNER_INTERESTED', 'Zájemce o partnerství'], ['PARTNER_CONFIRMED', 'Potvrzený partner'], ['SUPPLIER', 'Dodavatel'], ['INSTITUTION', 'Instituce'], ['INTERNAL', 'Vlastní firma']], 'MULTI_SELECT'),
    select('opportunity', 'ptbkOfferType', 'Typ obchodu', 'Odděluje licenci, jednorázovou práci a teprve vznikající partnerské vztahy.', [['LICENSE', 'Licence Promptbooku'], ['IMPLEMENTATION', 'Nasazení a implementace'], ['CONSULTATION', 'Konzultace'], ['TALK_WORKSHOP', 'Přednáška nebo workshop'], ['PARTNERSHIP', 'Rozvoj partnerství']]),
    text('opportunity', 'ptbkAgenda', 'Řešená agenda', 'Konkrétní opakující se práce; samotné „zájem o AI“ nestačí.'),
    text('opportunity', 'ptbkExpectedOutcome', 'Očekávaný výsledek', 'Dohodnutý výsledek první verze nebo služby.'),
    text('opportunity', 'ptbkBlocker', 'Co brání dalšímu kroku', 'Ověřená překážka nebo chybějící rozhodnutí. Další krok patří do souvisejícího úkolu.'),
    { object: 'opportunity', name: 'ptbkDecisionAt', label: 'Cílové datum rozhodnutí', type: 'DATE_TIME', description: 'Dohodnuté datum rozhodnutí nebo kontroly odloženého případu.' },
    { object: 'opportunity', name: 'ptbkLicenseMrr', label: 'Očekávaná měsíční licence', type: 'CURRENCY', description: 'Předpokládaný opakovaný měsíční příjem za software; ne hrubé inkaso a ne hodnota služeb.' },
    { object: 'opportunity', name: 'ptbkOneOffValue', label: 'Jednorázové služby', type: 'CURRENCY', description: 'Samostatná očekávaná hodnota implementace nebo jiné jednorázové práce.' },
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
