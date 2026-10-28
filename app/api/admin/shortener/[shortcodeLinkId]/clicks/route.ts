import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { loadShortcodeLinkClicks } from '@/lib/shortener/shortcodeLinkClickDatabase';
import { getShortcodeLinkDatabaseOrNull, createShortcodeLinkDatabaseUnavailableResponse } from '@/lib/shortener/shortcodeLinkDatabase';
import { parseShortcodeLinkId } from '@/lib/shortener/shortcodeLinkId';
import { NextRequest, NextResponse } from 'next/server';

const INVALID_SHORTCODE_LINK_ERROR_MESSAGE = 'Short link not found';

type ShortcodeLinkClickRouteContext = {
    readonly params: Promise<{ readonly shortcodeLinkId: string }>;
};

async function readShortcodeLinkId(context: ShortcodeLinkClickRouteContext): Promise<number | null> {
    const { shortcodeLinkId } = await context.params;

    return parseShortcodeLinkId(shortcodeLinkId);
}

/**
 * Lists the navigation history of one public short link. This is intentionally separate from the collection endpoint:
 * its individual IP addresses and request metadata are sent only after an administrator explicitly opens one link.
 */
export async function GET(request: NextRequest, context: ShortcodeLinkClickRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const shortcodeLinkId = await readShortcodeLinkId(context);
    if (shortcodeLinkId === null) {
        return NextResponse.json({ error: INVALID_SHORTCODE_LINK_ERROR_MESSAGE }, { status: 404 });
    }

    const supabase = getShortcodeLinkDatabaseOrNull();
    if (supabase === null) {
        return createShortcodeLinkDatabaseUnavailableResponse();
    }

    const { shortcodeLinkClicks, errorMessage } = await loadShortcodeLinkClicks(supabase, shortcodeLinkId);

    return shortcodeLinkClicks === null
        ? NextResponse.json({ error: errorMessage }, { status: 500 })
        : NextResponse.json({ shortcodeLinkClicks }, { headers: { 'Cache-Control': 'no-store' } });
}
