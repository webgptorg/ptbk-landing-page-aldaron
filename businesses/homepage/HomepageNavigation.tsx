'use client';

import Image from 'next/image';
import { useRef } from 'react';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { HomepageContent } from './homepageContent';
import { HomepageEnquiryLink } from './HomepageEnquiry';

export function HomepageNavigation({
    language,
    content,
}: {
    readonly language: SupportedHomepageLanguage;
    readonly content: HomepageContent;
}) {
    const menuReference = useRef<HTMLDetailsElement>(null);
    const alternateLanguage = language === 'cs' ? 'en' : 'cs';
    const links = [
        { href: '#agendas', label: content.navigation.examples },
        { href: '#control', label: content.navigation.control },
    ];
    return (
        <header className="hp-navigation">
            <a className="hp-skip" href="#homepage-main">
                {content.navigation.skip}
            </a>
            <div className="hp-navigation-inner">
                <a href={`/${language}`} className="hp-brand" aria-label="Promptbook">
                    <Image src="/logo/promptbook-logo-blue-transparent-128.png" alt="" width={32} height={32} />
                    <span>
                        Prompt<b>book</b>
                    </span>
                </a>
                <nav className="hp-desktop-nav" aria-label={content.navigation.label}>
                    {links.map((link) => (
                        <a key={link.href} href={link.href}>
                            {link.label}
                        </a>
                    ))}
                </nav>
                <a
                    href={`/${alternateLanguage}`}
                    hrefLang={alternateLanguage}
                    lang={alternateLanguage}
                    className="hp-language"
                    aria-label={alternateLanguage === 'cs' ? 'Česky' : 'English'}
                >
                    <span aria-hidden="true">{language.toUpperCase()} / </span>
                    {alternateLanguage.toUpperCase()}
                </a>
                <HomepageEnquiryLink className="hp-button hp-nav-cta">{content.cta}</HomepageEnquiryLink>
                <details className="hp-mobile-nav" ref={menuReference}>
                    <summary aria-label={content.navigation.label}>
                        <span />
                        <span />
                    </summary>
                    <nav aria-label={content.navigation.label}>
                        {[...links, { href: '#contact', label: content.navigation.contact }].map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => {
                                    if (menuReference.current) menuReference.current.open = false;
                                }}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </details>
            </div>
        </header>
    );
}
