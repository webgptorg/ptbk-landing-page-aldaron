import { localizedPath, type SiteLocale } from './localization';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
export const NEW_BLUE_PALETTE = {backgroundStart:'#10152f',backgroundEnd:'#202c64',accent:'#a8bcff',accentSoft:'#c3d5ff'} as const;

/** The installation page's matching Czech and English metadata. */
export const OPEN_SOURCE_PAGE_COPY = {
    cs: ['Vlastní instalace Promptbook Engine', 'Nainstalujte Promptbook na svůj počítač nebo server přes npm, shell nebo Windows EXE. Vlastní soubory, historie v Gitu a pomoc s nasazením.'],
    en: ['Install your own Promptbook Engine', 'Install Promptbook on your computer or server with npm, shell commands or the Windows EXE. Your files, Git history and help getting started.'],
} as const;

/** Search and sharing copy follows each page's visible headline and ownership promise. */
export const NEW_PAGE_DEFINITIONS: Record<SiteLocale, PageMetadataDefinition> = {
    cs: {
        path: localizedPath('', 'cs'), language: 'cs',
        languageAlternates: { cs: localizedPath('', 'cs'), en: localizedPath('', 'en') },
        title: 'Promptbook — Dřív jste AI úkolovali. Teď pracuje pro vás.',
        socialTitle: 'Dřív jste AI úkolovali. Teď pracuje pro vás.',
        description: 'Vaše AI. Na vašem stroji. Pod vaší kontrolou. Předáte agendu, nastavíte pravidla a agenti pracují dál. Vlastní engine, aplikace a podpora.',
        socialPreviewImageAlt: 'Promptbook — vaše AI, na vašem stroji, pod vaší kontrolou',
        isSocialPreviewImageGenerated: true, isIndexed: true,
    },
    en: {
        path: localizedPath('', 'en'), language: 'en',
        languageAlternates: { cs: localizedPath('', 'cs'), en: localizedPath('', 'en') },
        title: 'Promptbook — You used to give AI tasks. Now it works for you.',
        socialTitle: 'You used to give AI tasks. Now it works for you.',
        description: 'Your AI. On your machine. Under your control. Hand over ongoing work, set the rules and let agents continue. Your own engine, app and support.',
        socialPreviewImageAlt: 'Promptbook — your AI, on your machine, under your control',
        isSocialPreviewImageGenerated: true, isIndexed: true,
    },
};

/** Partners sell their services and receive the existing fixed licence share. */
export const PARTNERSHIP_PAGE_DEFINITIONS: Record<SiteLocale, PageMetadataDefinition> = {
    cs: {
        ...NEW_PAGE_DEFINITIONS.cs,
        path: localizedPath('partnership', 'cs'),
        languageAlternates: { cs: localizedPath('partnership', 'cs'), en: localizedPath('partnership', 'en') },
        title: 'Partnerství s Promptbookem — Vaši klienti. Naše technologie.',
        socialTitle: 'Vaši klienti. Vaše služby. Naše technologie.',
        description: 'Dodávejte klientům vlastní AI engine, aplikaci a podporu. Vydělávejte na implementaci, servisu a pevném 20% podílu z licence. Bez partnerského předplatného.',
        socialPreviewImageAlt: 'Partnerství s Promptbookem — vaši klienti, vaše služby, naše technologie',
    },
    en: {
        ...NEW_PAGE_DEFINITIONS.en,
        path: localizedPath('partnership', 'en'),
        languageAlternates: { cs: localizedPath('partnership', 'cs'), en: localizedPath('partnership', 'en') },
        title: 'Promptbook partnership — Your clients. Our technology.',
        socialTitle: 'Your clients. Your services. Our technology.',
        description: 'Bring clients their own AI engine, app and support. Earn from implementation, ongoing service and a fixed 20% licence share. No partner subscription.',
        socialPreviewImageAlt: 'Promptbook partnership — your clients, your services, our technology',
    },
};
export const NEW_PAGE_DEFINITION = NEW_PAGE_DEFINITIONS.cs;
export const PARTNERSHIP_PAGE_DEFINITION = PARTNERSHIP_PAGE_DEFINITIONS.cs;
export const NEW_METADATA = createPageMetadata(NEW_PAGE_DEFINITION);
export const PARTNERSHIP_METADATA = createPageMetadata(PARTNERSHIP_PAGE_DEFINITION);
export const NEW_EN_METADATA = createPageMetadata(NEW_PAGE_DEFINITIONS.en);
export const PARTNERSHIP_EN_METADATA = createPageMetadata(PARTNERSHIP_PAGE_DEFINITIONS.en);
export const NEW_PREVIEW = createSocialPreviewOptions(NEW_PAGE_DEFINITION,{eyebrow:'Promptbook',artwork:'knowledge',paletteSeed:NEW_BLUE_PALETTE});
export const PARTNERSHIP_PREVIEW = createSocialPreviewOptions(PARTNERSHIP_PAGE_DEFINITION,{eyebrow:'Partnerství',artwork:'knowledge',paletteSeed:NEW_BLUE_PALETTE});
export const NEW_EN_PREVIEW = createSocialPreviewOptions(NEW_PAGE_DEFINITIONS.en,{eyebrow:'Promptbook',artwork:'knowledge',paletteSeed:NEW_BLUE_PALETTE});
export const PARTNERSHIP_EN_PREVIEW = createSocialPreviewOptions(PARTNERSHIP_PAGE_DEFINITIONS.en,{eyebrow:'Partnership',artwork:'knowledge',paletteSeed:NEW_BLUE_PALETTE});

/** Public root website metadata. Query values never enter metadata. */
export function newPageMetadata(path:string,title:string,description:string,locale:SiteLocale = 'cs') {
    const metadata=createPageMetadata({ ...NEW_PAGE_DEFINITION,language:locale,languageAlternates:{cs:localizedPath(path,'cs'),en:localizedPath(path,'en')},path:localizedPath(path,locale),title:`${title} | Promptbook`,socialTitle:title,description,isSocialPreviewImageGenerated:false });
    const imageUrl = `https://ptbk.io/${locale}/opengraph-image`;
    return { ...metadata,openGraph:{...metadata.openGraph,images:[{url:imageUrl,width:1200,height:630,alt:'Promptbook'}]},twitter:{...metadata.twitter,images:[imageUrl]} };
}
