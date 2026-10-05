import { vi } from 'vitest';
import type { StudioMediaAssetRow } from './studioAssetServer';

/** A conditional row model: successful updates really require every CAS filter, including the completion token. */
export function createStudioAssetRouteTestDatabase() {
    const rows = new Map<string, StudioMediaAssetRow>();
    const references = new Set<string>();
    const from = (table: string) => {
        let operation = 'select';
        let values: Partial<StudioMediaAssetRow> = {};
        const filters: [string, unknown][] = [];
        const execute = () => {
            if (table === 'studio_media_project_references') {
                references.clear();
                return { data: null, error: null };
            }
            if (operation === 'insert') {
                if (rows.has(values.id!)) return { data: null, error: { message: 'duplicate' } };
                rows.set(values.id!, { upload_id: null, ...values } as StudioMediaAssetRow);
                return { data: values, error: null };
            }
            const row = Array.from(rows.values()).find((candidate) =>
                filters.every(([field, value]) => candidate[field as keyof StudioMediaAssetRow] === value),
            );
            if (row && operation === 'update') rows.set(row.id, { ...row, ...values });
            return { data: row ? rows.get(row.id) : null, error: null };
        };
        const query = {
            select: () => query,
            eq: (field: string, value: unknown) => {
                filters.push([field, value]);
                return query;
            },
            is: (field: string, value: unknown) => {
                filters.push([field, value]);
                return query;
            },
            insert: (value: Partial<StudioMediaAssetRow>) => {
                operation = 'insert';
                values = value;
                return query;
            },
            update: (value: Partial<StudioMediaAssetRow>) => {
                operation = 'update';
                values = value;
                return query;
            },
            delete: () => {
                operation = 'delete';
                return query;
            },
            maybeSingle: async () => execute(),
            then: (resolve: (result: ReturnType<typeof execute>) => unknown) =>
                Promise.resolve(execute()).then(resolve),
        };
        return query;
    };
    return {
        rows,
        references,
        from,
        rpc: vi.fn(async (_name: string, values: { target_asset_id: string }) => {
            references.add(values.target_asset_id);
            return { error: null };
        }),
    };
}
