'use client';

import { QualificationPopup } from '@/components/qualification-popup';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { getHomepageContent } from './homepageContent';

export function HomepageLeadFlow({ language }: { language: SupportedHomepageLanguage }) {
    return (
        <QualificationPopup
            language={language}
            content={getHomepageContent(language).qualification}
            confirmationContext="agenda"
        />
    );
}
