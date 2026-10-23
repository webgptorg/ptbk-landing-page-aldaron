import { localizedPath, type SiteLocale } from './localization';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
export const NEW_BLUE_PALETTE = {backgroundStart:'#10152f',backgroundEnd:'#202c64',accent:'#a8bcff',accentSoft:'#c3d5ff'} as const;
import { sitePath } from './siteConfig';

export const NEW_PAGE_DEFINITION: PageMetadataDefinition = {
    path:sitePath(),languageAlternates:{cs:sitePath(),en:localizedPath('', 'en')},language:'cs',title:'Promptbook — Dřív jste AI úkolovali. Teď pracuje pro vás.',
    description:'AI agendy pro e-maily, doklady, obsah a údržbu webu. Vlastní data, end-to-end šifrované ovládání a nasazení s partnerem.',
    socialTitle:'Dřív jste AI úkolovali. Teď pracuje pro vás.',
    socialPreviewImageAlt:'Promptbook — firemní agendy pod vaší kontrolou',
    isSocialPreviewImageGenerated:true,isIndexed:true,
};
export const PARTNERSHIP_PAGE_DEFINITION: PageMetadataDefinition = {
    ...NEW_PAGE_DEFINITION,languageAlternates:{cs:sitePath('partnership'),en:localizedPath('partnership','en')},path:sitePath('partnership'),title:'Partnerství s Promptbookem — vaše služby, naše technologie',
    socialTitle:'Vaši klienti. Vaše služby. Naše technologie.',
    description:'Nabídněte klientům dlouhodobé AI agendy. Vlastní implementace a servis, 20% partnerský podíl a technologie Promptbooku.',
    socialPreviewImageAlt:'Partnerství s Promptbookem',
};
export const NEW_METADATA = createPageMetadata(NEW_PAGE_DEFINITION);
export const PARTNERSHIP_METADATA = createPageMetadata(PARTNERSHIP_PAGE_DEFINITION);
export const NEW_PREVIEW = createSocialPreviewOptions(NEW_PAGE_DEFINITION,{eyebrow:'Promptbook',artwork:'knowledge',paletteSeed:NEW_BLUE_PALETTE});
export const PARTNERSHIP_PREVIEW = createSocialPreviewOptions(PARTNERSHIP_PAGE_DEFINITION,{eyebrow:'Partnerství',artwork:'knowledge',paletteSeed:NEW_BLUE_PALETTE});

/** Public root website metadata. Query values never enter metadata. */
export function newPageMetadata(path:string,title:string,description:string,locale:SiteLocale = 'cs') {
    const metadata=createPageMetadata({ ...NEW_PAGE_DEFINITION,language:locale,languageAlternates:{cs:localizedPath(path,'cs'),en:localizedPath(path,'en')},path:localizedPath(path,locale),title:`${title} | Promptbook`,socialTitle:title,description,isSocialPreviewImageGenerated:false });
    const imageUrl = `https://ptbk.io${locale === 'en' ? '/en' : ''}/opengraph-image`;
    return { ...metadata,openGraph:{...metadata.openGraph,images:[{url:imageUrl,width:1200,height:630,alt:'Promptbook'}]},twitter:{...metadata.twitter,images:[imageUrl]} };
}
