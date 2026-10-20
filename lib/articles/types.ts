/** Language belongs to the article variant, independently of its author or publication. */
export type ArticleLanguage = 'cs' | 'en';
export type ArticlePublication = 'promptbook' | 'personal';

export type ArticleAuthor = {
    readonly id: string;
    readonly name: string;
    readonly bio: Readonly<Record<ArticleLanguage, string>>;
    readonly photoUrl: string;
    readonly domains: Readonly<Partial<Record<ArticleLanguage, string>>>;
    readonly socialLinks: readonly { readonly label: string; readonly url: string }[];
};

export type ArticleAudio = {
    readonly url: string;
    readonly duration: number;
    readonly byteLength: number;
    readonly mimeType: 'audio/mpeg';
    readonly wordsUrl?: string;
    readonly subtitlesUrl?: string;
};

/** Serializable article data shared by server-rendered pages and their optional audio controls. */
export type Article = {
    readonly id: string;
    readonly translationGroupId: string;
    readonly authorId: string;
    readonly language: ArticleLanguage;
    readonly slug: string;
    readonly title: string;
    readonly perex: string;
    readonly publishedAt: string;
    readonly updatedAt?: string;
    readonly tags: readonly string[];
    readonly coverImage?: string;
    readonly markdown: string;
    readonly author: ArticleAuthor;
    readonly canonicalUrl: string;
    readonly pdfUrl: string;
    readonly audio?: ArticleAudio;
    readonly translations: readonly { readonly language: ArticleLanguage; readonly url: string; readonly title: string }[];
};

/** Human-authored editorial metadata; technical recording provenance lives separately in metadata.json. */
export type ArticleEditorialMetadata = Pick<Article, 'id' | 'translationGroupId' | 'authorId' | 'language' | 'slug' | 'title' | 'perex' | 'publishedAt'> & {
    readonly updatedAt?: string;
    readonly tags?: readonly string[];
    readonly coverImage?: string;
    readonly status?: 'published' | 'draft';
};

export type ArticleTechnicalMetadata = {
    readonly schemaVersion: number;
    readonly files: readonly { readonly path: string; readonly sha256: string; readonly bytes: number; readonly mimeType: string }[];
    readonly audio?: {
        readonly status: 'pending' | 'ready';
        readonly file?: string;
        readonly durationSeconds?: number;
        readonly wordsFile?: string;
        readonly subtitlesFile?: string;
        readonly voiceName?: string;
        readonly voiceId?: string;
        readonly modelId?: string;
        readonly createdAt?: string;
    };
};
