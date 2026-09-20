'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * How long the changes of a view are collected before the address bar is written, so that typing into a filter does
 * not rewrite the link letter by letter
 */
const URL_VIEW_STATE_DEBOUNCE_MILLISECONDS = 300;

type UseUrlSynchronizedViewStateOptions<TViewState> = {
    readonly parseViewState: (searchParams: URLSearchParams) => TViewState;
    readonly serializeViewState: (viewState: TViewState, searchParams: URLSearchParams) => URLSearchParams;
};

type UseUrlSynchronizedViewStateResult<TViewState> = readonly [
    TViewState,
    (changeViewState: (previousViewState: TViewState) => TViewState, options?: { readonly isImmediate?: boolean }) => void,
];

/**
 * Build the address of the page which is open, with the given query parameters
 */
function buildUrlWithSearchParams(searchParams: URLSearchParams): string {
    const search = searchParams.toString();

    return `${window.location.pathname}${search === '' ? '' : `?${search}`}${window.location.hash}`;
}

/**
 * A view kept in the URL, so that the link to exactly the same view can be shared
 *
 * Note: The link is read when the page opens and whenever the browser navigates to another view. A local change keeps
 *       control during its brief write debounce, so typing into a filter remains as smooth as with plain state.
 */
export function useUrlSynchronizedViewState<TViewState>({
    parseViewState,
    serializeViewState,
}: UseUrlSynchronizedViewStateOptions<TViewState>): UseUrlSynchronizedViewStateResult<TViewState> {
    const searchParams = useSearchParams();
    const searchParametersText = searchParams.toString();

    const [viewState, setViewState] = useState<TViewState>(() =>
        parseViewState(new URLSearchParams(searchParametersText)),
    );
    const viewStateReference = useRef(viewState);
    const lastObservedSearchParametersTextReference = useRef(searchParametersText);
    const isLocalViewStateChangePendingReference = useRef(false);

    const writeViewStateToUrl = useCallback((currentViewState: TViewState) => {
        const currentSearchParams = new URLSearchParams(window.location.search);
        const newSearchParams = serializeViewState(currentViewState, currentSearchParams);
        if (newSearchParams.toString() !== currentSearchParams.toString()) {
            window.history.replaceState(null, '', buildUrlWithSearchParams(newSearchParams));
        }
        lastObservedSearchParametersTextReference.current = newSearchParams.toString();
        isLocalViewStateChangePendingReference.current = false;
    }, [serializeViewState]);

    useEffect(() => {
        viewStateReference.current = viewState;
    }, [viewState]);

    useEffect(() => {
        const isSearchParametersChanged =
            searchParametersText !== lastObservedSearchParametersTextReference.current;
        lastObservedSearchParametersTextReference.current = searchParametersText;

        // A local form change waits briefly before it writes the URL. Do not let the still-old URL overwrite that
        // change, but do follow an actual navigation such as a link from a participant to their membership.
        if (isLocalViewStateChangePendingReference.current && !isSearchParametersChanged) {
            return;
        }

        const currentSearchParameters = new URLSearchParams(searchParametersText);
        const currentViewStateSearchParameters = serializeViewState(
            viewStateReference.current,
            new URLSearchParams(searchParametersText),
        );
        if (currentViewStateSearchParameters.toString() === currentSearchParameters.toString()) {
            return;
        }

        isLocalViewStateChangePendingReference.current = false;
        setViewState(parseViewState(currentSearchParameters));
    }, [parseViewState, searchParametersText, serializeViewState]);

    useEffect(() => {
        const urlUpdateTimeout = setTimeout(() => {
            const currentSearchParams = new URLSearchParams(window.location.search);
            const currentSearchParametersText = currentSearchParams.toString();

            // If a navigation won the race with the debounce, follow it instead of replacing it with a stale local
            // filter value.
            if (currentSearchParametersText !== lastObservedSearchParametersTextReference.current) {
                lastObservedSearchParametersTextReference.current = currentSearchParametersText;
                isLocalViewStateChangePendingReference.current = false;
                setViewState(parseViewState(currentSearchParams));
                return;
            }

            // Note: The entry in the history is replaced and not pushed, so that the back button leaves the dashboard
            //       instead of walking back through every single change of the view
            writeViewStateToUrl(viewState);
        }, URL_VIEW_STATE_DEBOUNCE_MILLISECONDS);

        return () => clearTimeout(urlUpdateTimeout);
    }, [parseViewState, viewState, writeViewStateToUrl]);

    const changeViewState = useCallback(
        (getNewViewState: (previousViewState: TViewState) => TViewState, options?: { readonly isImmediate?: boolean }) => {
            isLocalViewStateChangePendingReference.current = true;
            const newViewState = getNewViewState(viewStateReference.current);
            viewStateReference.current = newViewState;
            setViewState(newViewState);
            // A save may finish immediately before navigation. Its URL change must finish before the router leaves.
            if (options?.isImmediate) writeViewStateToUrl(newViewState);
        },
        [writeViewStateToUrl],
    );

    return [viewState, changeViewState];
}
