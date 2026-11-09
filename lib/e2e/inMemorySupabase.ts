import { COMMUNITIES, COMMUNITY_IDS } from '@/businesses/community/config';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * A private test-server switch. It is deliberately not a NEXT_PUBLIC_ value,
 * so browsers can neither see nor enable the isolated store.
 */
export const E2E_IN_MEMORY_SUPABASE_ENVIRONMENT_VARIABLE = 'E2E_IN_MEMORY_SUPABASE';

type InMemoryRow = Record<string, unknown>;

type InMemoryQueryResult = {
    readonly data: readonly InMemoryRow[];
    readonly error: null;
    readonly count: null;
};

type InMemorySingleQueryResult = {
    readonly data: InMemoryRow | null;
    readonly error: null;
};

type InMemoryOrder = {
    readonly column: string;
    readonly ascending: boolean;
};

function compareInMemoryValues(left: unknown, right: unknown): number {
    if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
    }

    return String(left).localeCompare(String(right));
}

function areInMemoryRows(values: InMemoryRow | readonly InMemoryRow[]): values is readonly InMemoryRow[] {
    return Array.isArray(values);
}

class InMemoryTable {
    private readonly rows: InMemoryRow[] = [];
    private nextId = 1;

    public constructor(private readonly tableName: string) {}

    public insert(values: InMemoryRow): InMemoryRow {
        const now = new Date().toISOString();
        const row = {
            ...(this.tableName === 'workshop_participants' && {
                connected_at: now,
                last_seen_at: now,
                is_interaction_banned: false,
                is_trusted: false,
                is_moderator: false,
            }),
            ...values,
            id: values.id ?? this.nextId++,
            createdAt: values.createdAt ?? now,
        };

        this.rows.push(row);
        return row;
    }

    public getRows(): readonly InMemoryRow[] {
        return this.rows;
    }
}

/**
 * The small PostgREST-shaped query surface public pages exercise. Rows persist
 * for the lifetime of the E2E server and unseeded tables start empty.
 */
class InMemoryQuery {
    private readonly predicates: Array<(row: InMemoryRow) => boolean> = [];
    private readonly orders: InMemoryOrder[] = [];
    private rangeStart = 0;
    private rangeEnd: number | null = null;
    private updateValues: InMemoryRow | null = null;

    public constructor(
        private readonly table: InMemoryTable,
        private readonly selectedRows: readonly InMemoryRow[] | null = null,
    ) {}

    public select(_columns?: string): this {
        return this;
    }

    public eq(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] === value);
        return this;
    }

    public neq(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] !== value);
        return this;
    }

    public is(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] === value);
        return this;
    }

    public in(column: string, values: readonly unknown[]): this {
        this.predicates.push((row) => values.includes(row[column]));
        return this;
    }

    public contains(column: string, values: string | readonly unknown[]): this {
        const expectedValues = typeof values === 'string' ? JSON.parse(values) as readonly unknown[] : values;
        this.predicates.push((row) => {
            const columnValues = row[column];
            return Array.isArray(columnValues) && expectedValues.every((value) => columnValues.some((entry) => {
                if (value === null || typeof value !== 'object') {
                    return entry === value;
                }
                return entry !== null && typeof entry === 'object' &&
                    Object.entries(value).every(([key, expected]) => (entry as InMemoryRow)[key] === expected);
            }));
        });
        return this;
    }

    public gte(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] !== undefined && compareInMemoryValues(row[column], value) >= 0);
        return this;
    }

    public gt(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] !== undefined && compareInMemoryValues(row[column], value) > 0);
        return this;
    }

    public lte(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] !== undefined && compareInMemoryValues(row[column], value) <= 0);
        return this;
    }

    public lt(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] !== undefined && compareInMemoryValues(row[column], value) < 0);
        return this;
    }

    public order(column: string, options: { readonly ascending?: boolean } = {}): this {
        this.orders.push({ column, ascending: options.ascending ?? true });
        return this;
    }

    public limit(count: number): this {
        this.rangeEnd = this.rangeStart + count - 1;
        return this;
    }

    public range(from: number, to: number): this {
        this.rangeStart = from;
        this.rangeEnd = to;
        return this;
    }

    public insert(values: InMemoryRow | readonly InMemoryRow[]): InMemoryMutation {
        const submittedRows: readonly InMemoryRow[] = areInMemoryRows(values) ? values : [values];
        const insertedRows = submittedRows.map((value) => this.table.insert(value));
        return new InMemoryMutation(this.table, insertedRows);
    }

    public update(values: InMemoryRow): this {
        this.updateValues = values;
        return this;
    }

    public delete(): InMemoryMutation {
        return new InMemoryMutation(this.table, this.getRows());
    }

    public async single(): Promise<InMemorySingleQueryResult> {
        return { data: this.getRows()[0] ?? null, error: null };
    }

    public async maybeSingle(): Promise<InMemorySingleQueryResult> {
        return { data: this.getRows()[0] ?? null, error: null };
    }

    public then<TResult1 = InMemoryQueryResult, TResult2 = never>(
        onfulfilled?: ((value: InMemoryQueryResult) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
        return Promise.resolve(this.getResult()).then(onfulfilled, onrejected);
    }

    private getResult(): InMemoryQueryResult {
        return { data: this.getRows(), error: null, count: null };
    }

    private getRows(): readonly InMemoryRow[] {
        const rows = (this.selectedRows ?? this.table.getRows()).filter((row) =>
            this.predicates.every((predicate) => predicate(row)),
        );

        rows.sort((left, right) => {
            for (const { column, ascending } of this.orders) {
                if (left[column] === right[column]) {
                    continue;
                }

                const direction = ascending ? 1 : -1;
                return left[column]! < right[column]! ? -direction : direction;
            }

            return 0;
        });

        const selectedRows = rows.slice(this.rangeStart, this.rangeEnd === null ? undefined : this.rangeEnd + 1);
        if (this.updateValues !== null) {
            for (const row of selectedRows) Object.assign(row, this.updateValues);
        }
        return selectedRows;
    }
}

