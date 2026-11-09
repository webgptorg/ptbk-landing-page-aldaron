import { Client } from 'pg';
import { getAllArticles } from '../../lib/articles/load';
import { managedArticleInputSchema, type ManagedArticleInput } from '../../lib/articles/managedArticleInput';
import { requireDatabaseUrl } from '../../lib/database/databaseUrl';

const LAUNCH_ARTICLE_SLUGS = ['pece-o-kontakty', 'sprava-podcastu', 'udrzba-webu'] as const;
const INVALID_PAYLOAD_MESSAGE = 'Invalid private Promptbook community article seed.';

function parseLaunchArticles(payload: string): readonly ManagedArticleInput[] {
    let input: unknown;
    try {
        input = JSON.parse(payload);
    } catch {
        throw new Error(INVALID_PAYLOAD_MESSAGE);
    }

    const result = managedArticleInputSchema.array().length(LAUNCH_ARTICLE_SLUGS.length).safeParse(input);
    if (!result.success) throw new Error(INVALID_PAYLOAD_MESSAGE);

    const articles = result.data;
    const articleSlugs = new Set(articles.map(({ slug }) => slug));
    const legacySlugs = new Set(getAllArticles().filter(({ language }) => language === 'cs').map(({ slug }) => slug));
    if (
        !LAUNCH_ARTICLE_SLUGS.every((slug) => articleSlugs.has(slug) && !legacySlugs.has(slug))
        || !articles.every(({ language, authorId, placements, canonicalDestination }) =>
            language === 'cs'
            && authorId === 'pavol-hejny'
            && canonicalDestination === 'promptbook'
            && placements.length === 1
            && placements[0].destination === 'promptbook'
            && placements[0].visibility === 'members',
        )
    ) {
        throw new Error(INVALID_PAYLOAD_MESSAGE);
    }

    return articles;
}

/** Import the private launch content atomically, leaving any already edited article untouched. */
export async function seedPromptbookCommunityArticles(payload: string): Promise<number> {
    const articles = parseLaunchArticles(payload);
    const databaseUrl = requireDatabaseUrl(undefined, 'publish the Promptbook community launch articles');
    const client = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 15_000 });
    try {
        await client.connect();
        const { rowCount } = await client.query(
            `INSERT INTO public.managed_articles (
                language, slug, title, perex, markdown, author_id, placements, canonical_destination, published_at
            )
            SELECT language, slug, title, perex, markdown, "authorId", placements, "canonicalDestination", now()
            FROM jsonb_to_recordset($1::jsonb) AS article(
                language text, slug text, title text, perex text, markdown text, "authorId" text,
                placements jsonb, "canonicalDestination" text
            )
            ON CONFLICT (language, slug) DO NOTHING`,
            [JSON.stringify(articles)],
        );
        return rowCount ?? 0;
    } catch {
        // Database errors can include the rejected record, which contains the full member article.
        throw new Error('Could not publish the private Promptbook community launch articles.');
    } finally {
        await client.end().catch(() => undefined);
    }
}
