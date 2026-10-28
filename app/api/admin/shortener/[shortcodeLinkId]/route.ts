import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { SHORTCODE_LINK_TABLE_NAME } from '@/lib/shortener/shortcodeLinkConstants';
import { parseShortcodeLinkId } from '@/lib/shortener/shortcodeLinkId';
import {
    createShortcodeLinkDatabaseUnavailableResponse,
    createShortcodeLinkDatabaseValues,
    createShortcodeLinkMutationErrorResponse,
    getShortcodeLinkDatabaseOrNull,
    mapShortcodeLinkRow,
    SHORTCODE_LINK_SELECTED_COLUMNS,
    type ShortcodeLinkRow,
} from '@/lib/shortener/shortcodeLinkDatabase';
import { SHORTCODE_LINK_VALUES_SCHEMA } from '@/lib/shortener/shortcodeLinkSchema';
import { NextRequest, NextResponse } from 'next/server';

const SHORTCODE_LINK_NOT_FOUND_ERROR_MESSAGE = 'Short link not found';
const INVALID_SHORTCODE_LINK_ERROR_MESSAGE = 'Invalid short link';

type ShortcodeLinkRouteContext = {
    readonly params: Promise<{ readonly shortcodeLinkId: string }>;
};

async function readShortcodeLinkId(context: ShortcodeLinkRouteContext): Promise<number | null> {
    const { shortcodeLinkId } = await context.params;
    return parseShortcodeLinkId(shortcodeLinkId);
}

function createShortcodeLinkNotFoundResponse(): NextResponse {
    return NextResponse.json({ error: SHORTCODE_LINK_NOT_FOUND_ERROR_MESSAGE }, { status: 404 });
}

/**
 * Rewrites one short link, so that an address which was already handed out can be pointed somewhere else instead of
 * being replaced by a second one.
 */
export async function PATCH(request: NextRequest, context: ShortcodeLinkRouteContext) {
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

    const shortcodeLinkId = await readShortcodeLinkId(context);
    if (shortcodeLinkId === null) {
        return createShortcodeLinkNotFoundResponse();
    }

    const supabase = getShortcodeLinkDatabaseOrNull();
    if (supabase === null) {
        return createShortcodeLinkDatabaseUnavailableResponse();
    }

    const { data, error } = await supabase
        .from(SHORTCODE_LINK_TABLE_NAME)
        .update(createShortcodeLinkDatabaseValues(parsedResult.data))
        .eq('id', shortcodeLinkId)
        .select(SHORTCODE_LINK_SELECTED_COLUMNS)
        .maybeSingle();
    if (error !== null) {
        return createShortcodeLinkMutationErrorResponse('the editing of a short link', error);
    }
    if (data === null) {
        return createShortcodeLinkNotFoundResponse();
    }

    return NextResponse.json({ shortcodeLink: mapShortcodeLinkRow(data as unknown as ShortcodeLinkRow) });
}

/**
 * Removes one short link for good, together with the clicks which were measured on it.
 */
export async function DELETE(request: NextRequest, context: ShortcodeLinkRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const shortcodeLinkId = await readShortcodeLinkId(context);
    if (shortcodeLinkId === null) {
        return createShortcodeLinkNotFoundResponse();
    }

    const supabase = getShortcodeLinkDatabaseOrNull();
    if (supabase === null) {
        return createShortcodeLinkDatabaseUnavailableResponse();
    }

    const { data, error } = await supabase
        .from(SHORTCODE_LINK_TABLE_NAME)
        .delete()
        .eq('id', shortcodeLinkId)
        .select('id')
        .maybeSingle();
    if (error !== null) {
        return createShortcodeLinkMutationErrorResponse('the deletion of a short link', error);
    }

    return data === null ? createShortcodeLinkNotFoundResponse() : NextResponse.json({ isDeleted: true });
}
