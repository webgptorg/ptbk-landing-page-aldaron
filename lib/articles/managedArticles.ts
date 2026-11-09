import 'server-only';

import { createHash, randomUUID } from 'node:crypto';
import { removeStoredObject } from '@/lib/storage/objectStorage';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';
import { getAllArticles } from './load';
import {
    managedArticleInputSchema, type ManagedArticleAssetKind, type ManagedArticleDestination,
    type ManagedArticleInput, type ManagedArticlePlacement,
} from './managedArticleInput';
import type { ArticleLanguage } from './types';

const TABLE = 'managed_articles';
export const MANAGED_ARTICLE_ASSET_COLUMNS = {
    audio: 'audio_asset',
    pdf: 'pdf_asset',
    words: 'words_asset',
    subtitles: 'subtitles_asset',
} as const;
const ASSET_KINDS = Object.keys(MANAGED_ARTICLE_ASSET_COLUMNS) as ManagedArticleAssetKind[];

export type StoredManagedArticleAsset = {
    readonly key: string;
    readonly byteLength: number;
    readonly contentHash: string;
    readonly duration?: number;
    readonly voiceName?: string;
    readonly audioKey?: string;
};

export type ManagedArticleRow = {
    readonly id: string;
    readonly revision: string;
    readonly language: ArticleLanguage;
    readonly slug: string;
    readonly title: string;
    readonly perex: string;
    readonly markdown: string;
    readonly author_id: string;
    readonly placements: ManagedArticlePlacement[];
    readonly canonical_destination: ManagedArticleDestination | null;
    readonly published_at: string | null;
    readonly created_at: string;
    readonly updated_at: string;
} & Record<(typeof MANAGED_ARTICLE_ASSET_COLUMNS)[ManagedArticleAssetKind], StoredManagedArticleAsset | null>;

export type ManagedArticle = ManagedArticleInput & {
    readonly id: string;
    readonly revision: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly publishedAt: string | null;
    readonly assets: Partial<Record<ManagedArticleAssetKind, {
        readonly byteLength: number;
        readonly duration?: number;
        readonly voiceName?: string;
    }>>;
};

export function managedArticleError(message: string, status: number): Error & { status: number } {
    return Object.assign(new Error(message), { status });
}

function getDatabase() {
    const client = createSupabaseServiceRoleClient();
    if (!client) throw managedArticleError('Databáze článků není nakonfigurovaná.', 503);
    return client.from(TABLE);
}

export function getManagedArticleContentHash(row: Pick<ManagedArticleRow, 'language' | 'title' | 'perex' | 'markdown' | 'author_id'>): string {
    return createHash('sha256')
        .update(JSON.stringify([row.language, row.title, row.perex, row.markdown, row.author_id]))
        .digest('hex');
}

/** Assets stay immutable and are only served with the article/recording revision they describe. */
export function getCurrentManagedArticleAsset(
    row: ManagedArticleRow,
    kind: ManagedArticleAssetKind,
): StoredManagedArticleAsset | null {
    const asset = row[MANAGED_ARTICLE_ASSET_COLUMNS[kind]];
    if (!asset || asset.contentHash !== getManagedArticleContentHash(row)) return null;
    if ((kind === 'words' || kind === 'subtitles') && asset.audioKey !== row.audio_asset?.key) return null;
    return asset;
}

export function toManagedArticle(row: ManagedArticleRow): ManagedArticle {
    const assets: ManagedArticle['assets'] = {};
    for (const kind of ASSET_KINDS) {
        const asset = getCurrentManagedArticleAsset(row, kind);
        if (asset) assets[kind] = { byteLength: asset.byteLength, duration: asset.duration, voiceName: asset.voiceName };
    }
    return {
        id: row.id, revision: row.revision, language: row.language, slug: row.slug, title: row.title, perex: row.perex,
        markdown: row.markdown, authorId: row.author_id, placements: row.placements,
        canonicalDestination: row.canonical_destination, publishedAt: row.published_at,
        createdAt: row.created_at, updatedAt: row.updated_at, assets,
    };
}

function getRowValues(input: ManagedArticleInput, publishedAt: string | null) {
    const parsed = managedArticleInputSchema.parse(input);
    if (parsed.slug === 'opengraph-image' || getAllArticles().some((article) => article.language === parsed.language && article.slug === parsed.slug)) {
        throw managedArticleError('Tuto adresu už používá existující článek nebo stránka.', 409);
    }
    return {
        language: parsed.language, slug: parsed.slug, title: parsed.title, perex: parsed.perex,
        markdown: parsed.markdown, author_id: parsed.authorId, placements: parsed.placements,
        canonical_destination: parsed.canonicalDestination,
        published_at: publishedAt ?? (parsed.canonicalDestination ? new Date().toISOString() : null),
        revision: randomUUID(), updated_at: new Date().toISOString(),
    };
}

function writeError(error: { code?: string } | null): never {
    if (error?.code === '23505') throw managedArticleError('Článek s touto adresou už existuje.', 409);
    throw managedArticleError('Změnu článku se nepodařilo uložit.', 503);
}

