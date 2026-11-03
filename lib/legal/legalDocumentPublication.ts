import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LegalDocument } from '@/lib/legal/legalDocument';
import { getLegalDocumentEffectiveDateLabel } from '@/lib/legal/legalDocumentEffectiveDate';

/** Labels the current public text without implying acceptance of an individual order. */
export function getLegalDocumentPublicationLabel(document: LegalDocument, language: SupportedHomepageLanguage): string {
    if (!document.publication) return getLegalDocumentEffectiveDateLabel(language);
    const date = new Intl.DateTimeFormat(language === 'cs' ? 'cs-CZ' : 'en-US', {
        dateStyle: 'long', timeZone: 'UTC',
    }).format(new Date(`${document.publication.date}T00:00:00Z`));
    const prefix = language === 'cs' ? 'Znění ze dne' : 'Version dated';
    return `${prefix} · ${date}`;
}
