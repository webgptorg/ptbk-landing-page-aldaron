import 'server-only';

import { cache } from 'react';
import { z } from 'zod';
import { COMMUNITY_IDS } from '@/businesses/community/config';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';
import { getAllArticles } from './load';
import { isArticleCommunity, managedArticleDestinationSchema, type ManagedArticleDestination } from './managedArticleInput';
import { getManagedArticleUrl } from './managedArticleUrls';
import { managedArticleError } from './managedArticles';
import type { Article } from './types';

const TABLE = 'legacy_article_placements';

export const legacyArticlePlacementsInputSchema = z.object({
    communities: z.array(z.enum(COMMUNITY_IDS)).max(COMMUNITY_IDS.length),
    canonicalDestination: managedArticleDestinationSchema,
}).strict().superRefine((value, ctx) => {
    if (new Set(value.communities).size !== value.communities.length) {
        ctx.addIssue({ code: 'custom', path: ['communities'], message: 'Každou komunitu lze vybrat jen jednou.' });
    }
    if (isArticleCommunity(value.canonicalDestination) && !value.communities.includes(value.canonicalDestination)) {
        ctx.addIssue({ code: 'custom', path: ['canonicalDestination'], message: 'Vyberte kanonické umístění z publikovaných míst.' });
    }
});
export type LegacyArticlePlacements = z.infer<typeof legacyArticlePlacementsInputSchema>;

type LegacyArticlePlacementRow = {
    readonly legacy_id: string;
    readonly communities: LegacyArticlePlacements['communities'];
    readonly canonical_destination: ManagedArticleDestination;
};

/** An unavailable overlay leaves the existing public Git articles in their original destinations. */
export const getLegacyArticlePlacements = cache(async (): Promise<Record<string, LegacyArticlePlacements>> => {
    const client = createSupabaseServiceRoleClient();
    const placements: Record<string, LegacyArticlePlacements> = Object.create(null);
    if (!client) return placements;
    const { rows } = await loadAllSupabaseRows<LegacyArticlePlacementRow>(
        (from, to) => client.from(TABLE).select('*').order('legacy_id').range(from, to),
        'read Git article placements',
    );
    for (const row of rows ?? []) {
        placements[row.legacy_id] = { communities: row.communities, canonicalDestination: row.canonical_destination };
    }
    return placements;
});

export async function updateLegacyArticlePlacements(id: string, input: LegacyArticlePlacements): Promise<LegacyArticlePlacements> {
    const placements = legacyArticlePlacementsInputSchema.parse(input);
    const article = getAllArticles().find((candidate) => candidate.id === id);
    if (!article) throw managedArticleError('Článek nebyl nalezen.', 404);
    if (placements.canonicalDestination === 'personal-blog' && article.authorId !== 'pavol-hejny') {
        throw managedArticleError('Tento starší článek není publikován na osobním blogu.', 400);
    }
    const client = createSupabaseServiceRoleClient();
    if (!client) throw managedArticleError('Databáze článků není nakonfigurovaná.', 503);
    const { error } = await client.from(TABLE).upsert({
        legacy_id: id, communities: placements.communities, canonical_destination: placements.canonicalDestination,
    }, { onConflict: 'legacy_id' });
    if (error) throw managedArticleError('Umístění článku se nepodařilo uložit.', 503);
    return placements;
}

export function applyLegacyArticlePlacements(
    article: Article,
    placements: Readonly<Record<string, LegacyArticlePlacements>>,
    legacyArticles: readonly Article[],
): Article {
    const canonicalDestination = placements[article.id]?.canonicalDestination;
    return {
        ...article,
        canonicalUrl: canonicalDestination ? getManagedArticleUrl(article, canonicalDestination) : article.canonicalUrl,
        translations: article.translations.map((translation) => {
            const variant = legacyArticles.find((candidate) => candidate.translationGroupId === article.translationGroupId && candidate.language === translation.language);
            const variantCanonical = variant && placements[variant.id]?.canonicalDestination;
            return variant && variantCanonical ? { ...translation, url: getManagedArticleUrl(variant, variantCanonical) } : translation;
        }),
    };
}
