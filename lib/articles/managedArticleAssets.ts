import 'server-only';

import { randomUUID } from 'node:crypto';
import { parseArticleWordTimings } from '@/businesses/articles/articleTiming';
import { getObjectStorage, removeStoredObject, signStoredObject } from '@/lib/storage/objectStorage';
import { MANAGED_ARTICLE_ASSET_KINDS, type ManagedArticleAssetKind } from './managedArticleInput';
import {
    getCurrentManagedArticleAsset, getManagedArticleContentHash, managedArticleError,
    MANAGED_ARTICLE_ASSET_COLUMNS, replaceManagedArticleAsset, requireManagedArticleRow, type ManagedArticle,
} from './managedArticles';

function getAssetPrefix(id: string, kind: ManagedArticleAssetKind, revision: string): string {
    return `managed-articles/${id}/${kind}/${revision}/`;
}

function isAllowedSize(byteLength: number, kind: ManagedArticleAssetKind): boolean {
    return Number.isSafeInteger(byteLength) && byteLength > 0 && byteLength <= MANAGED_ARTICLE_ASSET_KINDS[kind].maxBytes;
}

export async function prepareManagedArticleAsset(
    id: string,
    kind: ManagedArticleAssetKind,
    { byteLength, expectedRevision }: { byteLength: number; expectedRevision: string },
): Promise<{ key: string; uploadUrl: string }> {
    if (!isAllowedSize(byteLength, kind)) throw managedArticleError('Velikost souboru překračuje povolený rozsah.', 400);
    await requireManagedArticleRow(id, expectedRevision);
    const key = `${getAssetPrefix(id, kind, expectedRevision)}${randomUUID()}.${MANAGED_ARTICLE_ASSET_KINDS[kind].extension}`;
    const { data, error } = await getObjectStorage().createSignedUploadUrl(key, { upsert: false });
    if (error || !data) throw managedArticleError('Nahrání souboru se nepodařilo připravit.', 503);
    return { key, uploadUrl: data.signedUrl };
}

async function hasExpectedAssetContent(key: string, kind: ManagedArticleAssetKind): Promise<boolean> {
    if (kind === 'words' || kind === 'subtitles') {
        const { data, error } = await getObjectStorage().download(key);
        if (error || !data) return false;
        const text = await data.text();
        if (kind === 'subtitles') return /^(?:\uFEFF)?WEBVTT(?:[ \t\r\n]|$)/.test(text);
        try {
            return parseArticleWordTimings(JSON.parse(text)) !== null;
        } catch {
            return false;
        }
    }
    const response = await fetch(await signStoredObject(key), { headers: { Range: 'bytes=0-15' }, cache: 'no-store' });
    const reader = response.body?.getReader();
    if (!response.ok || !reader) return false;
    const { value } = await reader.read();
    await reader.cancel();
    if (!value) return false;
    const prefix = new TextDecoder().decode(value.subarray(0, 5));
    return kind === 'pdf' ? prefix.startsWith('%PDF-')
        : prefix.startsWith('ID3') || (value.length > 1 && value[0] === 0xff && (value[1] & 0xe0) === 0xe0);
}

export async function finalizeManagedArticleAsset(
    id: string,
    kind: ManagedArticleAssetKind,
    { key, duration, voiceName, expectedRevision }: { key: string; duration?: number; voiceName?: string; expectedRevision: string },
): Promise<ManagedArticle> {
    const prefix = getAssetPrefix(id, kind, expectedRevision);
    const extension = MANAGED_ARTICLE_ASSET_KINDS[kind].extension;
    if (!key.startsWith(prefix) || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(key.slice(prefix.length, -(extension.length + 1))) || !key.endsWith(`.${extension}`)) {
        throw managedArticleError('Soubor nepatří k tomuto článku.', 400);
    }
    if (kind === 'audio' && (duration === undefined || !Number.isFinite(duration) || duration <= 0 || duration > 86_400)) {
        throw managedArticleError('Zadejte délku zvuku v sekundách.', 400);
    }
    const row = await requireManagedArticleRow(id, expectedRevision);
    const audio = getCurrentManagedArticleAsset(row, 'audio');
    if ((kind === 'words' || kind === 'subtitles') && !audio) {
        throw managedArticleError('Nejdřív nahrajte audio, ke kterému tento soubor patří.', 409);
    }

    const { data, error } = await getObjectStorage().info(key);
    const byteLength = Number(data?.size ?? data?.metadata?.size);
    const contentType = String(data?.contentType ?? data?.metadata?.mimetype ?? '').split(';')[0];
    if (error || !data || !isAllowedSize(byteLength, kind) || contentType !== MANAGED_ARTICLE_ASSET_KINDS[kind].mimeType
        || !(await hasExpectedAssetContent(key, kind))) {
        throw managedArticleError('Nahraný soubor chybí nebo má neplatný typ, formát či velikost.', 400);
    }

    const previous = row[MANAGED_ARTICLE_ASSET_COLUMNS[kind]];
    const article = await replaceManagedArticleAsset(row, kind, {
        key, byteLength, contentHash: getManagedArticleContentHash(row),
        ...(kind === 'audio' ? { duration, voiceName: voiceName?.trim().slice(0, 100) || undefined } : {}),
        ...(kind === 'words' || kind === 'subtitles' ? { audioKey: audio?.key } : {}),
    });
    if (previous && previous.key !== key) await removeUnlinkedAsset(previous.key);
    return article;
}

export async function deleteManagedArticleAsset(id: string, kind: ManagedArticleAssetKind, expectedRevision: string): Promise<ManagedArticle> {
    const row = await requireManagedArticleRow(id, expectedRevision);
    const previous = row[MANAGED_ARTICLE_ASSET_COLUMNS[kind]];
    const article = await replaceManagedArticleAsset(row, kind, null);
    if (previous) await removeUnlinkedAsset(previous.key);
    return article;
}

/** Storage cleanup never restores a removed database attachment on a retry. */
async function removeUnlinkedAsset(key: string): Promise<void> {
    try {
        await removeStoredObject(key);
    } catch {
        console.error('Could not remove unlinked managed article asset.');
    }
}
