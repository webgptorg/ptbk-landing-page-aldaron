import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { COMMON_KNOWLEDGE_BOOKS, type CommonKnowledgeBook } from './catalog';

/** Metadata for the language-neutral English source catalogue. */
export const COMMON_KNOWLEDGE_INDEX_DEFINITION: PageMetadataDefinition = {
    path: '/book',
    language: 'en',
    title: 'Common knowledge | Promptbook',
    socialTitle: 'A shared starting point for your agents',
    description:
        'Reusable knowledge Books for Promptbook agents. Read the guidance, link the latest release, pin a version or adapt your own copy.',
    isSocialPreviewImageGenerated: true,
};

/** Readable topic metadata shares the catalogue's actual name and purpose. */
export function getCommonKnowledgeDefinition(book: CommonKnowledgeBook): PageMetadataDefinition {
    return {
        path: `/book/${book.slug}`,
        language: 'en',
        title: `${book.title} | Promptbook knowledge`,
        socialTitle: book.title,
        description: book.description,
        isSocialPreviewImageGenerated: true,
        openGraphType: 'article',
    };
}

/** Indexable pages; raw source endpoints stay downloads rather than duplicate HTML entries. */
export const COMMON_KNOWLEDGE_PAGE_DEFINITIONS = [
    COMMON_KNOWLEDGE_INDEX_DEFINITION,
    ...COMMON_KNOWLEDGE_BOOKS.map(getCommonKnowledgeDefinition),
];

/** Reuses the site's branded social renderer for these knowledge pages. */
export function getCommonKnowledgePreviewOptions(definition: PageMetadataDefinition) {
    return createSocialPreviewOptions(definition, {
        eyebrow: 'Promptbook · Common knowledge',
        artwork: 'knowledge',
        paletteSeed: { backgroundStart: '#101b46', backgroundEnd: '#000080', accent: '#c7d2fe', accentSoft: '#e2e8ff' },
    });
}
