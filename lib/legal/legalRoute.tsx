import { notFound } from 'next/navigation';
import { NewLegalPage } from '@/businesses/new/NewLegalPage';
import { LegalHubPage } from '@/businesses/new/LegalHubPage';
import { LEGAL_DOCUMENT_KINDS, LEGAL_PAGE_PATHS, getLegalKindBySlug } from './legalPagePaths';
import { LEGAL_PAGE_METADATA } from './legalPageMetadata';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export const LEGAL_HUB_DEFINITIONS: Record<SupportedHomepageLanguage, PageMetadataDefinition> = {
    cs: { path: '/cs/legal', language: 'cs', title: 'Právní dokumenty | Promptbook', description: 'Podmínky, partnerství, licence a ochrana osobních údajů.', languageAlternates: { cs: '/cs/legal', en: '/en/legal' }, isSocialPreviewImageGenerated: true },
    en: { path: '/en/legal', language: 'en', title: 'Legal documents | Promptbook', description: 'Terms, partnerships, licensing and personal-data information.', languageAlternates: { cs: '/cs/legal', en: '/en/legal' }, isSocialPreviewImageGenerated: true },
};
export function legalRouteParams(language: SupportedHomepageLanguage) {
    return [{ document: [] }, ...LEGAL_DOCUMENT_KINDS.map(kind => ({ document: [LEGAL_PAGE_PATHS[kind][language].split('/').at(-1)!] }))];
}
export function legalRouteMetadata(parts: string[], language: SupportedHomepageLanguage) {
    if (!parts.length) return createPageMetadata(LEGAL_HUB_DEFINITIONS[language]);
    const kind = parts.length === 1 && getLegalKindBySlug(parts[0], language);
    return kind ? LEGAL_PAGE_METADATA[kind][language] : {};
}
export function LegalRoute({ parts, language }: { parts: string[]; language: SupportedHomepageLanguage }) {
    if (!parts.length) return <LegalHubPage language={language}/>;
    const kind = parts.length === 1 && getLegalKindBySlug(parts[0], language);
    if (!kind) notFound();
    return <NewLegalPage kind={kind} language={language}/>;
}
