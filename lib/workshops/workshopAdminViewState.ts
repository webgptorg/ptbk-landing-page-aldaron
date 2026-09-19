import {
    createEnumeratedValueCodec,
    defineUrlViewParameter,
    liftUrlViewParameters,
    parseUrlViewState,
    serializeUrlViewState,
    type UrlViewParameter,
    type UrlViewValueCodec,
} from '@/lib/api/urlViewState';
import {
    DEFAULT_WORKSHOP_ADMIN_SECTION,
    WORKSHOP_ADMIN_SECTION_VALUES,
    type WorkshopAdminSection,
} from '@/lib/workshops/workshopAdminSections';
import {
    DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE,
    WORKSHOP_OVERVIEW_GRAPH_PARAMETERS,
    type WorkshopOverviewGraphState,
} from '@/lib/workshops/workshopOverviewGraphState';

/**
 * Everything which decides what the workshop administration shows, so that a whole view fits into one shareable link:
 * which room is open, which of its sections is read, what the graph of the overview draws, and whether artificial
 * activity controls are visible
 */
export type WorkshopAdminViewState = {
    /**
     * The URL slug of the open room, or `null` when the administration opens the one it finds
     */
    readonly workshopSlug: string | null;

    readonly section: WorkshopAdminSection;
    readonly graph: WorkshopOverviewGraphState;

    /**
     * Whether controls which create or alter artificial room activity are shown to the administrator.
     */
    readonly isArtificialOptionsShown: boolean;
};

export const DEFAULT_WORKSHOP_ADMIN_VIEW_STATE: WorkshopAdminViewState = {
    workshopSlug: null,
    section: DEFAULT_WORKSHOP_ADMIN_SECTION,
    graph: DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE,
    isArtificialOptionsShown: false,
};

/**
 * The name of a room in the address, which is empty for no room at all rather than for a room named by nothing
 */
const WORKSHOP_SLUG_CODEC: UrlViewValueCodec<string | null> = {
    parseValue: (parameterValue) => (parameterValue.trim() === '' ? null : parameterValue.trim()),
    serializeValue: (workshopSlug) => workshopSlug ?? '',
};

const SECTION_CODEC = createEnumeratedValueCodec(WORKSHOP_ADMIN_SECTION_VALUES);
const ARTIFICIAL_OPTIONS_QUERY_PARAMETER = 'artopts';
const ARTIFICIAL_OPTIONS_SHOWN_QUERY_VALUE = 'on';
const ARTIFICIAL_OPTIONS_HIDDEN_QUERY_VALUE = 'off';

/**
 * The short, stable wording of the administrator's display choice. It deliberately stays explicit even when off,
 * so a shared-screen link makes the currently safe view unambiguous.
 */
const ARTIFICIAL_OPTIONS_VISIBILITY_CODEC: UrlViewValueCodec<boolean> = {
    parseValue: (parameterValue) => {
        const normalizedParameterValue = parameterValue.trim().toLowerCase();

        if (normalizedParameterValue === ARTIFICIAL_OPTIONS_SHOWN_QUERY_VALUE) {
            return true;
        }

        if (normalizedParameterValue === ARTIFICIAL_OPTIONS_HIDDEN_QUERY_VALUE) {
            return false;
        }

        return null;
    },
    serializeValue: (isArtificialOptionsShown) =>
        isArtificialOptionsShown ? ARTIFICIAL_OPTIONS_SHOWN_QUERY_VALUE : ARTIFICIAL_OPTIONS_HIDDEN_QUERY_VALUE,
};

/**
 * Every value of the administration together with the query parameter which carries it
 *
 * Note: The graph describes its own parameters, so the overview says what it draws exactly once however many
 *       dashboards show it.
 */
const WORKSHOP_ADMIN_VIEW_PARAMETERS: readonly UrlViewParameter<WorkshopAdminViewState, unknown>[] = [
    defineUrlViewParameter<WorkshopAdminViewState, string | null>({
        parameterName: 'workshop',
        readValue: (viewState) => viewState.workshopSlug,
        writeValue: (viewState, workshopSlug) => ({ ...viewState, workshopSlug }),
        ...WORKSHOP_SLUG_CODEC,
    }),
    defineUrlViewParameter<WorkshopAdminViewState, WorkshopAdminSection>({
        parameterName: 'tab',
        readValue: (viewState) => viewState.section,
        writeValue: (viewState, section) => ({ ...viewState, section }),
        ...SECTION_CODEC,
    }),
    defineUrlViewParameter<WorkshopAdminViewState, boolean>({
        parameterName: ARTIFICIAL_OPTIONS_QUERY_PARAMETER,
        readValue: (viewState) => viewState.isArtificialOptionsShown,
        writeValue: (viewState, isArtificialOptionsShown) => ({ ...viewState, isArtificialOptionsShown }),
        isDefaultValueIncluded: true,
        ...ARTIFICIAL_OPTIONS_VISIBILITY_CODEC,
    }),
    ...liftUrlViewParameters<WorkshopAdminViewState, WorkshopOverviewGraphState>(WORKSHOP_OVERVIEW_GRAPH_PARAMETERS, {
        readInnerViewState: (viewState) => viewState.graph,
        writeInnerViewState: (viewState, graph) => ({ ...viewState, graph }),
    }),
];

export function parseWorkshopAdminViewState(searchParams: URLSearchParams): WorkshopAdminViewState {
    return parseUrlViewState(WORKSHOP_ADMIN_VIEW_PARAMETERS, DEFAULT_WORKSHOP_ADMIN_VIEW_STATE, searchParams);
}

export function serializeWorkshopAdminViewState(
    viewState: WorkshopAdminViewState,
    searchParams: URLSearchParams,
): URLSearchParams {
    return serializeUrlViewState(
        WORKSHOP_ADMIN_VIEW_PARAMETERS,
        DEFAULT_WORKSHOP_ADMIN_VIEW_STATE,
        viewState,
        searchParams,
    );
}
