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
        private orders: Array<{ column: string; ascending: boolean }> = [];
        private rangeBounds: [number, number] | null = null;
        private countExact = false;
        constructor(private readonly table: string) {}
        select(columns = '*', options?: { count?: string }) { this.columns = columns; this.countExact = options?.count === 'exact'; return this; }
        eq(column: string, value: unknown) { this.filters.push([column, value]); return this; }
        is(column: string, value: null) { this.filters.push([column, value]); return this; }
        order(column: string, options?: { ascending?: boolean }) { this.orders.push({ column, ascending: options?.ascending ?? true }); return this; }
        range(from: number, to: number) { this.rangeBounds = [from, to]; return this; }
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
            const where = this.filters.length ? ` WHERE ${this.filters.map(([field, value]) => value === null ? `${quote(field)} IS NULL` : `${quote(field)}=${bind(value)}`).join(' AND ')}` : '';
            sql += where;
            if (this.operation !== 'SELECT') sql += ` RETURNING ${columns}`;
            if (this.orders.length) sql += ` ORDER BY ${this.orders.map(({ column, ascending }) => `${quote(column)} ${ascending ? 'ASC' : 'DESC'}`).join(',')}`;
            if (this.rangeBounds) sql += ` OFFSET ${this.rangeBounds[0]} LIMIT ${this.rangeBounds[1] - this.rangeBounds[0] + 1}`;
            try {
                const result = await database.query<Record<string, unknown>>(sql, parameters);
                const count = this.countExact ? Number((await database.query<{ total: number }>(`SELECT count(*) AS total FROM ${quote(this.table)}${where}`, parameters)).rows[0].total) : null;
                return { data: result.rows, error: null, count };
            } catch (error) {
                return { data: null, error: error as { code: string; message: string } };
            }
        }
    }
    return { from: (table: string) => new Query(table) } as unknown as SupabaseClient;
}
