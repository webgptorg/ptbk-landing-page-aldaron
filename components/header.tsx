'use client';

import { getHomepageContent, type HomepageLanguage } from '@/businesses/homepage/homepageContent';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
const promptbookLogo = '/logo/promptbook-logo-blue-transparent-128.png'; // <- TODO: import promptbookLogo from '@/public/logo/promptbook-logo-blue-transparent-128.png';

type HeaderAction = {
    label: ReactNode;
    href?: string;
    mobileLabel?: ReactNode;
};

type HeaderNavItem = {
    label: ReactNode;
    href: string;
};

type HeaderBrandContext = {
    label: ReactNode;
    href: string;
};

type HeaderLanguageSwitchItem = {
    href: string;
    label: string;
    iconSrc: string;
    isActive?: boolean;
};

type HeaderLanguageSwitcher = {
    ariaLabel?: string;
    items: HeaderLanguageSwitchItem[];
};

/**
 * Look of the primary call to action, shared by both its link and its popup-opening variant
 */
const PRIMARY_ACTION_BUTTON_CLASS_NAME =
    'bg-promptbook-blue-dark text-white hover:bg-promptbook-blue-dark/90 hover:shadow-lg transition-all duration-300 shrink-0 text-[13px] sm:text-sm px-3 sm:px-4';

interface HeaderProps {
    language?: HomepageLanguage;
    isBare?: boolean;
    tryItYourselfText?: ReactNode;
    whyPromptbookText?: ReactNode;
    integrationsText?: ReactNode;
    pricingText?: ReactNode;
    getStartedText?: ReactNode;
    brandLogo?: ReactNode;
    brandName?: ReactNode;
    brandHref?: string;
    brandContext?: HeaderBrandContext;
    centerContent?: ReactNode;
    hideCenterContent?: boolean;
    navItems?: HeaderNavItem[];
    languageSwitcher?: HeaderLanguageSwitcher;
    primaryAction?: HeaderAction;
    isPrimaryActionShown?: boolean;
    secondaryAction?: HeaderAction;
    containerClassName?: string;
}

export function Header({
    language,
    isBare = false,
    getStartedText,
    brandLogo,
    brandName,
    brandHref,
    brandContext,
    centerContent,
    hideCenterContent = false,
    navItems,
    languageSwitcher,
    primaryAction,
    isPrimaryActionShown = true,
    secondaryAction,
    containerClassName,
}: HeaderProps = {}) {
    const resolvedLanguage = language ?? 'cs';
    const { header } = getHomepageContent(resolvedLanguage);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCTAClick = () => {
        // Dispatch custom event to open qualification popup
        window.dispatchEvent(new CustomEvent('open-qualification-popup'));
    };

    const hasNavItems = !isBare && !!navItems?.length;
    const resolvedBrandHref = brandHref ?? (language ? `/${language}` : '/');

    const resolvedPrimaryAction = primaryAction ?? {
        label: getStartedText ?? header.ctaDesktop,
        mobileLabel: header.ctaMobile,
    };

    const renderedCenterContent = centerContent ?? (
        <>
            <span>🔥</span>
            <span>
                {header.fomoBefore} <strong className="text-gray-900">{header.fomoStrong}</strong> {header.fomoAfter}
            </span>
        </>
    );

    const primaryButtonContent = (
        <>
            {resolvedPrimaryAction.mobileLabel ? (
                <>
                    <span className="sm:hidden">{resolvedPrimaryAction.mobileLabel}</span>
                    <span className="hidden sm:inline">{resolvedPrimaryAction.label}</span>
                </>
            ) : (
                <span>{resolvedPrimaryAction.label}</span>
            )}
            <ArrowRight className="ml-1.5 w-4 h-4" />
        </>
    );

    const primaryButton = resolvedPrimaryAction.href ? (
        <Button asChild className={PRIMARY_ACTION_BUTTON_CLASS_NAME} id="header-cta">
            <Link href={resolvedPrimaryAction.href}>{primaryButtonContent}</Link>
        </Button>
    ) : (
        <Button onClick={handleCTAClick} className={PRIMARY_ACTION_BUTTON_CLASS_NAME} id="header-cta">
            {primaryButtonContent}
        </Button>
    );

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
                    : 'bg-white/80 backdrop-blur-md border-b border-gray-100'
            }`}
        >
            <div className={cn('container mx-auto px-4', containerClassName)}>
                <div className="flex items-center justify-between h-14 gap-4">
                    {/* Brand trail: the optional context is used by product-area pages such as the community. */}
                    <div className="flex min-w-0 shrink-0 items-center gap-2" aria-label="Navigace značky">
                        <Link
                            href={resolvedBrandHref}
                            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
                        >
                            {brandLogo ?? (
                                <Image
                                    src={promptbookLogo}
                                    alt="Promptbook"
                                    width={32}
                                    height={32}
                                    className={cn('h-8 w-8', brandContext && 'hidden sm:block')}
                                />
                            )}
                            {brandName ?? (
                                <span className="text-lg text-gray-900 sm:text-xl">
                                    Prompt<b>book</b>
                                </span>
                            )}
                        </Link>
                        {brandContext && (
                            <>
                                <span aria-hidden="true" className="text-sm text-slate-400 sm:text-base">
                                    &gt;
                                </span>
                                <Link
                                    href={brandContext.href}
                                    className="truncate text-sm font-semibold text-slate-700 transition-colors hover:text-cyan-700 sm:text-base"
                                >
                                    {brandContext.label}
                                </Link>
                            </>
                        )}
                    </div>

                    {hasNavItems ? (
                        <nav className="hidden lg:flex items-center gap-1 text-sm text-slate-600">
                            {navItems!.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="rounded-full px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-950"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    ) : (
                        !isBare &&
                        !hideCenterContent && (
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                                {renderedCenterContent}
                            </div>
                        )
                    )}

                    {/* CTA Button */}
                    {/* Note: The slot stays even when empty, so that the center content keeps its place */}
                    {!isBare && (
                        <div className="flex items-center gap-2">
                            {languageSwitcher && (
                                <div
                                    className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1"
                                    aria-label={languageSwitcher.ariaLabel}
                                >
                                    {languageSwitcher.items.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            aria-label={item.label}
                                            className={cn(
                                                'flex h-8 w-8 items-center justify-center rounded-full transition-all',
                                                item.isActive ? 'bg-slate-950 shadow-sm' : 'hover:bg-slate-100',
                                            )}
                                        >
                                            <Image
                                                src={item.iconSrc}
                                                alt=""
                                                aria-hidden="true"
                                                width={20}
                                                height={15}
                                                className="h-[15px] w-5 rounded-sm object-cover"
                                            />
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {secondaryAction && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="hidden shrink-0 border-slate-200 bg-white/70 text-[13px] text-slate-700 hover:bg-white sm:inline-flex"
                                >
                                    <Link href={secondaryAction.href ?? '#'}>{secondaryAction.label}</Link>
                                </Button>
                            )}

                            {isPrimaryActionShown && primaryButton}
                        </div>
                    )}
                </div>

                {hasNavItems && (
                    <nav className="flex gap-2 overflow-x-auto pb-3 pt-1 lg:hidden" aria-label="Section navigation">
                        {navItems!.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-950"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                )}
            </div>
        </header>
    );
}
