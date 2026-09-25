'use client';

import { getPublicDomainRouteByInternalPathname } from '@/lib/domains/publicDomainRouting';
import { serializeStructuredDataNode } from '@/lib/metadata/serialize-structured-data';
import { createOrganizationStructuredData, createWebSiteStructuredData } from '@/lib/metadata/structured-data';
import { usePathname } from 'next/navigation';

const SITE_STRUCTURED_DATA = [createOrganizationStructuredData(), createWebSiteStructuredData()];

/** Local and preview hosts can render a branded internal route without borrowing Promptbook's schema. */
export function PrimarySiteStructuredData() {
    const pathname = usePathname();

    if (getPublicDomainRouteByInternalPathname(pathname)) {
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
