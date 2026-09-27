import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';

export const HOPKO_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/test/hopko',
    language: 'en',
    title: 'Hopko — tiny chaos, big hop',
    description: 'An experimental little productivity goblin with excellent bounce.',
    isSocialPreviewImageGenerated: true,
    isIndexed: false,
};

export const HOPKO_METADATA = createPageMetadata(HOPKO_PAGE_DEFINITION);
