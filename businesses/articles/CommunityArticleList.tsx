import { PROMPTBOOK_COMMUNITY_PODCAST } from '@/businesses/community/communityPodcast';
import Link from 'next/link';
import { ArrowUpRight, Headphones } from 'lucide-react';
import type { ArticleCommunity } from '@/lib/articles/managedArticleInput';
import { getManagedArticleUrl } from '@/lib/articles/managedArticleUrls';
import { getCommunityArticleCards } from '@/lib/articles/publishedArticles';
import { ArticleRssLink } from './ArticleRssLink';

export async function CommunityArticleList({ communityId, waitingRoom }: { readonly communityId: ArticleCommunity; readonly waitingRoom?: boolean }) {
    const articles = await getCommunityArticleCards(communityId, waitingRoom);
    return (
        <section id="clanky" aria-labelledby="community-articles-heading" className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 id="community-articles-heading" className="text-2xl font-bold tracking-tight">Články</h2>
                {communityId === 'promptbook' && <ArticleRssLink
                    url={PROMPTBOOK_COMMUNITY_PODCAST.feedUrl}
                    language="cs"
                    title={PROMPTBOOK_COMMUNITY_PODCAST.title}
                    className="rounded-lg border border-room-border/15 px-3 py-2 text-sm font-medium text-room-heading hover:bg-room-overlay/5"
                />}
            </div>
            {articles.length === 0
                ? <p className="text-sm text-room-muted">Nové články se objeví tady.</p>
                : <ul className="grid gap-3 sm:grid-cols-2">
                    {articles.map((article) => (
                        <li key={article.id} className="rounded-xl border border-room-border/10 bg-room-overlay/[0.035] p-4 text-room-heading">
                            <article>
                                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-room-muted">
                                    <span>{article.authorName}</span>
                                    {article.language === 'en' && <span lang="en">EN</span>}
                                    {article.hasAudio && <Headphones size={15} aria-label="S audio verzí" />}
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
