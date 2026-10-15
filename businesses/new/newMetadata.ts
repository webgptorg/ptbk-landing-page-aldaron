import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { PROMPTBOOK_SOCIAL_PREVIEW_PALETTE } from '@/lib/metadata/social-preview-palette';
import { sitePath } from './siteConfig';

export const NEW_PAGE_DEFINITION: PageMetadataDefinition = {
    path:sitePath(),language:'cs',title:'Promptbook — Dřív jste AI úkolovali. Teď pracuje pro vás.',
    description:'AI agendy pro e-maily, doklady, obsah a údržbu webu. Vlastní data, end-to-end šifrované ovládání a nasazení s partnerem.',
    socialTitle:'Dřív jste AI úkolovali. Teď pracuje pro vás.',
    socialPreviewImageAlt:'Promptbook — firemní agendy pod vaší kontrolou',
    isSocialPreviewImageGenerated:true,isIndexed:false,
};
export const PARTNERSHIP_PAGE_DEFINITION: PageMetadataDefinition = {
    ...NEW_PAGE_DEFINITION,path:sitePath('partnership'),title:'Partnerství s Promptbookem — vaše služby, naše technologie',
    socialTitle:'Vaši klienti. Vaše služby. Naše technologie.',
    description:'Nabídněte klientům dlouhodobé AI agendy. Vlastní implementace a servis, 20% partnerský podíl a technologie Promptbooku.',
    socialPreviewImageAlt:'Partnerství s Promptbookem',
};
export const NEW_METADATA = createPageMetadata(NEW_PAGE_DEFINITION);
export const PARTNERSHIP_METADATA = createPageMetadata(PARTNERSHIP_PAGE_DEFINITION);
export const NEW_PREVIEW = createSocialPreviewOptions(NEW_PAGE_DEFINITION,{eyebrow:'Promptbook',artwork:'knowledge',paletteSeed:PROMPTBOOK_SOCIAL_PREVIEW_PALETTE});
export const PARTNERSHIP_PREVIEW = createSocialPreviewOptions(PARTNERSHIP_PAGE_DEFINITION,{eyebrow:'Partnerství',artwork:'knowledge',paletteSeed:PROMPTBOOK_SOCIAL_PREVIEW_PALETTE});

/** Future root website lives only under /new until an explicit cutover. Query values never enter metadata. */
export function newPageMetadata(path:string,title:string,description:string) {
    const metadata=createPageMetadata({ ...NEW_PAGE_DEFINITION,path:sitePath(path),title:`${title} | Promptbook`,socialTitle:title,description,isSocialPreviewImageGenerated:false });
    return { ...metadata,openGraph:{...metadata.openGraph,images:[{url:'https://ptbk.io/new/opengraph-image',width:1200,height:630,alt:'Promptbook'}]},twitter:{...metadata.twitter,images:['https://ptbk.io/new/opengraph-image']} };
}
