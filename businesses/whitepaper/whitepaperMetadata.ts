import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { WHITEPAPER_PATHS } from './whitepaperConfig';
import { WHITEPAPER_CONTENT } from './whitepaperContent';

function createWhitepaperDefinition(language: SupportedHomepageLanguage): PageMetadataDefinition {
    const content = WHITEPAPER_CONTENT[language];
    const title = content.hero.title.join(' ');
    return {
        path: WHITEPAPER_PATHS[language],
        language,
        title: `Promptbook Whitepaper — ${title}`,
        socialTitle: title,
        description:
            language === 'cs'
                ? 'Interaktivní whitepaper o APT: agenti, projekt a úkoly. Prozkoumejte autonomní agendy, kontrolovaný pracovní cyklus a společnou historii práce i výsledků.'
                : 'An interactive whitepaper on APT: agents, projects, and tasks. Explore autonomous agendas, a controlled work cycle, and a shared history of work and results.',
        socialPreviewImageAlt: `Promptbook · APT Framework — ${title}`,
        languageAlternates: WHITEPAPER_PATHS,
        isSocialPreviewImageGenerated: true,
        openGraphType: 'article',
        keywords: [
            'Promptbook',
            'whitepaper',
            'APT',
            'Agent Project Task',
            language === 'cs' ? 'autonomní agendy' : 'autonomous agendas',
        ],
        sitemapPriority: 0.8,
        sitemapChangeFrequency: 'monthly',
    };
}

export const WHITEPAPER_PAGE_DEFINITIONS = {
    cs: createWhitepaperDefinition('cs'),
    en: createWhitepaperDefinition('en'),
};

export const WHITEPAPER_METADATA = {
    cs: createPageMetadata(WHITEPAPER_PAGE_DEFINITIONS.cs),
    en: createPageMetadata(WHITEPAPER_PAGE_DEFINITIONS.en),
};

const WHITEPAPER_PREVIEW_DESIGN = {
    eyebrow: 'Whitepaper · APT Framework',
    artwork: 'knowledge' as const,
    paletteSeed: { backgroundStart: '#11272e', backgroundEnd: '#234b52', accent: '#b4e9df', accentSoft: '#c9e6ef' },
};

export const WHITEPAPER_SOCIAL_PREVIEW_OPTIONS = {
    cs: createSocialPreviewOptions(WHITEPAPER_PAGE_DEFINITIONS.cs, WHITEPAPER_PREVIEW_DESIGN),
    en: createSocialPreviewOptions(WHITEPAPER_PAGE_DEFINITIONS.en, WHITEPAPER_PREVIEW_DESIGN),
};
