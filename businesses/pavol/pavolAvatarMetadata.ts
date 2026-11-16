import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { PAVOL_PAGE_DEFINITIONS } from './pavolMetadata';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export function createPavolAvatarMetadata(language: SupportedHomepageLanguage) {
    return createPageMetadata({
        ...PAVOL_PAGE_DEFINITIONS[language], path: `/${language}/pavol/avatar`, isIndexed: false,
        title: language === 'cs' ? 'Plný avatar | Pavol Hejný' : 'Full avatar | Pavol Hejný',
        description: language === 'cs' ? 'Rozhovor s digitálním avatarem Pavola Hejného o AI, programování a jeho projektech.' : 'Talk to Pavol Hejný’s digital avatar about AI, programming and his projects.',
        socialPreviewImagePath: `/${language}/pavol/opengraph-image`,
        languageAlternates: { cs: '/cs/pavol/avatar', en: '/en/pavol/avatar' },
    });
}
