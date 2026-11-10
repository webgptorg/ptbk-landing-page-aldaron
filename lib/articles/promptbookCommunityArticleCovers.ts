import type { ManagedArticleDestination } from './managedArticleInput';
import type { Article } from './types';

export const COMMUNITY_ARTICLE_COVER_SIZE = { width: 1200, height: 630 } as const;

const covers = new Map<string, string>([
    ['pece-o-kontakty', 'Modelová ukázka péče o kontakty od zprávy o nové pobočce přes historii jednání po osobní e-mail.'],
    ['sprava-podcastu', 'Modelová ukázka zpracování podcastu od nového dílu přes výběr pasáží po příspěvky pro jednotlivé kanály.'],
    ['udrzba-webu', 'Modelová ukázka údržby webu od hlášení chyby přes změnu kódu po ověření kontaktního formuláře.'],
]);

/** Static crops of the completed Czech BlueprintScene illustrations from the homepage. */
export function getPromptbookCommunityArticleCover(
    article: Pick<Article, 'language' | 'slug'>,
    destination: ManagedArticleDestination,
): Pick<Article, 'coverImage' | 'coverImageAlt'> | undefined {
    if (destination !== 'promptbook' || article.language !== 'cs') return undefined;
    const coverImageAlt = covers.get(article.slug);
    return coverImageAlt ? {
        coverImage: `/community-article-covers/${article.slug}.jpg`,
        coverImageAlt,
    } : undefined;
}
