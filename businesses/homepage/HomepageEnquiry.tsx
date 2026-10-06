'use client';

import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { QualificationPopup } from '@/components/qualification-popup';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { HOMEPAGE_CONTENT } from './homepageContent';
import { HOMEPAGE_SCENARIOS } from './homepageScenarios';

/** A normal anchor before hydration; opening the popup never changes a selected story or pre-fills a lead. */
export function HomepageEnquiryLink({
    children,
    className = 'hp-button',
    id,
}: {
    readonly children: ReactNode;
    readonly className?: string;
    readonly id?: string;
}) {
    return (
        <a
            id={id}
            href="#contact"
            className={className}
            onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                const isUnhandled = window.dispatchEvent(new Event('open-qualification-popup', { cancelable: true }));
                if (!isUnhandled) event.preventDefault();
            }}
        >
            {children}
            <ArrowUpRight size={17} aria-hidden="true" />
        </a>
    );
}

export function HomepageEnquiry({ language }: { readonly language: SupportedHomepageLanguage }) {
    return (
        <QualificationPopup
            language={language}
            presentation={{
                copy: HOMEPAGE_CONTENT[language].enquiry,
                areas: HOMEPAGE_SCENARIOS[language].map((scenario) => scenario.name),
                confirmationPath: `/dekujeme?flow=homepage&lang=${language}`,
            }}
        />
    );
}
