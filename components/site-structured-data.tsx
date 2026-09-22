'use client';

import { AI_TA_KRAJTA_PATH } from '@/businesses/ai-ta-krajta/config';
import { serializeStructuredDataNode } from '@/lib/metadata/serialize-structured-data';
import { createOrganizationStructuredData, createWebSiteStructuredData } from '@/lib/metadata/structured-data';
import { usePathname } from 'next/navigation';

const SITE_STRUCTURED_DATA = [createOrganizationStructuredData(), createWebSiteStructuredData()];

/**
 * Embeds the parent site's schema only where that identity belongs.
 *
 * The podcast publishes its own organization, website, page and podcast graph, so emitting the parent graph beside it
 * would make a single document claim two unrelated brands.
 */
export function SiteStructuredData() {
    const pathname = usePathname();
    const isAiTaKrajtaPage = pathname === AI_TA_KRAJTA_PATH;

    if (isAiTaKrajtaPage) {
        return null;
    }

    return (
        <>
            {SITE_STRUCTURED_DATA.map((node, nodeIndex) => (
                <script
                    key={`${node['@type']}-${nodeIndex}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: serializeStructuredDataNode(node) }}
                />
            ))}
        </>
    );
}
