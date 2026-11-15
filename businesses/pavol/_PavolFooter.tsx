'use client';

import { ArticleRssLink } from '@/businesses/articles/ArticleRssLink';
import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import { usePublicNavigationUrl } from '@/components/public-site-navigation-provider';
import { getArticlePodcastUrl } from '@/lib/articles/urls';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { COOKIE_SETTINGS_HASH } from '@/lib/legal/cookieSettingsHash';
import { getLegalHubPath, getLegalPagePath } from '@/lib/legal/legalPagePaths';
import Image from 'next/image';
import Link from 'next/link';

export function PavolFooter({ language, isHomepage = true }: { language: SupportedHomepageLanguage; readonly isHomepage?: boolean }) {
    const CONTENT = PAVOL_PAGE_CONTENT[language];
    const homeHref = isHomepage ? '#main-content' : '/';
    const privacyHref = usePublicNavigationUrl(getLegalPagePath('privacyPolicy', language));
    const legalHref = usePublicNavigationUrl(getLegalHubPath(language));

    return (
        <footer className="border-t border-[var(--pavol-border)] bg-[var(--pavol-ink)] text-white">
            <div className={`${PAVOL_CONTAINER_CLASS_NAME} py-8 sm:py-10`}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <Link href={homeHref} className="inline-flex w-fit items-center gap-2.5 rounded-md font-[family-name:var(--font-outfit)] text-lg font-medium">
                        <Image src="/logo/pavol-hejny-ph.svg" alt="" width={28} height={28} className="h-7 w-7 invert" />
                        Pavol Hejný
                    </Link>
                    <nav aria-label={CONTENT.footer.connectTitle}>
                        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
                            {CONTENT.contact.links.map((link) => (
                                <li key={link.href}>
                                    <a href={link.href} className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm text-slate-200 transition-colors hover:text-white">
                                        {link.icon && <link.icon aria-hidden="true" className="h-3.5 w-3.5" />}
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <ArticleRssLink
                                    language={language}
                                    url={getArticlePodcastUrl(language, 'personal')}
                                    label="Podcast"
                                    className="inline-flex min-h-11 items-center text-sm text-slate-200 hover:text-white"
                                />
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                    <p>© Pavol Hejný. {CONTENT.footer.rightsReservedText}</p>
                    <nav aria-label={language === 'cs' ? 'Právní informace' : 'Legal information'}>
                        <ul className="flex flex-wrap gap-x-5 gap-y-2">
                            <li><Link href={privacyHref} className="hover:text-white">{language === 'cs' ? 'Ochrana osobních údajů' : 'Privacy policy'}</Link></li>
                            <li><Link href={legalHref} className="hover:text-white">{language === 'cs' ? 'Právní dokumenty' : 'Legal documents'}</Link></li>
                            <li><a href={COOKIE_SETTINGS_HASH} className="hover:text-white" onClick={() => {
                                if (window.location.hash === COOKIE_SETTINGS_HASH) window.dispatchEvent(new Event('hashchange'));
                            }}>Cookies</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
