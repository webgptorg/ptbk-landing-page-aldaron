'use client';

import { motion, useScroll } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { WHITEPAPER_PATHS, WHITEPAPER_SECTIONS } from './whitepaperConfig';
import type { WhitepaperContent } from './whitepaperContent';

export function WhitepaperNavigation({
    language,
    content,
}: {
    readonly language: SupportedHomepageLanguage;
    readonly content: WhitepaperContent['navigation'];
}) {
    const { scrollYProgress } = useScroll();
    const menuReference = useRef<HTMLDetailsElement>(null);
    const alternateLanguage = language === 'cs' ? 'en' : 'cs';

    return (
        <header className="wp-navigation">
            <a href="#whitepaper-main" className="wp-skip-link">
                {content.skip}
            </a>
            <div className="wp-navigation-inner">
                <Link href={`/${language}`} className="wp-brand" aria-label="Promptbook">
                    <Image src="/logo/promptbook-logo-blue-transparent-128.png" alt="" width={30} height={30} />
                    <span>
                        Prompt<b>book</b>
                        <span className="wp-brand-divider"> / </span>
                        <span className="wp-brand-page">Whitepaper</span>
                    </span>
                </Link>
                <nav aria-label={content.label} className="wp-desktop-navigation">
                    {['framework', 'cycle', 'read'].map((section) => (
                        <a key={section} href={`#${section}`}>
                            {content[section as keyof typeof content]}
                        </a>
                    ))}
                </nav>
                <div className="wp-navigation-actions">
                    <Link
                        href={WHITEPAPER_PATHS[alternateLanguage]}
                        hrefLang={alternateLanguage}
                        lang={alternateLanguage}
                        className="wp-language-link"
                        aria-label={alternateLanguage === 'cs' ? 'Česky' : 'English'}
                        onClick={(event) => {
                            // Keep a chapter or section when switching language, without copying query-string identity.
                            if (window.location.hash) {
                                event.preventDefault();
                                window.location.assign(`${WHITEPAPER_PATHS[alternateLanguage]}${window.location.hash}`);
                            }
                        }}
                    >
                        <span aria-hidden="true">
                            {language.toUpperCase()} <span className="wp-language-separator">/</span>{' '}
                        </span>
                        {alternateLanguage.toUpperCase()}
                    </Link>
                    <details className="wp-mobile-navigation" ref={menuReference}>
                        <summary aria-label={content.label}>
                            <span />
                            <span />
                        </summary>
                        <nav aria-label={content.label}>
                            {WHITEPAPER_SECTIONS.map((section) => (
                                <a
                                    key={section}
                                    href={`#${section}`}
                                    onClick={() => {
                                        if (menuReference.current) menuReference.current.open = false;
                                    }}
                                >
                                    {content[section]}
                                </a>
                            ))}
                        </nav>
                    </details>
                </div>
            </div>
            <motion.div className="wp-reading-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
        </header>
    );
}
