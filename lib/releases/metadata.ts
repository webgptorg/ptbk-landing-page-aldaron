import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
export const RELEASE_PAGE_DEFINITIONS: Record<'cs' | 'en', PageMetadataDefinition> = {
    cs: { path: '/cs/releases', language: 'cs', title: 'Vydání a podpora | Promptbook', description: 'Přehled verzí Promptbooku od řady 0.115 s daty zveřejnění a stavem podpory.', languageAlternates: { cs: '/cs/releases', en: '/en/releases' }, isSocialPreviewImageGenerated: true },
    en: { path: '/en/releases', language: 'en', title: 'Releases and support | Promptbook', description: 'Promptbook versions from line 0.115 with publication dates and support status.', languageAlternates: { cs: '/cs/releases', en: '/en/releases' }, isSocialPreviewImageGenerated: true },
};
export const RELEASE_PAGE_METADATA = { cs: createPageMetadata(RELEASE_PAGE_DEFINITIONS.cs), en: createPageMetadata(RELEASE_PAGE_DEFINITIONS.en) };
