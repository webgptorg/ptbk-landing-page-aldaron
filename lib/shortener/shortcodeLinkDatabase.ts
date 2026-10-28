import {
    DEFAULT_SHORTCODE_LINK_SOURCE_APP,
    isShortcodeLinkSourceApp,
    type ShortcodeLink,
    type ShortcodeLinkSourceApp,
    type ShortcodeLinkSummary,
    type ShortcodeLinkValues,
} from '@/lib/shortener/shortcodeLink';
import { loadShortcodeLinkClickCounts } from '@/lib/shortener/shortcodeLinkClickDatabase';
import { CUSTOM_SHORTCODE_LINK_TYPE, SHORTCODE_LINK_TABLE_NAME } from '@/lib/shortener/shortcodeLinkConstants';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';
import { reportSupabaseError, type SupabaseErrorLike } from '@/lib/supabase/reportSupabaseError';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SHORTCODE_LINK_DATABASE_UNAVAILABLE_ERROR_MESSAGE = 'Database not configured';
const SHORTCODE_LINK_CONFLICT_ERROR_MESSAGE = 'This shortcode is already in use';
const SHORTCODE_LINK_STILL_REFERENCED_ERROR_MESSAGE =
    'This short link is still referenced by other records, apply `migrations/*.sql` so that its clicks are removed with it';

const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';
const POSTGRES_FOREIGN_KEY_VIOLATION_CODE = '23503';

/**
 * The columns of one short link which the administration reads, deliberately without the `type`, the `ownerEmail` and
 * the `appId` of the old Promptbook Studio system, none of which the administration decides. The new provenance
 * columns remain here because the administration uses them to filter the links it owns and the links other apps made.
 */
export const SHORTCODE_LINK_SELECTED_COLUMNS = 'id, createdAt, shortcode, url, note, landingPage, isAdHoc, sourceApp, domains';

export type ShortcodeLinkRow = {
    readonly domains?: readonly string[] | null;
    readonly id: number;
    readonly createdAt: string;
    readonly shortcode: string;
    readonly url: readonly string[] | null;
    readonly note: string | null;
    readonly landingPage: string | null;
    readonly isAdHoc: boolean | null;
    readonly sourceApp: string | null;
};

export type ShortcodeLinkLoadResult = {
    readonly shortcodeLinks: readonly ShortcodeLink[] | null;
    readonly errorMessage: string | null;
};

export type ShortcodeLinkSummaryLoadResult = {
    readonly shortcodeLinks: readonly ShortcodeLinkSummary[] | null;
    readonly errorMessage: string | null;
};

/**
 * Reaches the short links only through the server service role, which is the one key allowed to write them since
 * `migrations/2026-08-0500-admin-shortener.sql` took that right away from every public visitor.
 */
export function getShortcodeLinkDatabaseOrNull(): SupabaseClient | null {
    return createSupabaseServiceRoleClient();
}

export function createShortcodeLinkDatabaseUnavailableResponse(): NextResponse {
    console.error(
        `⚠️ The short links cannot be written, set SUPABASE_SERVICE_ROLE_KEY - only the service role may write the "${SHORTCODE_LINK_TABLE_NAME}" table`,
    );

    return NextResponse.json({ error: SHORTCODE_LINK_DATABASE_UNAVAILABLE_ERROR_MESSAGE }, { status: 503 });
}

/**
 * Turns a refused write into the one answer the administration can present, so that creating, editing and deleting a
 * short link all report the same causes in the same words.
 */
