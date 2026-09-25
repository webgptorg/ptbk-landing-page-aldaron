import { PrimarySiteStructuredData } from './primary-site-structured-data';

/** The root layout must not emit Promptbook's organization graph on another public domain. */
export function SiteStructuredData({ isBrandedSite }: { readonly isBrandedSite: boolean }) {
    if (isBrandedSite) {
        return null;
    }

    return <PrimarySiteStructuredData />;
}
