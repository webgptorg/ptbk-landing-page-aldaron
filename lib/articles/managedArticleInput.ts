import { z } from 'zod';
import { COMMUNITIES, COMMUNITY_IDS, getCommunityById, type CommunityId } from '@/businesses/community/config';
import { getArticleAuthor } from './authors';

export const ARTICLE_DESTINATIONS = ['promptbook-blog', 'personal-blog', ...COMMUNITY_IDS] as const;
export type ManagedArticleDestination = (typeof ARTICLE_DESTINATIONS)[number];
export type ArticleCommunity = CommunityId;

export function isArticleCommunity(value: string): value is ArticleCommunity {
    return getCommunityById(value) !== undefined;
}

export const managedArticleDestinationSchema = z.enum(ARTICLE_DESTINATIONS);
const placement = z.object({ destination: managedArticleDestinationSchema, visibility: z.enum(['public', 'members', 'paid']) });
export type ManagedArticlePlacement = z.infer<typeof placement>;

export const managedArticleInputSchema = z.object({
    language: z.enum(['cs', 'en']),
    slug: z.string().trim().max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL musí obsahovat jen malá písmena, čísla a pomlčky.'),
    title: z.string().trim().min(1, 'Zadejte název článku.').max(200),
    perex: z.string().trim().max(1000),
    markdown: z.string().max(250_000),
    authorId: z.string().refine((id) => Boolean(getArticleAuthor(id)), 'Vyberte autora článku.'),
    placements: z.array(placement).max(ARTICLE_DESTINATIONS.length),
    canonicalDestination: managedArticleDestinationSchema.nullable(),
}).strict().superRefine((article, ctx) => {
    const destinations = new Set(article.placements.map((entry) => entry.destination));
    const addIssue = (path: string, message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
    if (destinations.size !== article.placements.length) addIssue('placements', 'Každé umístění lze vybrat jen jednou.');
    if (destinations.size === 0) {
        if (article.canonicalDestination !== null) addIssue('canonicalDestination', 'Koncept nemá kanonické umístění.');
        return;
    }
    const canonicalPlacement = article.placements.find((entry) => entry.destination === article.canonicalDestination);
    if (!canonicalPlacement) {
        addIssue('canonicalDestination', 'Vyberte jedno z publikovaných umístění jako kanonické.');
    } else if (canonicalPlacement.visibility !== 'public' && article.placements.some((entry) => entry.visibility === 'public')) {
        addIssue('canonicalDestination', 'Kanonické umístění veřejného článku musí být veřejné.');
    }
    if (!article.markdown.trim()) addIssue('markdown', 'Před publikací doplňte text článku.');
    if (!article.perex) addIssue('perex', 'Před publikací doplňte perex.');
    if (article.placements.some((entry) => !isArticleCommunity(entry.destination) && entry.visibility !== 'public')) {
        addIssue('placements', 'Na blogu lze článek publikovat veřejně.');
    }
    if (article.placements.some((entry) => entry.visibility === 'paid' && isArticleCommunity(entry.destination) && !COMMUNITIES[entry.destination].hasPaidMembership)) {
        addIssue('placements', 'Komunita Promptbook zatím nemá placené členství.');
    }
});
export type ManagedArticleInput = z.infer<typeof managedArticleInputSchema>;

export const MANAGED_ARTICLE_ASSET_KINDS = {
    audio: { mimeType: 'audio/mpeg', maxBytes: 200 * 1024 * 1024, extension: 'mp3' },
    pdf: { mimeType: 'application/pdf', maxBytes: 40 * 1024 * 1024, extension: 'pdf' },
    words: { mimeType: 'application/json', maxBytes: 10 * 1024 * 1024, extension: 'json' },
    subtitles: { mimeType: 'text/vtt', maxBytes: 2 * 1024 * 1024, extension: 'vtt' },
} as const;
export type ManagedArticleAssetKind = keyof typeof MANAGED_ARTICLE_ASSET_KINDS;

export function isManagedArticleAssetKind(value: string): value is ManagedArticleAssetKind {
    return Object.prototype.hasOwnProperty.call(MANAGED_ARTICLE_ASSET_KINDS, value);
}
