import type { PGlite } from '@electric-sql/pglite';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A minimal transport adapter: tests execute the real migration, constraints, triggers and parameterized SQL. */
export function createAdminUserTestClient(database: PGlite): SupabaseClient {
    function quote(identifier: string): string {
        if (!/^[a-z_]+$/.test(identifier)) throw new Error('Unexpected test database identifier');
        return `"${identifier}"`;
    }
    class Query {
        private columns = '*';
        private filters: Array<[string, unknown]> = [];
        private values: Record<string, unknown> = {};
        private operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' = 'SELECT';
        private orderColumn: string | null = null;
        constructor(private readonly table: string) {}
        select(columns = '*') { this.columns = columns; return this; }
        eq(column: string, value: unknown) { this.filters.push([column, value]); return this; }
        order(column: string) { this.orderColumn = column; return this; }
        insert(values: Record<string, unknown>) { this.operation = 'INSERT'; this.values = values; return this; }
        update(values: Record<string, unknown>) { this.operation = 'UPDATE'; this.values = values; return this; }
        delete() { this.operation = 'DELETE'; return this; }
        async single() { const result = await this.execute(); return { ...result, data: result.data?.[0] ?? null }; }
        maybeSingle() { return this.single(); }
        then<Result1 = Awaited<ReturnType<Query['execute']>>, Result2 = never>(
            resolve?: ((result: Awaited<ReturnType<Query['execute']>>) => Result1 | PromiseLike<Result1>) | null,
            reject?: ((reason: unknown) => Result2 | PromiseLike<Result2>) | null,
        ): Promise<Result1 | Result2> { return this.execute().then(resolve, reject); }
        private async execute() {
            const parameters: unknown[] = [];
            const bind = (value: unknown) => { parameters.push(value); return `$${parameters.length}`; };
            const columns = this.columns === '*' ? '*' : this.columns.split(',').map(quote).join(',');
            const fields = Object.keys(this.values);
            let sql = '';
            if (this.operation === 'SELECT') sql = `SELECT ${columns} FROM ${quote(this.table)}`;
            if (this.operation === 'INSERT') sql = `INSERT INTO ${quote(this.table)} (${fields.map(quote).join(',')}) VALUES (${fields.map((field) => bind(this.values[field])).join(',')})`;
            if (this.operation === 'UPDATE') sql = `UPDATE ${quote(this.table)} SET ${fields.map((field) => `${quote(field)}=${bind(this.values[field])}`).join(',')}`;
            if (this.operation === 'DELETE') sql = `DELETE FROM ${quote(this.table)}`;
            if (this.filters.length) sql += ` WHERE ${this.filters.map(([field, value]) => `${quote(field)}=${bind(value)}`).join(' AND ')}`;
            if (this.operation !== 'SELECT') sql += ` RETURNING ${columns}`;
            if (this.orderColumn) sql += ` ORDER BY ${quote(this.orderColumn)}`;
            try {
                const result = await database.query<Record<string, unknown>>(sql, parameters);
                return { data: result.rows, error: null };
            } catch (error) {
                return { data: null, error: error as { code: string; message: string } };
            }
        }
    }
    return { from: (table: string) => new Query(table) } as unknown as SupabaseClient;
}
