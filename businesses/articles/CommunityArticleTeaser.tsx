import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ArticleLanguage } from '@/lib/articles/types';
import { renderArticleDocument } from './articleDocument';
import { ArticleFooter, ArticleHeader } from './ArticleShell';
import { CommunityArticleUnlockForm } from './CommunityArticleUnlockForm';
import './articles.css';

export function CommunityArticleTeaser({ title, perex, openingMarkdown, language, indexPath, roomSlug }: {
    readonly title: string;
    readonly perex: string;
    readonly openingMarkdown: string;
    readonly language: ArticleLanguage;
    readonly indexPath: string;
    readonly roomSlug: string;
}) {
    const cs = language === 'cs';
    const opening = renderArticleDocument(openingMarkdown, title, perex).html;
    return (
        <div className="article-site" data-publication="promptbook" lang={language}>
            <ArticleHeader language={language} publication="promptbook" indexPath={indexPath} />
            <main id="article-main" tabIndex={-1}>
                <header className="article-hero article-container">
                    <Link href={indexPath} className="article-back-link">
                        <ArrowLeft size={15} aria-hidden="true" />{cs ? 'Zpět do komunity' : 'Back to the community'}
                    </Link>
                    <h1>{title}</h1>
                    <p className="article-perex">{perex}</p>
                </header>
                <div className="article-container article-teaser-body">
                    {opening && <div className="article-prose" dangerouslySetInnerHTML={{ __html: opening }} />}
                    <CommunityArticleUnlockForm language={language} roomSlug={roomSlug} />
                </div>
            </main>
            <ArticleFooter language={language} publication="promptbook" indexPath={indexPath} />
        </div>
    );
}
