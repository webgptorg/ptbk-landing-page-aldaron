import { downloadWhitepaper } from '@/businesses/whitepaper/whitepaperDocument';

export function GET() {
    return downloadWhitepaper('en');
}