class InMemoryMutation {
    public constructor(
        private readonly table: InMemoryTable,
        private readonly changedRows: readonly InMemoryRow[],
    ) {}

    public select(_columns?: string): InMemoryQuery {
        return new InMemoryQuery(this.table, this.changedRows);
    }
}

/**
 * Creates one isolated Supabase-compatible store for a test server. It keeps
 * the public server endpoints and validation real without requiring a private
 * Supabase credential on a developer machine.
 */
export function createInMemorySupabaseClient(
    initialRows: Readonly<Record<string, readonly InMemoryRow[]>> = {},
): SupabaseClient {
    const tables = new Map<string, InMemoryTable>();

    const getTable = (tableName: string): InMemoryTable => {
        const existingTable = tables.get(tableName);
        if (existingTable !== undefined) {
            return existingTable;
        }

        const table = new InMemoryTable(tableName);
        tables.set(tableName, table);
        return table;
    };

    for (const [tableName, rows] of Object.entries(initialRows)) {
        const table = getTable(tableName);
        for (const row of rows) table.insert(row);
    }

    return {
        from: (tableName: string) => new InMemoryQuery(getTable(tableName)),
        rpc: async () => ({ data: [], error: null }),
    } as unknown as SupabaseClient;
}

const e2eStore = globalThis as typeof globalThis & { promptbookE2eSupabase?: SupabaseClient };

const E2E_WORKSHOP_DEFAULTS = {
    description: '',
    is_published: true,
    is_deleted: false,
    youtube_video_id: null,
    preview_youtube_video_id: null,
    recording_start_offset_seconds: 0,
    allowed_reactions: [],
    disabled_panels: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
};

const E2E_PUBLIC_ROOMS: readonly InMemoryRow[] = [
    ...COMMUNITY_IDS.map((id) => ({
        ...E2E_WORKSHOP_DEFAULTS,
        id: `e2e-community-${id}`,
        slug: COMMUNITIES[id].roomSlug,
        title: COMMUNITIES[id].name,
        description: COMMUNITIES[id].description,
        room_kind: 'community',
        event_type: null,
        location_kind: null,
        price_czk: null,
        starts_at: '2026-01-01T00:00:00Z',
        ends_at: null,
    })),
    {
        ...E2E_WORKSHOP_DEFAULTS,
        id: 'e2e-shared-workshop',
        slug: 'e2e-shared-workshop',
        title: 'Společný workshop',
        room_kind: 'workshop',
        event_type: 'online-workshop',
        location_kind: 'online',
        location_label: '',
        price_czk: 0,
        maximum_participant_count: null,
        starts_at: '2026-01-10T18:00:00Z',
        ends_at: '2026-01-10T19:00:00Z',
        community_slugs: COMMUNITY_IDS,
    },
];

const E2E_MEMBER_ARTICLE: InMemoryRow = {
    id: 'c48df326-fd53-4dc8-a281-60e50d097dcb',
    language: 'cs',
    slug: 'e2e-clensky-clanek',
    title: 'Článek pro členy Vývojářů',
    perex: 'Členský obsah pro ověření odděleného přístupu.',
    markdown: 'Obsah dostupný až po vstupu do místnosti Vývojáři.',
    author_id: 'pavol-hejny',
    placements: [{ destination: 'vyvojari', visibility: 'members' }],
    canonical_destination: 'vyvojari',
    published_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
};

/**
 * Return the isolated client only for the Playwright-owned test server.
 */
export function getE2eInMemorySupabaseClientOrNull(): SupabaseClient | null {
    if (process.env[E2E_IN_MEMORY_SUPABASE_ENVIRONMENT_VARIABLE] !== 'true') {
        return null;
    }

    // Next compiles handlers and server-rendered pages into separate module graphs.
    e2eStore.promptbookE2eSupabase ??= createInMemorySupabaseClient({
        workshops: E2E_PUBLIC_ROOMS,
        managed_articles: [E2E_MEMBER_ARTICLE],
    });
    return e2eStore.promptbookE2eSupabase;
}
