/** One independently released, immutable knowledge source. */
export type CommonKnowledgeRelease = {
    readonly version: string;
    readonly publishedAt: string;
    readonly sourcePath: string;
};

/** Public catalogue entry; versions are unrelated to the engine package version. */
export type CommonKnowledgeBook = {
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly currentVersion: string;
    readonly releases: readonly CommonKnowledgeRelease[];
};

/** Curated Books. Publishing adds a release without replacing previously released source. */
export const COMMON_KNOWLEDGE_BOOKS: readonly CommonKnowledgeBook[] = [
    {
        slug: 'external-action-impact',
        title: 'External action impact',
        description:
            'A shared scale for the consequences of external actions, from a read-state change to a large irreversible operation.',
        currentVersion: '1.0.0',
        releases: [
            { version: '1.0.0', publishedAt: '2026-11-01', sourcePath: 'knowledge/external-action-impact/1.0.0.book' },
        ],
    },
];

/** Resolves only curated slugs, never arbitrary paths supplied by a visitor. */
export function getCommonKnowledgeBook(slug: string): CommonKnowledgeBook | undefined {
    return COMMON_KNOWLEDGE_BOOKS.find((book) => book.slug === slug);
}

/** Stable machine-readable URL, or an immutable URL when a release is explicitly selected. */
export function getCommonKnowledgePath(book: CommonKnowledgeBook, version?: string): string {
    return version ? `/book/${book.slug}/${version}.book` : `/book/${book.slug}.book`;
}