export function createShortcodeLinkMutationErrorResponse(
    operationName: string,
    error: SupabaseErrorLike,
): NextResponse {
    const errorMessage = reportSupabaseError(operationName, error);

    if (error.code === POSTGRES_UNIQUE_VIOLATION_CODE) {
        return NextResponse.json({ error: SHORTCODE_LINK_CONFLICT_ERROR_MESSAGE }, { status: 409 });
    }

    if (error.code === POSTGRES_FOREIGN_KEY_VIOLATION_CODE) {
        return NextResponse.json({ error: SHORTCODE_LINK_STILL_REFERENCED_ERROR_MESSAGE }, { status: 409 });
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
}

export function mapShortcodeLinkRow(shortcodeLinkRow: ShortcodeLinkRow): ShortcodeLink {
    return {
        id: shortcodeLinkRow.id,
        createdAt: shortcodeLinkRow.createdAt,
        shortcode: shortcodeLinkRow.shortcode,
        domains: shortcodeLinkRow.domains ?? null,
        urls: shortcodeLinkRow.url ?? [],
        note: shortcodeLinkRow.note,
        landingPage: shortcodeLinkRow.landingPage,
        isAdHoc: shortcodeLinkRow.isAdHoc === true,
        sourceApp: isShortcodeLinkSourceApp(shortcodeLinkRow.sourceApp)
            ? shortcodeLinkRow.sourceApp
            : DEFAULT_SHORTCODE_LINK_SOURCE_APP,
    };
}

/**
 * The columns which an administrator decides, which is everything creating and editing have in common.
 */
export function createShortcodeLinkDatabaseValues(values: ShortcodeLinkValues): Readonly<Record<string, unknown>> {
    return {
        shortcode: values.shortcode,
        url: values.urls,
        note: values.note,
        landingPage: values.landingPage,
        ...(values.domains === undefined ? {} : { domains: values.domains }),
    };
}

/**
 * What a newly created short link additionally says about itself
 *
 * Note: Editing never writes these, so that a link of the old Promptbook Studio system is not retyped or disowned by
 *       being edited here.
 */
export function createShortcodeLinkInsertValues(values: ShortcodeLinkValues): Readonly<Record<string, unknown>> {
    return {
        ...createShortcodeLinkDatabaseValues(values),
        domains: values.domains ?? null,
        type: CUSTOM_SHORTCODE_LINK_TYPE,
        ownerEmail: null,
        isAdHoc: false,
        sourceApp: DEFAULT_SHORTCODE_LINK_SOURCE_APP,
    };
}

/**
 * Values held by the application which creates one short link on behalf of a
 * workflow. They intentionally sit next to the manual creator's values above,
 * so both paths keep the old shortener columns in exactly the same shape.
 */
export function createAdHocShortcodeLinkInsertValues(values: {
    readonly shortcode: string;
    readonly urls: readonly string[];
    readonly note: string | null;
    readonly sourceApp: ShortcodeLinkSourceApp;
}): Readonly<Record<string, unknown>> {
    return {
        shortcode: values.shortcode,
        url: values.urls,
        note: values.note,
        landingPage: null,
        type: CUSTOM_SHORTCODE_LINK_TYPE,
        ownerEmail: null,
        isAdHoc: true,
        sourceApp: values.sourceApp,
    };
}

/**
 * Reads every short link there is, newest first, page by page so that a long history is not silently cut off at the
 * response cap of the database.
 */
export async function loadShortcodeLinks(supabase: SupabaseClient): Promise<ShortcodeLinkLoadResult> {
    const { rows, errorMessage } = await loadAllSupabaseRows<ShortcodeLinkRow>(
        (fromIndex, toIndex) =>
            supabase
                .from(SHORTCODE_LINK_TABLE_NAME)
                .select(SHORTCODE_LINK_SELECTED_COLUMNS)
                .order('createdAt', { ascending: false })
                .order('id', { ascending: false })
                .range(fromIndex, toIndex) as PromiseLike<{
                readonly data: readonly ShortcodeLinkRow[] | null;
                readonly error: SupabaseErrorLike | null;
            }>,
        'the listing of the short links',
    );

    return rows === null
        ? { shortcodeLinks: null, errorMessage }
        : { shortcodeLinks: rows.map(mapShortcodeLinkRow), errorMessage: null };
}

/**
 * Reads the short-link list and its click totals together. The browser receives only the aggregate with each link;
 * individual IP addresses and other click metadata stay behind the separate authenticated detail endpoint.
 */
export async function loadShortcodeLinkSummaries(supabase: SupabaseClient): Promise<ShortcodeLinkSummaryLoadResult> {
    const [shortcodeLinkLoadResult, shortcodeLinkClickCountLoadResult] = await Promise.all([
        loadShortcodeLinks(supabase),
        loadShortcodeLinkClickCounts(supabase),
    ]);

    if (shortcodeLinkLoadResult.shortcodeLinks === null) {
        return { shortcodeLinks: null, errorMessage: shortcodeLinkLoadResult.errorMessage };
    }
    const clickCountByShortcodeLinkId = shortcodeLinkClickCountLoadResult.clickCountByShortcodeLinkId;
    if (clickCountByShortcodeLinkId === null) {
        return { shortcodeLinks: null, errorMessage: shortcodeLinkClickCountLoadResult.errorMessage };
    }

    return {
        shortcodeLinks: shortcodeLinkLoadResult.shortcodeLinks.map((shortcodeLink) => ({
            ...shortcodeLink,
            clickCount: clickCountByShortcodeLinkId.get(shortcodeLink.id) ?? 0,
        })),
        errorMessage: null,
    };
}
