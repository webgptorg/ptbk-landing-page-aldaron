'use client';

import { useRef, useState, type FormEvent } from 'react';
import { COMMUNITIES } from '@/businesses/community/config';
import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { useAdminDraftProtection } from '@/hooks/useAdminDraftProtection';
import { AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { JsonRequestError } from '@/lib/api/requestJson';
import { ARTICLES_ADMIN_API, ARTICLE_DESTINATION_LABELS } from '@/lib/articles/articleAdminTypes';
import { ARTICLE_AUTHORS } from '@/lib/articles/authors';
import {
    ARTICLE_DESTINATIONS, isArticleCommunity, managedArticleInputSchema,
    type ManagedArticleDestination, type ManagedArticleInput, type ManagedArticlePlacement,
} from '@/lib/articles/managedArticleInput';
import type { ManagedArticle } from '@/lib/articles/managedArticles';
import { getManagedArticleUrl } from '@/lib/articles/managedArticleUrls';
import { normalizeSearchText } from '@/lib/search/textSearch';
import { ManagedArticleAssetsEditor } from './ManagedArticleAssetsEditor';

type Publication = Pick<ManagedArticleInput, 'placements' | 'canonicalDestination'>;
type Content = Omit<ManagedArticleInput, keyof Publication>;
const NO_PUBLICATION: Publication = { placements: [], canonicalDestination: null };

function getPublication(article: ManagedArticle | null): Publication {
    if (!article) return NO_PUBLICATION;
    const placements = ARTICLE_DESTINATIONS.flatMap((destination) => article.placements.filter((placement) => placement.destination === destination));
    return { placements, canonicalDestination: article.canonicalDestination };
}

function getContent(article: ManagedArticle | null): Content {
    if (!article) return { language: 'cs', slug: '', title: '', perex: '', markdown: '', authorId: ARTICLE_AUTHORS[0].id };
    const { language, slug, title, perex, markdown, authorId } = article;
    return { language, slug, title, perex, markdown, authorId };
}

function suggestedSlug(title: string): string {
    return normalizeSearchText(title).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100).replace(/-+$/g, '');
}

function validateArticle(input: ManagedArticleInput): ManagedArticleInput {
    const parsed = managedArticleInputSchema.safeParse(input);
    if (!parsed.success) throw new AdminSaveValidationError(parsed.error.issues[0]?.message ?? 'Zkontrolujte vyplněná pole.');
    return parsed.data;
}

function saveArticle(input: ManagedArticleInput, expected?: Pick<ManagedArticle, 'id' | 'revision'>) {
    const values = validateArticle(input);
    const body = expected ? { article: values, expectedRevision: expected.revision } : values;
    return requestAdminJson<{ article: ManagedArticle }>(expected ? `${ARTICLES_ADMIN_API}/${expected.id}` : ARTICLES_ADMIN_API, {
        method: expected ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }, 'Článek se nepodařilo uložit.');
}

type EditorProps = {
    readonly article: ManagedArticle | null;
    readonly mediaConfigured: boolean;
    readonly onSaved: (article: ManagedArticle) => void;
    readonly onBusy: (busy: boolean) => void;
};

