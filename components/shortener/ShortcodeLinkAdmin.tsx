'use client';

import { flushAdminSaves, runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';

import { ShortcodeLinkClickTable } from '@/components/shortener/ShortcodeLinkClickTable';
import { ShortcodeLinkEditForm } from '@/components/shortener/ShortcodeLinkEditForm';
import { ShortcodeLinkTable } from '@/components/shortener/ShortcodeLinkTable';
import { useShortcodeLinkAdminViewState } from '@/components/shortener/useShortcodeLinkAdminViewState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UrlShortener } from '@/components/url-shortener';
import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { AdminEditorDialog } from '@/components/admin/AdminEditorDialog';
import {
    createPublicShortcodeLinkUrl,
    getShortcodeLinkCreationLabel,
    getShortcodeLinkSourceAppLabel,
    SHORTCODE_LINK_SOURCE_APP_VALUES,
    type ShortcodeLink,
    type ShortcodeLinkClick,
    type ShortcodeLinkSummary,
    type ShortcodeLinkValues,
} from '@/lib/shortener/shortcodeLink';
import {
    type ShortcodeLinkCreationFilter,
    type ShortcodeLinkSortBy,
    type ShortcodeLinkSortDirection,
} from '@/lib/shortener/shortcodeLinkAdminViewState';
import {
    deleteAdminShortcodeLink,
    fetchAdminShortcodeLinkClicks,
    fetchAdminShortcodeLinks,
    updateAdminShortcodeLink,
} from '@/lib/shortener/shortcodeLinkAdminApiClient';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const SHORTCODE_LINK_LOADING_ERROR_MESSAGE = 'The short links could not be loaded';
const SHORTCODE_LINK_CLICKS_LOADING_ERROR_MESSAGE = 'The short-link clicks could not be loaded';
const SHORTCODE_LINK_SAVING_ERROR_MESSAGE = 'The short link could not be saved';
const SHORTCODE_LINK_DELETION_ERROR_MESSAGE = 'The short link could not be deleted';

/**
 * Whether one short link answers to what an administrator is looking for.
 */
function isShortcodeLinkMatchingSearch(shortcodeLink: ShortcodeLink, normalizedSearchQuery: string): boolean {
    const searchedTexts = [shortcodeLink.shortcode, shortcodeLink.note ?? '', ...shortcodeLink.urls];

    return searchedTexts.some((searchedText) => searchedText.toLowerCase().includes(normalizedSearchQuery));
}

function filterShortcodeLinks(
    shortcodeLinks: readonly ShortcodeLinkSummary[],
    searchQuery: string,
    creationFilter: ShortcodeLinkCreationFilter,
    sourceAppFilter: ShortcodeLinkSummary['sourceApp'] | 'all',
): readonly ShortcodeLinkSummary[] {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return shortcodeLinks.filter(
        (shortcodeLink) =>
            (normalizedSearchQuery === '' || isShortcodeLinkMatchingSearch(shortcodeLink, normalizedSearchQuery)) &&
            (creationFilter === 'all' ||
                (creationFilter === 'ad-hoc' ? shortcodeLink.isAdHoc : !shortcodeLink.isAdHoc)) &&
            (sourceAppFilter === 'all' || sourceAppFilter === shortcodeLink.sourceApp),
    );
}

function compareShortcodeLinks(
    firstShortcodeLink: ShortcodeLinkSummary,
    secondShortcodeLink: ShortcodeLinkSummary,
    sortBy: ShortcodeLinkSortBy,
): number {
    switch (sortBy) {
        case 'creation':
            return getShortcodeLinkCreationLabel(firstShortcodeLink.isAdHoc).localeCompare(
                getShortcodeLinkCreationLabel(secondShortcodeLink.isAdHoc),
            );
        case 'sourceApp':
            return getShortcodeLinkSourceAppLabel(firstShortcodeLink.sourceApp).localeCompare(
                getShortcodeLinkSourceAppLabel(secondShortcodeLink.sourceApp),
            );
        case 'createdAt':
            return firstShortcodeLink.createdAt.localeCompare(secondShortcodeLink.createdAt);
    }
}

function sortShortcodeLinks(
    shortcodeLinks: readonly ShortcodeLinkSummary[],
    sortBy: ShortcodeLinkSortBy,
    sortDirection: ShortcodeLinkSortDirection,
): readonly ShortcodeLinkSummary[] {
    const sortMultiplier = sortDirection === 'ascending' ? 1 : -1;

    return [...shortcodeLinks].sort(
        (firstShortcodeLink, secondShortcodeLink) =>
            sortMultiplier * compareShortcodeLinks(firstShortcodeLink, secondShortcodeLink, sortBy) ||
            sortMultiplier * (firstShortcodeLink.id - secondShortcodeLink.id),
    );
}

/**
 * Holds the list of every short link and the writes which change it, while the creation of a new link stays in the
 * shortener form, editing stays in its own form, and one selected link reveals its click history.
 */
export function ShortcodeLinkAdmin() {
    const {
        searchQuery,
        creationFilter,
        sourceAppFilter,
        sortBy,
        sortDirection,
        selectedShortcodeLinkId,
        changeShortcodeLinkAdminViewState,
    } = useShortcodeLinkAdminViewState();
    const [shortcodeLinks, setShortcodeLinks] = useState<readonly ShortcodeLinkSummary[]>([]);
    const [shortcodeLinkClicks, setShortcodeLinkClicks] = useState<readonly ShortcodeLinkClick[]>([]);
    const [editedShortcodeLink, setEditedShortcodeLink] = useState<ShortcodeLink | null>(null);
    const [deletedShortcodeLinkId, setDeletedShortcodeLinkId] = useState<number | null>(null);
    const [isLoadingShortcodeLinks, setIsLoadingShortcodeLinks] = useState(true);
    const [isShortcodeLinksLoaded, setIsShortcodeLinksLoaded] = useState(false);
    const [isClicksLoading, setIsClicksLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [clicksErrorMessage, setClicksErrorMessage] = useState<string | null>(null);

    const loadShortcodeLinks = useCallback(async (): Promise<boolean> => {
        setIsLoadingShortcodeLinks(true);

        try {
            const loadedShortcodeLinks = await fetchAdminShortcodeLinks();
            setShortcodeLinks(loadedShortcodeLinks);
            setIsShortcodeLinksLoaded(true);
            setErrorMessage(null);
            return true;
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : SHORTCODE_LINK_LOADING_ERROR_MESSAGE);
            return false;
        } finally {
            setIsLoadingShortcodeLinks(false);
        }
    }, []);

    useEffect(() => {
        void loadShortcodeLinks();
    }, [loadShortcodeLinks]);

    const selectedShortcodeLink = useMemo(
        () => shortcodeLinks.find((shortcodeLink) => shortcodeLink.id === selectedShortcodeLinkId),
        [selectedShortcodeLinkId, shortcodeLinks],
    );

    useEffect(() => {
        if (selectedShortcodeLink === undefined) {
            setShortcodeLinkClicks([]);
            setClicksErrorMessage(null);
            setIsClicksLoading(false);
            return;
        }

        let isCurrentClickHistory = true;
        const loadShortcodeLinkClicks = async () => {
            setIsClicksLoading(true);
            setClicksErrorMessage(null);

            try {
                const loadedShortcodeLinkClicks = await fetchAdminShortcodeLinkClicks(selectedShortcodeLink.id);
                if (isCurrentClickHistory) {
                    setShortcodeLinkClicks(loadedShortcodeLinkClicks);
                }
            } catch (error) {
                if (isCurrentClickHistory) {
                    setShortcodeLinkClicks([]);
                    setClicksErrorMessage(
                        error instanceof Error ? error.message : SHORTCODE_LINK_CLICKS_LOADING_ERROR_MESSAGE,
                    );
                }
            } finally {
                if (isCurrentClickHistory) {
                    setIsClicksLoading(false);
                }
            }
        };

        void loadShortcodeLinkClicks();

        return () => {
            isCurrentClickHistory = false;
        };
    }, [selectedShortcodeLink]);

    const handleSave = async (values: ShortcodeLinkValues): Promise<boolean> => {
        if (editedShortcodeLink === null) {
            return false;
        }

        try {
            await updateAdminShortcodeLink(editedShortcodeLink.id, values);
            await loadShortcodeLinks();
            return true;
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : SHORTCODE_LINK_SAVING_ERROR_MESSAGE);
            return false;
        }
    };

    const handleDelete = async (shortcodeLink: ShortcodeLink) => {
        const isDeletionConfirmed = window.confirm(
            `Delete ${createPublicShortcodeLinkUrl(shortcodeLink.shortcode)} for good, together with the clicks measured on it?`,
        );
        if (!isDeletionConfirmed) {
            return;
        }
        if (!(await flushAdminSaves())) return;

        setDeletedShortcodeLinkId(shortcodeLink.id);
        try {
            await deleteAdminShortcodeLink(shortcodeLink.id);
            if (editedShortcodeLink?.id === shortcodeLink.id) {
                setEditedShortcodeLink(null);
            }
            if (selectedShortcodeLinkId === shortcodeLink.id) {
                changeShortcodeLinkAdminViewState({ selectedShortcodeLinkId: null });
            }
            await loadShortcodeLinks();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : SHORTCODE_LINK_DELETION_ERROR_MESSAGE);
        } finally {
            setDeletedShortcodeLinkId(null);
        }
    };

    const shownShortcodeLinks = useMemo(
        () =>
            sortShortcodeLinks(
                filterShortcodeLinks(shortcodeLinks, searchQuery, creationFilter, sourceAppFilter),
                sortBy,
                sortDirection,
            ),
        [creationFilter, searchQuery, shortcodeLinks, sortBy, sortDirection, sourceAppFilter],
    );

    return (
        <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
            <AdminEditorButton label="New short link" title="New short link">
                <UrlShortener onShortcodeLinkCreated={() => void loadShortcodeLinks()} />
            </AdminEditorButton>

            {editedShortcodeLink !== null && (
                <AdminEditorDialog isOpen onClose={() => setEditedShortcodeLink(null)} title={`Edit short link: ${editedShortcodeLink.shortcode}`} errorMessage={errorMessage}>
                    <ShortcodeLinkEditForm
                        key={editedShortcodeLink.id}
                        shortcodeLink={editedShortcodeLink}
                        onSave={handleSave}
                        onCancelEditing={() => setEditedShortcodeLink(null)}
                    />
                </AdminEditorDialog>
            )}

            {selectedShortcodeLink !== undefined && (
                <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-cyan-100 px-6 py-5">
                        <div>
                            <h2 className="text-xl font-bold text-slate-950">
                                Click history for {selectedShortcodeLink.shortcode}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {selectedShortcodeLink.clickCount} recorded{' '}
                                {selectedShortcodeLink.clickCount === 1 ? 'navigation' : 'navigations'} of{' '}
                                {createPublicShortcodeLinkUrl(selectedShortcodeLink.shortcode)}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => changeShortcodeLinkAdminViewState({ selectedShortcodeLinkId: null })}
                        >
                            Close click history
                        </Button>
                    </div>

                    {clicksErrorMessage !== null && (
                        <p className="m-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{clicksErrorMessage}</p>
                    )}

                    {isClicksLoading ? (
                        <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500">
                            <Loader2 className="h-5 w-5 animate-spin" /> Loading the clicks…
                        </div>
                    ) : clicksErrorMessage === null && shortcodeLinkClicks.length === 0 ? (
                        <p className="px-6 py-16 text-center text-sm text-slate-500">
                            This short link has not been opened yet.
                        </p>
                    ) : clicksErrorMessage === null ? (
                        <ShortcodeLinkClickTable shortcodeLinkClicks={shortcodeLinkClicks} />
                    ) : null}
                </section>
            )}

            {isShortcodeLinksLoaded && selectedShortcodeLinkId !== null && selectedShortcodeLink === undefined && (
                <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-900">
                    <p>The short link whose click history was requested no longer exists.</p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => changeShortcodeLinkAdminViewState({ selectedShortcodeLinkId: null })}
                    >
                        Close click history
                    </Button>
                </section>
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-950">All shortened links</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {shownShortcodeLinks.length === shortcodeLinks.length
                                ? `${shortcodeLinks.length} links`
                                : `${shownShortcodeLinks.length} of ${shortcodeLinks.length} links`}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Input
                            type="search"
                            value={searchQuery}
                            onChange={(event) =>
                                changeShortcodeLinkAdminViewState({ searchQuery: event.target.value })
                            }
                            placeholder="Search shortcode, URL or note"
                            className="w-64"
                        />
                        <select
                            aria-label="Creation type"
                            value={creationFilter}
                            onChange={(event) =>
                                changeShortcodeLinkAdminViewState({
                                    creationFilter: event.target.value as ShortcodeLinkCreationFilter,
                                })
                            }
                            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
                        >
                            <option value="all">All creation types</option>
                            <option value="manual">Created manually</option>
                            <option value="ad-hoc">Ad hoc</option>
                        </select>
                        <select
                            aria-label="Source application"
                            value={sourceAppFilter}
                            onChange={(event) =>
                                changeShortcodeLinkAdminViewState({
                                    sourceAppFilter: event.target.value as ShortcodeLinkSummary['sourceApp'] | 'all',
                                })
                            }
                            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
                        >
                            <option value="all">All applications</option>
                            {SHORTCODE_LINK_SOURCE_APP_VALUES.map((sourceApp) => (
                                <option key={sourceApp} value={sourceApp}>
                                    {getShortcodeLinkSourceAppLabel(sourceApp)}
                                </option>
                            ))}
                        </select>
                        <select
                            aria-label="Sort short links by"
                            value={sortBy}
                            onChange={(event) =>
                                changeShortcodeLinkAdminViewState({ sortBy: event.target.value as ShortcodeLinkSortBy })
                            }
                            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
                        >
                            <option value="createdAt">Sort by created</option>
                            <option value="creation">Sort by creation type</option>
                            <option value="sourceApp">Sort by application</option>
                        </select>
                        <select
                            aria-label="Short-link sort direction"
                            value={sortDirection}
                            onChange={(event) =>
                                changeShortcodeLinkAdminViewState({
                                    sortDirection: event.target.value as ShortcodeLinkSortDirection,
                                })
                            }
                            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
                        >
                            <option value="descending">Descending</option>
                            <option value="ascending">Ascending</option>
                        </select>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void loadShortcodeLinks()}
                            disabled={isLoadingShortcodeLinks}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>

                {errorMessage !== null && (
                    <p className="m-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
                )}

                {isLoadingShortcodeLinks && shortcodeLinks.length === 0 ? (
                    <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading the short links…
                    </div>
                ) : shownShortcodeLinks.length === 0 ? (
                    <p className="px-6 py-16 text-center text-sm text-slate-500">
                        {shortcodeLinks.length === 0
                            ? 'There is no shortened link yet.'
                            : 'No shortened link matches the filters.'}
                    </p>
                ) : (
                    <ShortcodeLinkTable
                        shortcodeLinks={shownShortcodeLinks}
                        editedShortcodeLinkId={editedShortcodeLink?.id ?? null}
                        deletedShortcodeLinkId={deletedShortcodeLinkId}
                        onEdit={(link) => void runAfterAdminSaves(() => setEditedShortcodeLink(link))}
                        onDelete={(shortcodeLink) => void handleDelete(shortcodeLink)}
                        onShowClicks={(shortcodeLink) =>
                            changeShortcodeLinkAdminViewState({ selectedShortcodeLinkId: shortcodeLink.id })
                        }
                    />
                )}
            </section>
        </div>
    );
}
