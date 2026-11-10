import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TERMINAL_TOUR_PATH } from '@/businesses/terminal-tour/terminalTour';
import type { ArticleLanguage } from '@/lib/articles/types';
import { renderArticleDocument } from './articleDocument';
import { ArticleFooter, ArticleHeader } from './ArticleShell';
import { ArticleMedia } from './ArticleMedia';
import { CommunityArticleUnlockForm } from './CommunityArticleUnlockForm';
import './articles.css';

export function CommunityArticleTeaser({ title, perex, openingMarkdown, language, indexPath, roomSlug, showTerminalGuide }: {
    readonly title: string;
    readonly perex: string;
    readonly openingMarkdown: string;
    readonly language: ArticleLanguage;
    readonly indexPath: string;
    readonly roomSlug: string;
    readonly showTerminalGuide: boolean;
}) {
    const cs = language === 'cs';
    const opening = renderArticleDocument(openingMarkdown, title, perex, undefined, { mediaLanguage: language }).html;
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
                    {opening && <ArticleMedia language={language}><div className="article-prose" dangerouslySetInnerHTML={{ __html: opening }} /></ArticleMedia>}
                    {showTerminalGuide && (
                        <p className="article-terminal-guide">
                            S Promptbookem začínáte? <Link href={TERMINAL_TOUR_PATH}>Podívejte se na instalaci a založení projektu v terminálu.</Link>
                        </p>
                    )}
                    <CommunityArticleUnlockForm language={language} roomSlug={roomSlug} />
                </div>
            </main>
            <ArticleFooter language={language} publication="promptbook" indexPath={indexPath} />
        </div>
    );
}
