import { AI_TA_KRAJTA_BRAND_NAME, AI_TA_KRAJTA_MANIFEST_PATH } from '@/businesses/ai-ta-krajta/config';
import { AI_TA_KRAJTA_METADATA, AI_TA_KRAJTA_VIEWPORT } from '@/businesses/ai-ta-krajta/aiTaKrajtaMetadata';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    applicationName: AI_TA_KRAJTA_BRAND_NAME,
    creator: AI_TA_KRAJTA_BRAND_NAME,
    publisher: AI_TA_KRAJTA_BRAND_NAME,
    icons: AI_TA_KRAJTA_METADATA.icons,
    manifest: AI_TA_KRAJTA_MANIFEST_PATH,
};

export const viewport = AI_TA_KRAJTA_VIEWPORT;

export default function AiTaKrajtaLayout({ children }: { readonly children: React.ReactNode }) {
    return children;
}