export function ManagedArticleEditor({ article, mediaConfigured, onSaved, onBusy }: EditorProps) {
    const [content, setContent] = useState<Content>(() => getContent(article));
    const [publication, setPublication] = useState<Publication>(() => getPublication(article));
    const [operation, setOperation] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [hasConflict, setHasConflict] = useState(false);
    const savedArticle = useRef(article);
    const operationInProgress = useRef(false);
    const publicationDraft = useAdminDraftProtection(publication, article !== null);
    const isBusy = Boolean(operation);
    const hasPublicPlacement = publication.placements.some((placement) => placement.visibility === 'public');

    function acceptSavedArticle(updatedArticle: ManagedArticle) {
        savedArticle.current = updatedArticle;
        setHasConflict(false);
        onSaved(updatedArticle);
    }
    const autosave = useAdminAutosave({ value: content, isEnabled: article !== null, onSave: async () => {
        const saved = savedArticle.current;
        if (!saved) return false;
        try {
            const result = await saveArticle({ ...content, ...getPublication(saved) }, saved);
            acceptSavedArticle(result.article);
            return true;
        } catch (failure) {
            if (failure instanceof JsonRequestError && failure.status === 409) setHasConflict(true);
            throw failure;
        }
    } });

    async function run(label: string, action: () => Promise<void>): Promise<boolean> {
        if (operationInProgress.current) return false;
        operationInProgress.current = true;
        setOperation(label);
        setError('');
        setNotice('');
        onBusy(true);
        try {
            await action();
            return true;
        } catch (failure) {
            if (failure instanceof JsonRequestError && failure.status === 409) setHasConflict(true);
            setError(failure instanceof Error ? failure.message : 'Požadavek se nepodařilo dokončit.');
            return false;
        } finally {
            operationInProgress.current = false;
            setOperation('');
            onBusy(false);
        }
    }

    function reloadArticle() {
        if (!article || !window.confirm('Načíst aktuální článek a zahodit rozepsané změny?')) return;
        void run('Načítám aktuální článek…', async () => {
            const result = await requestAdminJson<{ article: ManagedArticle }>(`${ARTICLES_ADMIN_API}/${article.id}`, undefined, 'Článek se nepodařilo načíst.');
            const updatedContent = getContent(result.article);
            const updatedPublication = getPublication(result.article);
            autosave.discard();
            autosave.acceptSavedValue(updatedContent);
            publicationDraft.acceptDraftValue(updatedPublication);
            setContent(updatedContent);
            setPublication(updatedPublication);
            acceptSavedArticle(result.article);
        });
    }

    function submitContent(event: FormEvent) {
        event.preventDefault();
        if (article) { void autosave.flush(); return; }
        void run('Vytvářím koncept…', async () => {
            const result = await saveArticle({ ...content, ...NO_PUBLICATION });
            autosave.acceptDraftValue(content);
            acceptSavedArticle(result.article);
        });
    }

    function setPlacement(destination: ManagedArticleDestination, visibility: ManagedArticlePlacement['visibility'] | undefined) {
        setPublication((current) => {
            const placements = ARTICLE_DESTINATIONS.flatMap((candidate) => {
                if (candidate !== destination) return current.placements.filter((placement) => placement.destination === candidate);
                return visibility ? [{ destination, visibility }] : [];
            });
            const publicPlacements = placements.filter((placement) => placement.visibility === 'public');
            const canonicalPlacements = publicPlacements.length ? publicPlacements : placements;
            const canonicalDestination = canonicalPlacements.find((placement) => placement.destination === current.canonicalDestination)?.destination
                ?? canonicalPlacements[0]?.destination ?? null;
            return { placements, canonicalDestination };
        });
    }

    function submitPublication(event: FormEvent) {
        event.preventDefault();
        if (!article) return;
        void run('Ukládám umístění…', async () => {
            if (!(await autosave.flush())) throw new Error('Nejprve dokončete uložení obsahu článku.');
            const latest = savedArticle.current;
            if (!latest) return;
            const result = await saveArticle({ ...getContent(latest), ...publication }, latest);
            const storedPublication = getPublication(result.article);
            publicationDraft.acceptDraftValue(storedPublication);
            setPublication(storedPublication);
            acceptSavedArticle(result.article);
            setNotice(storedPublication.placements.length ? 'Umístění článku jsou uložená.' : 'Článek je opět koncept.');
        });
    }

    return <div className="space-y-6">
        <form ref={autosave.formRef} onSubmit={submitContent} className="space-y-4">
            <fieldset disabled={isBusy} className="space-y-4">
                <legend className="sr-only">Obsah článku</legend>
                <label className="block text-sm font-medium">Název
                    <Input className="mt-1" value={content.title} required maxLength={200} onChange={(event) => {
                        const title = event.target.value;
                        setContent((current) => ({ ...current, title, slug: !article && current.slug === suggestedSlug(current.title) ? suggestedSlug(title) : current.slug }));
                    }} />
                </label>
                <div className="grid gap-4 sm:grid-cols-3">
                    <label className="block text-sm font-medium">Adresa URL
                        <Input className="mt-1" value={content.slug} required maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={(event) => setContent((current) => ({ ...current, slug: event.target.value }))} />
                    </label>
                    <label className="block text-sm font-medium">Jazyk
                        <select className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={content.language} onChange={(event) => {
                            const language = event.target.value === 'en' ? 'en' : 'cs';
                            setContent((current) => ({ ...current, language }));
                        }}><option value="cs">Čeština</option><option value="en">Angličtina</option></select>
                    </label>
                    <label className="block text-sm font-medium">Autor
                        <select className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={content.authorId} onChange={(event) => setContent((current) => ({ ...current, authorId: event.target.value }))}>
                            {ARTICLE_AUTHORS.map(({ id, name }) => <option value={id} key={id}>{name}</option>)}
                        </select>
                    </label>
                </div>
                <label className="block text-sm font-medium">Perex
                    <Textarea className="mt-1" rows={3} maxLength={1000} value={content.perex} onChange={(event) => setContent((current) => ({ ...current, perex: event.target.value }))} />
                </label>
                <label className="block text-sm font-medium">Text článku (Markdown)
                    <Textarea className="mt-1 min-h-64 font-mono" rows={14} maxLength={250_000} value={content.markdown} onChange={(event) => setContent((current) => ({ ...current, markdown: event.target.value }))} />
                </label>
            </fieldset>
            {article ? <AdminAutosaveStatus {...autosave} /> : <Button type="submit" disabled={isBusy}>Vytvořit koncept</Button>}
        </form>
        {article && <form className="space-y-4 border-t border-slate-200 pt-5" onSubmit={submitPublication}>
            <fieldset className="space-y-2" disabled={isBusy}>
                <legend className="mb-2 text-base font-semibold text-slate-950">Umístění a přístup</legend>
                {hasPublicPlacement && <p className="text-sm text-slate-600">
                    Veřejné umístění zpřístupní celý článek i jeho audio a PDF všem. Omezení v komunitě platí jen pro její odkaz.
                </p>}
                {ARTICLE_DESTINATIONS.map((destination) => {
                    const placement = publication.placements.find((candidate) => candidate.destination === destination);
                    const label = ARTICLE_DESTINATION_LABELS[destination];
                    return <div key={destination} className="grid items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 sm:grid-cols-[1fr_11rem_9rem]">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input type="checkbox" className="accent-cyan-600" checked={Boolean(placement)} onChange={(event) => setPlacement(destination, event.target.checked ? 'public' : undefined)} />{label}
                        </label>
                        {placement && <>
                            {isArticleCommunity(destination) ? <select aria-label={`Přístup · ${label}`} className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={placement.visibility} onChange={(event) => {
                                const visibility = event.target.value;
                                if (visibility === 'public' || visibility === 'members' || visibility === 'paid') setPlacement(destination, visibility);
                            }}>
                                <option value="public">Veřejné</option>
                                <option value="members">Pro členy</option>
                                {COMMUNITIES[destination].hasPaidMembership && <option value="paid">Pro platící členy</option>}
                            </select> : <span className="text-sm text-slate-600">Veřejné</span>}
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="article-canonical"
                                    aria-label={`Hlavní umístění · ${label}`}
                                    checked={publication.canonicalDestination === destination}
                                    disabled={hasPublicPlacement && placement.visibility !== 'public'}
                                    className="accent-cyan-600"
                                    onChange={() => setPublication((current) => ({ ...current, canonicalDestination: destination }))}
                                />
                                Hlavní odkaz
                            </label>
                        </>}
                    </div>;
                })}
            </fieldset>
            <Button type="submit" variant="outline" disabled={isBusy || !publicationDraft.isDraftDirty}>
                {!publication.placements.length ? 'Stáhnout ze všech míst' : article.placements.length ? 'Uložit umístění' : 'Publikovat článek'}
            </Button>
            {article.canonicalDestination && <a className="ml-3 text-sm text-cyan-700 underline" href={getManagedArticleUrl(article, article.canonicalDestination)} target="_blank" rel="noreferrer">Otevřít hlavní odkaz</a>}
        </form>}
        {article && <ManagedArticleAssetsEditor article={article} isConfigured={mediaConfigured} isBusy={isBusy} onRun={run} onSaved={acceptSavedArticle} flushContent={autosave.flush} getCurrentArticle={() => savedArticle.current} />}
        {operation && <p role="status" className="text-sm text-slate-600">{operation}</p>}
        {notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {hasConflict && <Button type="button" variant="outline" disabled={isBusy || autosave.isSaving} onClick={reloadArticle}>Načíst aktuální stav</Button>}
    </div>;
}
