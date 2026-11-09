import { revalidatePath } from 'next/cache';
import type { ManagedArticleInput } from './managedArticleInput';

type Publication = Pick<ManagedArticleInput, 'language' | 'placements'>;

/** Refresh only the cached indexes which can show this public publication. */
export function revalidateArticlePublications(...articles: readonly (Publication | null)[]) {
    const paths = new Set<string>();
    for (const article of articles) {
        if (!article) continue;
        const { language, placements } = article;
        for (const placement of placements) {
            if (placement.visibility !== 'public') continue;
            if (placement.destination === 'personal-blog') {
                paths.add(`/${language}/pavol`);
                paths.add(`/${language}/pavol/articles/podcast.xml`);
                paths.add(`/${language}/pavol/sitemap.xml`);
            } else {
                paths.add('/sitemap.xml');
                if (placement.destination === 'promptbook-blog') paths.add(`/${language}/articles/podcast.xml`);
            }
        }
    }
    try {
        paths.forEach((path) => revalidatePath(path));
    } catch {
        // The article is already saved. Scheduled revalidation remains available if the cache is down.
        console.warn('Could not immediately refresh the article publication cache.');
    }
}
