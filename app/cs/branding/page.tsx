import { BrandingPage } from '@/businesses/branding/BrandingPage';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { BRANDING_PAGE_DEFINITIONS } from '@/lib/metadata/site-page-definitions';
export const metadata = createPageMetadata(BRANDING_PAGE_DEFINITIONS.cs);
export default function Page() { return <BrandingPage language="cs"/>; }
