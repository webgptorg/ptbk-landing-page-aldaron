import { notFound } from 'next/navigation';
import { LegalDocumentPage, NewLegalPage } from '@/businesses/new/NewLegalPage';
import { LegalHubPage } from '@/businesses/new/LegalHubPage';
import { LEGAL_DOCUMENT_KINDS, LEGAL_PAGE_PATHS, getLegalKindBySlug } from './legalPagePaths';
import { LEGAL_PAGE_METADATA, getPromptbookOnlineTermsPageDefinition } from './legalPageMetadata';
import { getPromptbookOnlineTermsDocument } from './promptbookOnlineTermsDocument';
import { PROMPTBOOK_ONLINE_TERMS_VERSIONS } from './promptbookOnlineTermsVersion';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export const LEGAL_HUB_DEFINITIONS: Record<SupportedHomepageLanguage, PageMetadataDefinition> = {
    cs: { path: '/cs/legal', language: 'cs', title: 'Právní dokumenty | Promptbook', description: 'Podmínky, partnerství, licence a ochrana osobních údajů.', languageAlternates: { cs: '/cs/legal', en: '/en/legal' }, isSocialPreviewImageGenerated: true },
    en: { path: '/en/legal', language: 'en', title: 'Legal documents | Promptbook', description: 'Terms, partnerships, licensing and personal-data information.', languageAlternates: { cs: '/cs/legal', en: '/en/legal' }, isSocialPreviewImageGenerated: true },
};
function getOnlineTermsVersion(parts: string[], language: SupportedHomepageLanguage) {
    return language === 'cs' && parts.length === 2 && parts[0] === 'podminky-produktu'
        ? PROMPTBOOK_ONLINE_TERMS_VERSIONS.find(version => version === parts[1])
        : undefined;
}

export function legalRouteParams(language: SupportedHomepageLanguage) {
    const params = [{ document: [] }, ...LEGAL_DOCUMENT_KINDS.map(kind => ({ document: [LEGAL_PAGE_PATHS[kind][language].split('/').at(-1)!] }))];
    if (language === 'cs') params.push(...PROMPTBOOK_ONLINE_TERMS_VERSIONS.map(version => ({ document: ['podminky-produktu', version] })));
    return params;
}
export function legalRouteMetadata(parts: string[], language: SupportedHomepageLanguage) {
    if (!parts.length) return createPageMetadata(LEGAL_HUB_DEFINITIONS[language]);
    const version = getOnlineTermsVersion(parts, language);
    const definition = version && getPromptbookOnlineTermsPageDefinition(version);
    if (definition) return createPageMetadata(definition);
    const kind = parts.length === 1 && getLegalKindBySlug(parts[0], language);
    return kind ? LEGAL_PAGE_METADATA[kind][language] : {};
}
export function LegalRoute({ parts, language }: { parts: string[]; language: SupportedHomepageLanguage }) {
    if (!parts.length) return <LegalHubPage language={language}/>;
    const version = getOnlineTermsVersion(parts, language);
    const document = version && getPromptbookOnlineTermsDocument(version);
    if (document) return <LegalDocumentPage document={document} language={language}/>;
    const kind = parts.length === 1 && getLegalKindBySlug(parts[0], language);
    if (!kind) notFound();
    return <NewLegalPage kind={kind} language={language}/>;
}
