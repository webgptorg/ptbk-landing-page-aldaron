import { WhitepaperPage } from '@/businesses/whitepaper/WhitepaperPage';
import { WHITEPAPER_METADATA } from '@/businesses/whitepaper/whitepaperMetadata';

export const metadata = WHITEPAPER_METADATA.en;

export default function Page() {
    return <WhitepaperPage language="en" />;
}
