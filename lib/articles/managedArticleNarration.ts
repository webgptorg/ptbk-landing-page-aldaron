import 'server-only';

import { randomUUID } from 'node:crypto';
import { ALL_FORMATS, BufferSource, Input } from 'mediabunny';
import { renderArticleDocument } from '@/businesses/articles/articleDocument';
import { getArticleTimedSentences } from '@/businesses/articles/articleTiming';
import { mapSpeechAlignment, resolveElevenLabsNarrator, synthesizeElevenLabsNarration } from '@/lib/audio-player/elevenLabsNarration';
import { prepareNarrationDocument } from '@/lib/audio-player/prepareNarrationDocument';
import { putStoredObject, removeStoredObject } from '@/lib/storage/objectStorage';
import { serializeSubtitleFile } from '@/lib/workshops/subtitles/workshopSubtitleFormat';
import { MANAGED_ARTICLE_ASSET_KINDS, type ManagedArticleAssetKind } from './managedArticleInput';
import {
    attachManagedArticleNarration, claimManagedArticleNarration, getManagedArticleContentHash, managedArticleError,
    releaseManagedArticleNarration, requireManagedArticleRow, type ManagedArticle, type StoredManagedArticleAsset,
} from './managedArticles';

export async function generateManagedArticleNarration(id: string, revision: string, requestSignal: AbortSignal): Promise<ManagedArticle> {
    const key = process.env.ELEVENLABS_API_KEY?.trim();
    if (!key || !process.env.OBJECT_STORAGE_BUCKET?.trim()) throw managedArticleError('Generování nahrávky není nakonfigurované.', 503);

    const row = await requireManagedArticleRow(id, revision);
    const document = prepareNarrationDocument(renderArticleDocument(row.markdown, row.title, row.perex, undefined, { bookExamples: true }));
    if (!row.markdown.trim() || !document.script || document.script.length > 10_000) {
        throw managedArticleError('Pro namluvení doplňte text článku. Název, perex a čitelný text mohou mít dohromady nejvýše 10 000 znaků.', 400);
    }

    const token = randomUUID();
    await claimManagedArticleNarration(row, token);
    const attemptedUploads: string[] = [];
    let attachmentAttempted = false;
    try {
        const signal = AbortSignal.any([requestSignal, AbortSignal.timeout(110_000)]);
        const voice = await resolveElevenLabsNarrator(key, signal);
        const { bytes, alignment } = await synthesizeElevenLabsNarration(key, voice.id, document.script, signal);
        if (!bytes.length || bytes.length > 32 * 1024 * 1024) throw new Error('Nahrávka má nepodporovanou velikost.');
        const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(bytes) });
        let duration: number;
        try { duration = await input.computeDuration(); } finally { input.dispose(); }
        if (!Number.isFinite(duration) || duration <= 0) throw new Error('Délku nahrávky se nepodařilo ověřit.');

        const timings = mapSpeechAlignment(document, alignment);
        if (!timings) throw managedArticleError('ElevenLabs nevrátilo použitelné časování slov. Nahrávka nebyla připojena.', 424);
        const spokenWords = new Map(document.words.map(({ id: wordId, spokenText }) => [wordId, spokenText]));
        const captions = getArticleTimedSentences(timings.words).map(({ start, end, wordIds }) => ({
            startSeconds: start,
            endSeconds: Math.max(end, (Math.round(start * 1000) + 1) / 1000),
            text: wordIds.map((wordId) => spokenWords.get(wordId)).join(' '),
        }));
        const contentHash = getManagedArticleContentHash(row);
        const upload = async (kind: ManagedArticleAssetKind, payload: Uint8Array): Promise<StoredManagedArticleAsset> => {
            const { extension, mimeType, maxBytes } = MANAGED_ARTICLE_ASSET_KINDS[kind];
            if (payload.length > maxBytes) throw new Error('Vygenerovaný soubor je příliš velký.');
            const objectKey = `managed-articles/${id}/${kind}/${revision}/${token}.${extension}`;
            attemptedUploads.push(objectKey);
            await putStoredObject(objectKey, payload, mimeType);
            return { key: objectKey, byteLength: payload.length, contentHash };
        };
        const audio = await upload('audio', bytes);
        const words = await upload('words', Buffer.from(JSON.stringify(timings)));
        const subtitles = await upload('subtitles', Buffer.from(serializeSubtitleFile(captions)));
        attachmentAttempted = true;
        const article = await attachManagedArticleNarration(row, token, {
            audio_asset: { ...audio, duration, voiceName: voice.name },
            words_asset: { ...words, audioKey: audio.key },
            subtitles_asset: { ...subtitles, audioKey: audio.key },
        });
        await Promise.all([row.audio_asset, row.words_asset, row.subtitles_asset].map((asset) => asset && cleanup(asset.key)));
        return article;
    } catch (error) {
        // A lost database response can follow a successful write. Keep its objects unless the write definitely lost the revision race.
        if (!attachmentAttempted || (error instanceof Error && 'status' in error && error.status === 409)) {
            await Promise.all(attemptedUploads.map(cleanup));
        }
        if (error instanceof Error && 'providerStatus' in error) throw managedArticleError(error.message, 424);
        throw error;
    } finally {
        await releaseManagedArticleNarration(id, token).catch(() => console.error('Could not release managed article narration lease.'));
    }
}

async function cleanup(key: string): Promise<void> {
    await removeStoredObject(key).catch(() => console.error('Could not remove unlinked managed article narration.'));
}
