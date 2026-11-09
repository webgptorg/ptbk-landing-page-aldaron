import Link from 'next/link';
import { ArrowUpRight, Headphones } from 'lucide-react';
import type { ArticleCommunity } from '@/lib/articles/managedArticleInput';
import { getManagedArticleUrl } from '@/lib/articles/managedArticleUrls';
import { getPublishedCommunityArticles } from '@/lib/articles/publishedArticles';

export async function CommunityArticleList({ communityId, publicOnly }: { readonly communityId: ArticleCommunity; readonly publicOnly?: boolean }) {
    const articles = await getPublishedCommunityArticles(communityId, publicOnly);
    return (
        <section id="clanky" aria-labelledby="community-articles-heading" className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
            <h2 id="community-articles-heading" className="mb-5 text-2xl font-bold tracking-tight">Články</h2>
            {articles.length === 0
                ? <p className="text-sm text-room-muted">Nové články se objeví tady.</p>
                : <ul className="grid gap-3 sm:grid-cols-2">
                    {articles.map((article) => (
                        <li key={article.id} className="rounded-xl border border-room-border/10 bg-room-overlay/[0.035] p-4 text-room-heading">
                            <article>
                                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-room-muted">
                                    <span>{article.author.name}</span>
                                    {article.language === 'en' && <span lang="en">EN</span>}
                                    {article.audio && <Headphones size={15} aria-label="S audio verzí" />}
                                </div>
                                <h3 className="text-base font-semibold">
                                    <Link className="inline-flex items-baseline gap-1 hover:underline" href={new URL(getManagedArticleUrl(article, communityId)).pathname}>
                                        {article.title}<ArrowUpRight size={14} aria-hidden="true" className="shrink-0" />
                                    </Link>
                                </h3>
                                <p className="mt-1 text-sm text-room-muted">{article.perex}</p>
                            </article>
                        </li>
                    ))}
                </ul>}
        </section>
    );
}
