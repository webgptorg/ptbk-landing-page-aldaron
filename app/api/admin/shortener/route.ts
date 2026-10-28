import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { SHORTCODE_LINK_TABLE_NAME } from '@/lib/shortener/shortcodeLinkConstants';
import {
    createShortcodeLinkDatabaseUnavailableResponse,
    createShortcodeLinkInsertValues,
    createShortcodeLinkMutationErrorResponse,
    getShortcodeLinkDatabaseOrNull,
    loadShortcodeLinkSummaries,
    mapShortcodeLinkRow,
    SHORTCODE_LINK_SELECTED_COLUMNS,
    type ShortcodeLinkRow,
} from '@/lib/shortener/shortcodeLinkDatabase';
import { SHORTCODE_LINK_VALUES_SCHEMA } from '@/lib/shortener/shortcodeLinkSchema';
import { NextRequest, NextResponse } from 'next/server';

const INVALID_SHORTCODE_LINK_ERROR_MESSAGE = 'Invalid short link';

/**
 * Lists every short link for the administration, which is the only reader allowed to see them all at once.
 */
export async function GET(request: NextRequest) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const supabase = getShortcodeLinkDatabaseOrNull();
    if (supabase === null) {
        return createShortcodeLinkDatabaseUnavailableResponse();
    }

    const { shortcodeLinks, errorMessage } = await loadShortcodeLinkSummaries(supabase);

    return shortcodeLinks === null
        ? NextResponse.json({ error: errorMessage }, { status: 500 })
        : NextResponse.json({ shortcodeLinks }, { headers: { 'Cache-Control': 'no-store' } });
}

/**
 * Creates a public short link after the session of the administrator and the supplied values have both been verified.
 */
export async function POST(request: NextRequest) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = SHORTCODE_LINK_VALUES_SCHEMA.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? INVALID_SHORTCODE_LINK_ERROR_MESSAGE },
            { status: 400 },
        );
    }

    const supabase = getShortcodeLinkDatabaseOrNull();
    if (supabase === null) {
        return createShortcodeLinkDatabaseUnavailableResponse();
    }

    const { data, error } = await supabase
        .from(SHORTCODE_LINK_TABLE_NAME)
        .insert(createShortcodeLinkInsertValues(parsedResult.data))
        .select(SHORTCODE_LINK_SELECTED_COLUMNS)
        .single();
    if (error !== null) {
        return createShortcodeLinkMutationErrorResponse('the creation of a short link', error);
    }

    return NextResponse.json(
        { shortcodeLink: mapShortcodeLinkRow(data as unknown as ShortcodeLinkRow) },
        { status: 201 },
    );
}
