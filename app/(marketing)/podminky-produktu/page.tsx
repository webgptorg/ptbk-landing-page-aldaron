import { NewLegalPage } from '@/businesses/new/NewLegalPage';
import { LEGAL_PAGE_METADATA } from '@/lib/legal/legalPageMetadata';

export const metadata = LEGAL_PAGE_METADATA.productTerms.cs;
/** Published discussion draft with an explicit non-effective status. */
export default function Page() { return <NewLegalPage kind="productTerms" />; }
