import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { ArticleLanguage, ArticlePublication } from '@/lib/articles/types';
import { getArticleIndexUrl } from '@/lib/articles/urls';
import { LegalFooterLinks } from '@/components/legal/LegalFooterLinks';

export function ArticleHeader({ language, publication, translations = [] }: {
    readonly language: ArticleLanguage;
    readonly publication: ArticlePublication;
    readonly translations?: readonly { readonly language: ArticleLanguage; readonly url: string; readonly title: string }[];
}) {
    const personal = publication === 'personal';
    const homePath = personal ? '/' : `/${language}`;
    const indexPath = new URL(getArticleIndexUrl(language, publication)).pathname;
    return (
        <header className="article-site-header">
            <a className="article-skip-link" href="#article-main">{language === 'cs' ? 'Přejít k obsahu' : 'Skip to content'}</a>
            <div className="article-container article-header-inner">
                <Link href={homePath} className="article-brand">
                    <Image src={personal ? '/logo/pavol-hejny-ph.svg' : '/logo/promptbook-logo-blue-transparent-128.png'} width={34} height={34} alt="" />
                    <span>{personal ? 'Pavol Hejný' : 'Promptbook'}</span>
                </Link>
                <nav aria-label={language === 'cs' ? 'Navigace článků' : 'Article navigation'}>
                    <Link href={indexPath} className="article-header-index">{language === 'cs' ? 'Články' : 'Articles'}</Link>
                    {translations.map((translation) => <a key={translation.language} href={translation.url} hrefLang={translation.language} lang={translation.language} title={translation.title} className="article-language-link">{translation.language.toUpperCase()}</a>)}
                    <Link href={homePath} className="article-header-home"><span>{language === 'cs' ? 'Na web' : 'Home'}</span><ArrowUpRight size={15} aria-hidden="true" /></Link>
                </nav>
            </div>
        </header>
    );
}

export function ArticleFooter({ language, publication }: { readonly language: ArticleLanguage; readonly publication: ArticlePublication }) {
    const cs = language === 'cs';
    return (
        <footer className="article-footer article-container">
            <Link className="article-text-link" href={new URL(getArticleIndexUrl(language, publication)).pathname}><ArrowLeft size={16} aria-hidden="true" />{cs ? 'Všechny články' : 'All articles'}</Link>
            <div><span>{publication === 'personal' ? 'Pavol Hejný' : 'Promptbook'}</span><LegalFooterLinks language={language} /></div>
        </footer>
    );
}
