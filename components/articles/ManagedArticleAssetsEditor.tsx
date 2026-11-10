'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { JsonRequestError } from '@/lib/api/requestJson';
import { ARTICLES_ADMIN_API } from '@/lib/articles/articleAdminTypes';
import { MANAGED_ARTICLE_ASSET_KINDS, type ManagedArticleAssetKind } from '@/lib/articles/managedArticleInput';
import type { ManagedArticle } from '@/lib/articles/managedArticles';

const ASSET_LABELS: Record<ManagedArticleAssetKind, string> = {
    audio: 'Předčítání (MP3)',
    pdf: 'Článek ke stažení (PDF)',
    words: 'Časování slov (JSON)',
    subtitles: 'Titulky (VTT)',
};
const MANUAL_AUDIO_KINDS = ['audio', 'words', 'subtitles'] as const;

function readAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
        const audio = document.createElement('audio');
        const url = URL.createObjectURL(file);
        const timer = window.setTimeout(fail, 15_000);

        function cleanup() {
            window.clearTimeout(timer);
            audio.onloadedmetadata = null;
            audio.onerror = null;
            audio.removeAttribute('src');
            audio.load();
            URL.revokeObjectURL(url);
        }
        function fail() {
            cleanup();
            reject(new Error('Z vybraného souboru se nepodařilo načíst délku MP3.'));
        }
        audio.onloadedmetadata = () => {
            const duration = audio.duration;
            if (!Number.isFinite(duration) || duration <= 0 || duration > 86_400) { fail(); return; }
            cleanup();
            resolve(duration);
        };
        audio.onerror = fail;
        audio.preload = 'metadata';
        audio.src = url;
    });
}

function mediaRequest<Body>(url: string, method: 'POST' | 'PATCH' | 'DELETE', body: unknown) {
    return requestAdminJson<Body>(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }, 'Operaci se souborem se nepodařilo dokončit.');
}

type AssetEditorProps = {
    readonly article: ManagedArticle;
    readonly isConfigured: boolean;
    readonly narrationConfigured: boolean;
    readonly isBusy: boolean;
    readonly onRun: (label: string, action: () => Promise<void>) => Promise<boolean>;
    readonly onSaved: (article: ManagedArticle) => void;
    readonly flushContent: () => Promise<boolean>;
    readonly getCurrentArticle: () => ManagedArticle | null;
};

type PendingUpload = { readonly file: File; readonly revision: string; readonly key: string; readonly duration?: number };

export function ManagedArticleAssetsEditor(props: AssetEditorProps) {
    const { article, flushContent, getCurrentArticle, onRun, onSaved } = props;

    function generateNarration() {
        void onRun('Generuji předčítání přes ElevenLabs…', async () => {
            if (!(await flushContent())) throw new Error('Nejprve dokončete uložení obsahu článku.');
            const current = getCurrentArticle();
            if (!current) return;
            const result = await requestAdminJson<{ article: ManagedArticle }>(`${ARTICLES_ADMIN_API}/${current.id}/audio`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedRevision: current.revision }),
            }, 'Předčítání se nepodařilo vygenerovat.');
            onSaved(result.article);
        });
    }

    return <section className="space-y-3 border-t border-slate-200 pt-5" aria-labelledby="article-media-heading">
        <h3 className="text-base font-semibold text-slate-950" id="article-media-heading">Předčítání a soubory</h3>
        <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant={article.assets.audio ? 'outline' : 'default'}
                disabled={props.isBusy || !props.narrationConfigured} onClick={generateNarration}>
                <Volume2 className="mr-2 h-4 w-4" aria-hidden="true" />
                {article.assets.audio ? 'Přegenerovat audio přes ElevenLabs' : 'Vygenerovat audio přes ElevenLabs'}
            </Button>
            {article.assets.audio && <p role="status" className="text-sm text-slate-600">
                Audio je připojeno{article.assets.words && article.assets.subtitles ? ' včetně časování slov a titulků.' : '.'}
            </p>}
        </div>
        {!props.narrationConfigured && <p className="text-sm text-slate-600">Pro generování musí být nastavené ElevenLabs a úložiště.</p>}
        {props.isConfigured && <>
            <details>
                <summary className="cursor-pointer text-sm font-medium text-slate-700">Ruční správa audia a titulků</summary>
                <div className="mt-2 space-y-2">
                    {MANUAL_AUDIO_KINDS.map((kind) => <ArticleAssetForm key={kind} kind={kind} {...props} />)}
                </div>
            </details>
            <ArticleAssetForm kind="pdf" {...props} />
        </>}
    </section>;
}

