'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminEditorDialog } from '@/components/admin/AdminEditorDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { ARTICLES_ADMIN_API, ARTICLE_DESTINATION_LABELS, type ArticleAdminList, type GitArticlePublication, type GitArticleSummary, type ManagedArticleSummary } from '@/lib/articles/articleAdminTypes';
import { getArticleAuthor } from '@/lib/articles/authors';
import { getManagedArticleUrl } from '@/lib/articles/managedArticleUrls';
import type { ManagedArticle } from '@/lib/articles/managedArticles';
import { createSearchWords, isTextMatchingSearchWords } from '@/lib/search/textSearch';
import { ManagedArticleEditor } from './ManagedArticleEditor';
import { GitArticlePublicationEditor } from './GitArticlePublicationEditor';

export function ArticlesAdmin() {
    const [data, setData] = useState<ArticleAdminList | null>(null);
    const [editor, setEditor] = useState<ManagedArticle | null | undefined>(undefined);
    const [gitEditor, setGitEditor] = useState<GitArticleSummary | null>(null);
    const [query, setQuery] = useState('');
    const [error, setError] = useState('');
    const [isBusy, setIsBusy] = useState(false);

    async function load() {
        setError('');
        try {
            setData(await requestAdminJson<ArticleAdminList>(ARTICLES_ADMIN_API, undefined, 'Články se nepodařilo načíst.'));
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Články se nepodařilo načíst.');
        }
    }
    useEffect(() => { void load(); }, []);

    async function openArticle(id: string) {
        setIsBusy(true);
        setError('');
        try {
            const { article } = await requestAdminJson<{ article: ManagedArticle }>(`${ARTICLES_ADMIN_API}/${id}`, undefined, 'Článek se nepodařilo načíst.');
            setEditor(article);
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Článek se nepodařilo načíst.');
        } finally {
            setIsBusy(false);
        }
    }

    function acceptSavedArticle(article: ManagedArticle) {
        const { id, language, slug, title, authorId, placements, canonicalDestination, publishedAt } = article;
        const summary = { id, language, slug, title, authorId, placements, canonicalDestination, publishedAt };
        setData((current) => current && {
            ...current,
            articles: current.articles.some((item) => item.id === id)
                ? current.articles.map((item) => item.id === id ? summary : item)
                : [summary, ...current.articles],
        });
        setEditor(article);
    }

    function acceptGitPublication(article: GitArticleSummary, publication: GitArticlePublication) {
        const updated = { ...article, publication, canonicalUrl: getManagedArticleUrl(article, publication.canonicalDestination) };
        setData((current) => current && { ...current, gitArticles: current.gitArticles.map((item) => item.id === article.id ? updated : item) });
        setGitEditor(updated);
    }

    async function removeArticle(article: ManagedArticleSummary) {
        if (!window.confirm(`Odstranit článek „${article.title}“ ze všech jeho umístění?`)) return;
        setIsBusy(true);
        setError('');
        try {
            await requestAdminJson(`${ARTICLES_ADMIN_API}/${article.id}`, { method: 'DELETE' }, 'Článek se nepodařilo odstranit.');
            setData((current) => current && { ...current, articles: current.articles.filter((item) => item.id !== article.id) });
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Článek se nepodařilo odstranit.');
        } finally {
            setIsBusy(false);
        }
    }

    const words = createSearchWords(query);
    const articles = data?.articles.filter((article) => isTextMatchingSearchWords(`${article.title} ${article.slug} ${getArticleAuthor(article.authorId)?.name ?? ''}`, words));
    const gitArticles = data?.gitArticles.filter((article) => isTextMatchingSearchWords(`${article.title} ${getArticleAuthor(article.authorId)?.name ?? ''}`, words));

    return <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-950">Přehled článků</h2>
            <Button disabled={!data || isBusy} onClick={() => void runAfterAdminSaves(() => setEditor(null))}>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />Nový článek
            </Button>
        </header>
        <Input aria-label="Hledat články" placeholder="Hledat články…" value={query} onChange={(event) => setQuery(event.target.value)} className="max-w-md" />
        {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}{!data && <> <button type="button" className="underline" onClick={() => void load()}>Zkusit znovu</button></>}</p>}
        {!data && !error && <p role="status">Načítám články…</p>}
        {articles && <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {articles.map((article) => <li key={article.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                    <h3 className="break-words font-semibold text-slate-950">{article.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{getArticleAuthor(article.authorId)?.name} · {article.language.toUpperCase()} · {article.placements.length ? 'Publikováno' : 'Koncept'}</p>
                    {article.placements.length > 0 && <ul aria-label="Umístění" className="mt-2 flex flex-wrap gap-2">
                        {article.placements.map(({ destination, visibility }) => <li key={destination} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                            {ARTICLE_DESTINATION_LABELS[destination]}{visibility === 'members' ? ' · pro členy' : visibility === 'paid' ? ' · placené' : ''}{article.canonicalDestination === destination ? ' · hlavní' : ''}
                        </li>)}
                    </ul>}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={isBusy} onClick={() => void runAfterAdminSaves(() => openArticle(article.id))}>
                        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />Upravit
                    </Button>
                    <Button variant="ghost" size="sm" disabled={isBusy} aria-label={`Odstranit článek ${article.title}`} onClick={() => void removeArticle(article)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
            </li>)}
            {articles.length === 0 && <li className="p-6 text-center text-sm text-slate-500">{query ? 'Hledání nenašlo žádný spravovaný článek.' : 'Zatím tu není žádný spravovaný článek.'}</li>}
        </ul>}
        {gitArticles && gitArticles.length > 0 && <section aria-labelledby="git-articles-title" className="space-y-3">
            <div><h2 id="git-articles-title" className="text-lg font-semibold text-slate-950">Články spravované v Gitu</h2>
                <p className="mt-1 text-sm text-slate-600">Obsah zůstává v Gitu. Publikování v komunitách se nastavuje tady.</p></div>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                {gitArticles.map((article) => <li key={article.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0"><p className="break-words font-medium text-slate-950">{article.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{getArticleAuthor(article.authorId)?.name} · {article.language.toUpperCase()} · {[...article.fixedDestinations, ...article.publication.communities].map((destination) => ARTICLE_DESTINATION_LABELS[destination]).join(', ')}</p></div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" disabled={isBusy} onClick={() => void runAfterAdminSaves(() => setGitEditor(article))}>
                            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />Upravit umístění
                        </Button>
                        <Button asChild variant="ghost" size="sm"><a href={article.canonicalUrl} target="_blank" rel="noreferrer" aria-label={`Otevřít hlavní verzi článku ${article.title}`}>
                            <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />Otevřít
                        </a></Button>
                    </div>
                </li>)}
            </ul>
        </section>}
        <AdminEditorDialog isOpen={editor !== undefined} onClose={() => setEditor(undefined)} canClose={() => !isBusy} title={editor ? 'Upravit článek' : 'Nový článek'} className="max-w-4xl">
            {editor !== undefined && <ManagedArticleEditor key={editor?.id ?? 'new'} article={editor} mediaConfigured={data?.mediaConfigured ?? false} onSaved={acceptSavedArticle} onBusy={setIsBusy} />}
        </AdminEditorDialog>
        <AdminEditorDialog isOpen={gitEditor !== null} onClose={() => setGitEditor(null)} canClose={() => !isBusy} title={gitEditor?.title ?? 'Upravit umístění'}>
            {gitEditor && <GitArticlePublicationEditor key={gitEditor.id} article={gitEditor} onSaved={(publication) => acceptGitPublication(gitEditor, publication)} onBusy={setIsBusy} />}
        </AdminEditorDialog>
    </div>;
}
