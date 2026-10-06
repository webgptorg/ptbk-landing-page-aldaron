'use client';

import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import { Button } from '@/components/ui/button';
import {
    PAVOL_CZECH_INTERNAL_PATH,
    PAVOL_ENGLISH_INTERNAL_PATH,
    createPublicUrl,
} from '@/lib/domains/publicDomainRouting';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { ArrowRight, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

const LANGUAGE_LINKS = [
    { language: 'cs', label: 'Čeština', shortLabel: 'CS', href: createPublicUrl(PAVOL_CZECH_INTERNAL_PATH) },
    { language: 'en', label: 'English', shortLabel: 'EN', href: createPublicUrl(PAVOL_ENGLISH_INTERNAL_PATH) },
] as const;

export function PavolHeader({ language }: { readonly language: SupportedHomepageLanguage }) {
    const CONTENT = PAVOL_PAGE_CONTENT[language].header;
    const MENU_REF = useRef<HTMLDetailsElement>(null);

    function closeMenu() {
        if (MENU_REF.current) MENU_REF.current.open = false;
    }

    return (
        <header className="pavol-header fixed inset-x-0 top-0 z-50 border-b border-[var(--pavol-border)] backdrop-blur-md">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:p-4 focus:text-[var(--pavol-ink)]"
            >
                {CONTENT.skipLinkLabel}
            </a>
            <div className={`${PAVOL_CONTAINER_CLASS_NAME} flex h-20 items-center justify-between gap-3`}>
                <Link
                    href={createPublicUrl(language === 'cs' ? PAVOL_CZECH_INTERNAL_PATH : PAVOL_ENGLISH_INTERNAL_PATH)}
                    className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-md font-[family-name:var(--font-outfit)] text-base font-medium tracking-tight sm:text-xl"
                >
                    <Image src="/logo/pavol-hejny-ph.svg" alt="" width={32} height={32} className="h-8 w-8" />
                    <span>Pavol Hejný</span>
                </Link>
                <nav aria-label={CONTENT.navigationLabel} className="hidden items-center gap-1 xl:flex">
                    {CONTENT.navItems.map((ITEM) => (
                        <a
                            key={ITEM.href}
                            href={ITEM.href}
                            className="rounded-full px-2.5 py-3 text-xs font-medium text-[var(--pavol-muted)] transition-colors hover:bg-[var(--pavol-warm)] hover:text-[var(--pavol-ink)]"
                        >
                            {ITEM.label}
                        </a>
                    ))}
                </nav>
                <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                    <nav
                        aria-label={CONTENT.languageSwitcherLabel}
                        className="flex items-center gap-0.5 text-xs font-semibold"
                    >
                        {LANGUAGE_LINKS.map((ITEM) => (
                            <a
                                key={ITEM.language}
                                href={ITEM.href}
                                hrefLang={ITEM.language}
                                lang={ITEM.language}
                                aria-label={ITEM.label}
                                aria-current={ITEM.language === language ? 'page' : undefined}
                                className={`flex h-11 w-9 items-center justify-center rounded-full ${ITEM.language === language ? 'bg-[var(--pavol-warm)] text-[var(--pavol-ink)]' : 'text-[var(--pavol-muted)] hover:text-[var(--pavol-accent)]'}`}
                            >
                                {ITEM.shortLabel}
                            </a>
                        ))}
                    </nav>
                    <Button
                        asChild
                        className="pavol-primary-button hidden h-11 rounded-full px-5 sm:inline-flex"
                    >
                        <a href="#contact">
                            {CONTENT.primaryAction}
                            <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                    <details
                        ref={MENU_REF}
                        className="pavol-mobile-menu xl:hidden"
                        onKeyDown={(event) => {
                            if (event.key !== 'Escape') return;
                            closeMenu();
                            MENU_REF.current?.querySelector('summary')?.focus();
                        }}
                        onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
                        }}
                    >
                        <summary
                            aria-label={CONTENT.menuLabel}
                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--pavol-border)]"
                        >
                            <Menu aria-hidden="true" className="h-5 w-5" />
                        </summary>
                        <nav
                            aria-label={CONTENT.navigationLabel}
                            className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-[var(--pavol-border)] bg-[var(--pavol-paper)] p-5 shadow-lg"
                        >
                            <div className="mx-auto grid max-w-2xl gap-1">
                                {CONTENT.navItems.map((ITEM) => (
                                    <a
                                        key={ITEM.href}
                                        href={ITEM.href}
                                        onClick={closeMenu}
                                        className="flex items-center justify-between rounded-xl px-4 py-3 text-base hover:bg-[var(--pavol-warm)]"
                                    >
                                        {ITEM.label}
                                        <ArrowRight aria-hidden="true" className="h-4 w-4 text-[var(--pavol-accent)]" />
                                    </a>
                                ))}
                            </div>
                        </nav>
                    </details>
                </div>
            </div>
        </header>
    );
}