export async function listManagedArticles(): Promise<ManagedArticle[]> {
    const database = getDatabase();
    const { rows } = await loadAllSupabaseRows<ManagedArticleRow>(
        (from, to) => database.select('*').order('updated_at', { ascending: false }).order('id').range(from, to),
        'list managed articles',
    );
    if (!rows) throw managedArticleError('Články se nepodařilo načíst.', 503);
    return rows.map(toManagedArticle);
}

export async function getManagedArticleRow(id: string): Promise<ManagedArticleRow | null> {
    if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) return null;
    const { data, error } = await getDatabase().select('*').eq('id', id).maybeSingle();
    if (error) throw managedArticleError('Článek se nepodařilo načíst.', 503);
    return data as ManagedArticleRow | null;
}

export async function getManagedArticle(id: string): Promise<ManagedArticle | null> {
    const row = await getManagedArticleRow(id);
    return row ? toManagedArticle(row) : null;
}

export async function requireManagedArticleRow(id: string, expectedRevision?: string): Promise<ManagedArticleRow> {
    const row = await getManagedArticleRow(id);
    if (!row) throw managedArticleError('Článek nebyl nalezen.', 404);
    if (expectedRevision !== undefined && row.revision !== expectedRevision) {
        throw managedArticleError('Článek se mezitím změnil. Načtěte jeho aktuální stav a zkuste změnu znovu.', 409);
    }
    return row;
}

export async function createManagedArticle(input: ManagedArticleInput): Promise<ManagedArticle> {
    const { data, error } = await getDatabase().insert(getRowValues(input, null)).select('*').single();
    if (error || !data) return writeError(error);
    return toManagedArticle(data as ManagedArticleRow);
}

export async function updateManagedArticle(id: string, input: ManagedArticleInput, expectedRevision: string): Promise<ManagedArticle> {
    const row = await requireManagedArticleRow(id, expectedRevision);
    const { data, error } = await getDatabase().update(getRowValues(input, row.published_at))
        .eq('id', id).eq('revision', row.revision).select('*').maybeSingle();
    if (error) return writeError(error);
    if (!data) throw managedArticleError('Článek se mezitím změnil. Načtěte jeho aktuální stav a zkuste změnu znovu.', 409);
    return toManagedArticle(data as ManagedArticleRow);
}

export async function deleteManagedArticle(id: string): Promise<void> {
    if (!await getManagedArticleRow(id)) throw managedArticleError('Článek nebyl nalezen.', 404);
    const { data, error } = await getDatabase().delete().eq('id', id).select('*').maybeSingle();
    if (error) return writeError(error);
    if (!data) throw managedArticleError('Článek nebyl nalezen.', 404);
    const row = data as ManagedArticleRow;
    await Promise.all(ASSET_KINDS.map(async (kind) => {
        const asset = row[MANAGED_ARTICLE_ASSET_COLUMNS[kind]];
        if (!asset) return;
        try {
            await removeStoredObject(asset.key);
        } catch {
            console.error('Could not remove a managed article asset after deleting its article.');
        }
    }));
}

export async function replaceManagedArticleAsset(
    row: ManagedArticleRow,
    kind: ManagedArticleAssetKind,
    asset: StoredManagedArticleAsset | null,
): Promise<ManagedArticle> {
    const { data, error } = await getDatabase()
        .update({ [MANAGED_ARTICLE_ASSET_COLUMNS[kind]]: asset, revision: randomUUID(), updated_at: new Date().toISOString() })
        .eq('id', row.id).eq('revision', row.revision).select('*').maybeSingle();
    if (error) return writeError(error);
    if (!data) throw managedArticleError('Článek se mezitím změnil. Zkuste změnu souboru znovu.', 409);
    return toManagedArticle(data as ManagedArticleRow);
}

export async function readPublishedManagedArticles(language: ArticleLanguage | undefined, destination: ManagedArticleDestination, publicOnly = false): Promise<ManagedArticleRow[]> {
    const client = createSupabaseServiceRoleClient();
    if (!client) return [];
    const placementFilter = JSON.stringify([publicOnly ? { destination, visibility: 'public' } : { destination }]);
    const { rows } = await loadAllSupabaseRows<ManagedArticleRow>(
        (from, to) => {
            const query = client.from(TABLE).select('*').contains('placements', placementFilter);
            return (language ? query.eq('language', language) : query).order('published_at', { ascending: false }).order('id').range(from, to);
        },
        'read published managed articles',
    );
    return rows ? [...rows] : [];
}

export async function readPublishedManagedArticle(language: ArticleLanguage, slug: string, destination: ManagedArticleDestination): Promise<ManagedArticleRow | null> {
    const client = createSupabaseServiceRoleClient();
    if (!client || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) return null;
    const { data, error } = await client.from(TABLE).select('*')
        .eq('language', language).eq('slug', slug).contains('placements', JSON.stringify([{ destination }])).maybeSingle();
    if (error) return null;
    return data as ManagedArticleRow | null;
}
