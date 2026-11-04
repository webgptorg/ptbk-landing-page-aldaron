import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdHocShortcodeLink } from '@/lib/shortener/shortcodeLinkAdHoc';
import { createPublicShortcodeLinkUrl } from '@/lib/shortener/shortcodeLink';
import { getPublicShortcodeLinkAddressOrNull, isShortcodeLinkAvailableOnHostname } from '@/lib/shortener/shortcodeLinkDomains';
import { getWorkshopShortcodeLinkDestinations, getWorkshopShortcodeLinkDestinationsRequiringTitle, replaceWorkshopShortcodeLinkDestinations,
    resolveWorkshopShortcodeLinkTitle, type WorkshopShortcodeLinkPresentation } from '@/lib/workshops/workshopMaterialLinks';

const MESSAGE_LINK_NOTE = 'Ad hoc link in a message';

/** Save-time only: share the material parser, title fallback and shortener without workshop UTM parameters. */
export async function prepareMessageLinks(client: SupabaseClient, markdown: string): Promise<string> {
    const destinations = getWorkshopShortcodeLinkDestinations(markdown);
    if (!destinations.length) return markdown;
    const needsTitle = new Set(getWorkshopShortcodeLinkDestinationsRequiringTitle(markdown));
    const addresses = destinations.flatMap((url) => {
        const address = getPublicShortcodeLinkAddressOrNull(url);
        return address ? [{ url, ...address }] : [];
    });
    const existingUrls = new Set<string>();
    if (addresses.length) {
        const { data, error } = await client.from('ShortcodeLink').select('shortcode,domains').in('shortcode', Array.from(new Set(addresses.map((a) => a.shortcode))));
        if (error) throw new Error('Existující krátké odkazy se nepodařilo ověřit. Zpráva zůstává neuložená.');
        for (const address of addresses) {
            if (data?.some((row) => row.shortcode === address.shortcode && isShortcodeLinkAvailableOnHostname(row.domains, address.hostname))) existingUrls.add(address.url);
        }
    }
    const replacements = new Map<string, WorkshopShortcodeLinkPresentation>();
    for (const destination of destinations) {
        if (existingUrls.has(destination)) continue;
        // Reuse links after an interrupted save and when an older editor submits the original URL again.
        const { data: previous, error } = await client.from('ShortcodeLink').select('shortcode,domains,url')
            .eq('isAdHoc', true).eq('sourceApp', 'admin-shortener').eq('note', MESSAGE_LINK_NOTE)
            .contains('url', [destination]).order('id').limit(1).maybeSingle();
        if (error) throw new Error('Krátké odkazy se nepodařilo načíst. Zpráva zůstává neuložená.');
        const title = needsTitle.has(destination) ? await resolveWorkshopShortcodeLinkTitle(destination) : '';
        let shortUrl: string;
        if (previous?.url?.length === 1 && previous.url[0] === destination) shortUrl = createPublicShortcodeLinkUrl(previous.shortcode, previous.domains);
        else {
            // sourceApp=messages is reserved for the unlisted message page itself; destinations are ordinary redirects.
            const created = await createAdHocShortcodeLink(client, { urls: [destination], note: MESSAGE_LINK_NOTE, sourceApp: 'admin-shortener' });
            if (!created.shortcodeLink) throw new Error('Krátký odkaz se nepodařilo vytvořit. Zpráva zůstává neuložená.');
            shortUrl = createPublicShortcodeLinkUrl(created.shortcodeLink.shortcode, created.shortcodeLink.domains);
        }
        replacements.set(destination, { shortUrl, title });
    }
    const prepared = replaceWorkshopShortcodeLinkDestinations(markdown, replacements);
    if (prepared.length > 50_000) throw Object.assign(new Error('Zpráva po doplnění odkazů překračuje 50 000 znaků. Zkraťte ji prosím.'), { status: 400 });
    return prepared;
}