function ArticleAssetForm({ kind, article, isBusy, onRun, onSaved, flushContent, getCurrentArticle }: AssetEditorProps & { readonly kind: ManagedArticleAssetKind }) {
    const input = useRef<HTMLInputElement>(null);
    const pending = useRef<PendingUpload | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [voiceName, setVoiceName] = useState('');
    const asset = article.assets[kind];
    const config = MANAGED_ARTICLE_ASSET_KINDS[kind];
    const label = ASSET_LABELS[kind];
    const url = `${ARTICLES_ADMIN_API}/${article.id}/assets/${kind}`;
    const requiresAudio = kind === 'words' || kind === 'subtitles';

    async function upload(event: FormEvent) {
        event.preventDefault();
        if (!file) return;
        const didSave = await onRun('Nahrávám soubor…', async () => {
            if (!(await flushContent())) throw new Error('Nejprve dokončete uložení obsahu článku.');
            const current = getCurrentArticle();
            if (!current) return;
            if (!file.name.toLowerCase().endsWith(`.${config.extension}`) || file.size === 0 || file.size > config.maxBytes) {
                throw new Error(`Vyberte soubor .${config.extension} do ${config.maxBytes / (1024 * 1024)} MB.`);
            }
            if (requiresAudio && !current.assets.audio) throw new Error('Nejdřív nahrajte odpovídající MP3.');
            const expectedRevision = current.revision;
            await protectAdminMutation(async () => {
                let ready = pending.current;
                if (!ready || ready.file !== file || ready.revision !== expectedRevision) {
                    const duration = kind === 'audio' ? await readAudioDuration(file) : undefined;
                    const { key, uploadUrl } = await mediaRequest<{ key: string; uploadUrl: string }>(url, 'POST', { byteLength: file.size, expectedRevision });
                    const destination = new URL(uploadUrl);
                    if (destination.origin === window.location.origin) throw new Error('Nahrávání vyžaduje přímý odkaz na úložiště.');
                    const response = await fetch(destination, {
                        method: 'PUT', headers: { 'Content-Type': config.mimeType, 'Cache-Control': 'max-age=0', 'x-upsert': 'false' },
                        body: file, credentials: 'omit', redirect: 'error',
                    });
                    await response.body?.cancel();
                    if (!response.ok) throw new Error('Přenos souboru do úložiště se nezdařil.');
                    ready = { file, revision: expectedRevision, key, duration };
                    pending.current = ready;
                }
                try {
                    const result = await mediaRequest<{ article: ManagedArticle }>(url, 'PATCH', {
                        key: ready.key, duration: ready.duration, expectedRevision, ...(kind === 'audio' ? { voiceName } : {}),
                    });
                    pending.current = null;
                    onSaved(result.article);
                } catch (failure) {
                    // Transient finalization failures can reuse the uploaded bytes on a manual retry.
                    if (failure instanceof JsonRequestError && failure.status < 500) pending.current = null;
                    throw failure;
                }
            });
        });
        if (didSave) {
            setFile(null);
            setVoiceName('');
            if (input.current) input.current.value = '';
        }
    }

    function remove() {
        if (!window.confirm(`Odstranit soubor „${label}“?`)) return;
        void onRun('Odstraňuji soubor…', async () => {
            if (!(await flushContent())) throw new Error('Nejprve dokončete uložení obsahu článku.');
            const current = getCurrentArticle();
            if (!current) return;
            const result = await mediaRequest<{ article: ManagedArticle }>(url, 'DELETE', { expectedRevision: current.revision });
            onSaved(result.article);
        });
    }

    return <form className="rounded-lg border border-slate-200 p-3" onSubmit={(event) => void upload(event)}>
        <fieldset disabled={isBusy || (requiresAudio && !article.assets.audio)} className="space-y-2">
            <legend className="sr-only">{label}</legend>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{label}</p>
                {asset && <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>Nahráno{asset.voiceName ? ` · ${asset.voiceName}` : ''}</span>
                    <Button type="button" size="sm" variant="ghost" aria-label={`Odstranit ${label}`} onClick={remove}>Odstranit</Button>
                </div>}
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                <Input className="min-w-0 flex-1" ref={input} type="file" accept={`.${config.extension}`} aria-label={`Vybrat soubor · ${label}`} onChange={(event) => { pending.current = null; setFile(event.target.files?.[0] ?? null); }} />
                {kind === 'audio' && <Input className="sm:w-44" maxLength={100} aria-label="Jméno hlasu" placeholder="Jméno hlasu (volitelné)" value={voiceName} onChange={(event) => setVoiceName(event.target.value)} />}
                <Button type="submit" variant="outline" aria-label={`Nahrát soubor · ${label}`} disabled={!file}>{asset ? 'Nahradit' : 'Nahrát'}</Button>
            </div>
            {requiresAudio && !article.assets.audio && <p className="text-xs text-slate-600">Po nahrání MP3.</p>}
        </fieldset>
    </form>;
}
