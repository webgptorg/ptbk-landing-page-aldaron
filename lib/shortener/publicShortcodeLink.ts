import { SHORTCODE_LINK_TABLE_NAME } from '@/lib/shortener/shortcodeLinkConstants';
import { supabase } from '@/lib/supabase';
import { cache } from 'react';
import { headers } from 'next/headers';
import { getShortcodeLinkRequestHostname, isShortcodeLinkAvailableOnHostname } from './shortcodeLinkDomains';

/**
 * The small, non-sensitive slice a public short-link route needs.
 *
 * Keeping this separate from the administration model prevents a visitor (or
 * metadata crawler) from ever loading a short link's private note or internal
 * provenance fields.
 */
export type PublicShortcodeLink = {
    readonly id: number;
    readonly url: readonly string[];
    readonly landingPage: string | null;
};

/**
 * Loads a public short link once per server render. Both the document and its
 * `generateMetadata` use this function, so they cannot disagree about a link
 * while it is being shared.
 */
export const loadPublicShortcodeLink = cache(async (shortcode: string): Promise<PublicShortcodeLink | null> => {
    if (supabase === null) {
        return null;
    }

    const { data, error } = await supabase
        .from(SHORTCODE_LINK_TABLE_NAME)
        .select('id, url, landingPage, domains')
        .eq('shortcode', shortcode)
        .maybeSingle();

    if (error !== null || data === null || !Array.isArray(data.url)) {
        return null;
    }

    if (!isShortcodeLinkAvailableOnHostname(data.domains, getShortcodeLinkRequestHostname(await headers()))) return null;

    const urls = data.url.filter((url): url is string => typeof url === 'string' && url.length > 0);
    if (urls.length === 0) {
        return null;
    }

    return {
        id: data.id,
        url: urls,
        landingPage: typeof data.landingPage === 'string' && data.landingPage.trim() !== '' ? data.landingPage : null,
    };
});
