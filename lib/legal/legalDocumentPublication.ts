import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LegalDocument } from '@/lib/legal/legalDocument';
import { getLegalDocumentEffectiveDateLabel } from '@/lib/legal/legalDocumentEffectiveDate';

/** Distinguishes the date of a proposal from the effective date of an adopted notice. */
export function getLegalDocumentPublicationLabel(document: LegalDocument, language: SupportedHomepageLanguage): string {
    if (!document.publication) return getLegalDocumentEffectiveDateLabel(language);
    const date = new Intl.DateTimeFormat(language === 'cs' ? 'cs-CZ' : 'en-US', {
        dateStyle: 'long', timeZone: 'UTC',
    }).format(new Date(`${document.publication.date}T00:00:00Z`));
    const prefix = document.publication.isDraft
        ? (language === 'cs' ? 'Návrh k projednání' : 'Draft for discussion')
        : (language === 'cs' ? 'Aktualizováno' : 'Updated');
    return `${prefix} · ${date}`;
}
