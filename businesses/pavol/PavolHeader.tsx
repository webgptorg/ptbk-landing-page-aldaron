'use client';

import { pavolContainerClassName } from '@/businesses/pavol/layout';
import { pavolPageContent } from '@/businesses/pavol/pavolContent';
import { Header } from '@/components/header';
import { PAVOL_CZECH_INTERNAL_PATH, PAVOL_ENGLISH_INTERNAL_PATH, createPublicUrl } from '@/lib/domains/publicDomainRouting';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import Image from 'next/image';

export function PavolHeader({ language }: { readonly language: SupportedHomepageLanguage }) {
    const content = pavolPageContent[language];
    const isCzech = language === 'cs';

    return (
        <Header
            language={language}
            brandHref={`/${language}/pavol`}
            brandLogo={
                <Image
                    src="/logo/pavol-hejny-ph.svg"
                    alt="Pavol Hejný"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                />
            }
            brandName={<span className="text-xl font-semibold text-[var(--pavol-ink)]">Pavol Hejný</span>}
            hideCenterContent
            navItems={content.header.navItems}
            languageSwitcher={{
                ariaLabel: content.header.languageSwitcherLabel,
                items: [
                    {
                        href: createPublicUrl(PAVOL_CZECH_INTERNAL_PATH),
                        label: 'Čeština',
                        iconSrc: '/locale-flags/cs.svg',
                        isActive: isCzech,
                    },
                    {
                        href: createPublicUrl(PAVOL_ENGLISH_INTERNAL_PATH),
                        label: 'English',
                        iconSrc: '/locale-flags/en.svg',
                        isActive: !isCzech,
                    },
                ],
            }}
            containerClassName={pavolContainerClassName}
            primaryAction={{
                label: content.header.primaryAction,
                href: '#contact',
                mobileLabel: isCzech ? 'Kontakt' : 'Contact',
            }}
        />
    );
}
