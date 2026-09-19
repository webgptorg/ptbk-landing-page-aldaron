import { describe, expect, it } from 'vitest';
import {
    DEFAULT_WORKSHOP_ADMIN_VIEW_STATE,
    parseWorkshopAdminViewState,
    serializeWorkshopAdminViewState,
    type WorkshopAdminViewState,
} from './workshopAdminViewState';

function serializeViewState(viewState: WorkshopAdminViewState): string {
    return serializeWorkshopAdminViewState(viewState, new URLSearchParams()).toString();
}

describe('workshopAdminViewState', () => {
    it('opens the overview of the room the administration finds when the link says nothing', () => {
        expect(parseWorkshopAdminViewState(new URLSearchParams())).toEqual(DEFAULT_WORKSHOP_ADMIN_VIEW_STATE);
    });

    it('writes the default safe display choice into the link of the view it opens with', () => {
        expect(serializeViewState(DEFAULT_WORKSHOP_ADMIN_VIEW_STATE)).toBe('artopts=off');
    });

    it('carries the room and the section which were chosen', () => {
        const viewState = parseWorkshopAdminViewState(new URLSearchParams('workshop=srpnovy-workshop&tab=comments'));

        expect(viewState.workshopSlug).toBe('srpnovy-workshop');
        expect(viewState.section).toBe('comments');
        expect(serializeViewState(viewState)).toBe('workshop=srpnovy-workshop&tab=comments&artopts=off');
    });

    it('keeps the community paid-membership section in a shareable dashboard link', () => {
        const viewState = parseWorkshopAdminViewState(new URLSearchParams('tab=memberships&member=jana%40example.com'));

        expect(viewState.section).toBe('memberships');
        expect(serializeWorkshopAdminViewState(viewState, new URLSearchParams('member=jana%40example.com')).toString()).toBe(
            'member=jana%40example.com&tab=memberships&artopts=off',
        );
    });

    it('opens the overview when the link names a section which is not there', () => {
        expect(parseWorkshopAdminViewState(new URLSearchParams('tab=nonsense')).section).toBe('overview');
    });

    it('carries the shown lines, the chosen reaction and the zoom of the graph', () => {
        const viewState = parseWorkshopAdminViewState(
            new URLSearchParams(
                'series=comments,watchingParticipants&reaction=%F0%9F%91%8D' +
                    '&from=2026-08-23T10:00:00.000Z&to=2026-08-23T11:00:00.000Z',
            ),
        );

        expect(viewState.graph.visibleSeriesKeys).toEqual(['watchingParticipants', 'comments']);
        expect(viewState.graph.reactionEmoji).toBe('👍');
        expect(viewState.graph.zoomFromMilliseconds).toBe(Date.parse('2026-08-23T10:00:00.000Z'));
        expect(viewState.graph.zoomToMilliseconds).toBe(Date.parse('2026-08-23T11:00:00.000Z'));
    });

    it('keeps the graph while adding the explicit safe display choice to a shared link', () => {
        const search =
            'workshop=srpnovy-workshop&series=watchingParticipants%2Ccomments&reaction=%F0%9F%91%8D' +
            '&from=2026-08-23T10%3A00%3A00.000Z&to=2026-08-23T11%3A00%3A00.000Z';
        const viewState = parseWorkshopAdminViewState(new URLSearchParams(search));

        expect(serializeViewState(viewState)).toBe(
            'workshop=srpnovy-workshop&artopts=off&series=watchingParticipants%2Ccomments&reaction=%F0%9F%91%8D' +
                '&from=2026-08-23T10%3A00%3A00.000Z&to=2026-08-23T11%3A00%3A00.000Z',
        );
    });

    it('keeps the zoom of the workshop itself out of the link', () => {
        const viewState = parseWorkshopAdminViewState(new URLSearchParams('from=nonsense&to=also-nonsense'));

        expect(viewState.graph.zoomFromMilliseconds).toBeNull();
        expect(serializeViewState(viewState)).toBe('artopts=off');
    });

    it('carries the metrics an administrator wrote, and their names', () => {
        const viewState = parseWorkshopAdminViewState(
            new URLSearchParams('metrics=[{"label":"Pomoc","pattern":"pomoc|help"}]'),
        );

        expect(viewState.graph.customMetrics).toEqual([{ label: 'Pomoc', pattern: 'pomoc|help' }]);
        expect(serializeViewState(viewState)).toBe(
            `artopts=off&metrics=${encodeURIComponent('[{"label":"Pomoc","pattern":"pomoc|help"}]')}`,
        );
    });

    it('names a metric by its expression when the link gives it no name', () => {
        const viewState = parseWorkshopAdminViewState(new URLSearchParams('metrics=[{"pattern":"cena"}]'));

        expect(viewState.graph.customMetrics).toEqual([{ label: 'cena', pattern: 'cena' }]);
    });

    it('draws no custom metric at all when the link carries something which is not one', () => {
        expect(parseWorkshopAdminViewState(new URLSearchParams('metrics=%7B%7D')).graph.customMetrics).toEqual([]);
        expect(parseWorkshopAdminViewState(new URLSearchParams('metrics=not-json')).graph.customMetrics).toEqual([]);
    });

    it('keeps the parameters which do not describe the view', () => {
        const searchParams = serializeWorkshopAdminViewState(
            { ...DEFAULT_WORKSHOP_ADMIN_VIEW_STATE, section: 'settings' },
            new URLSearchParams('utm_source=newsletter'),
        );

        expect(searchParams.get('utm_source')).toBe('newsletter');
        expect(searchParams.get('tab')).toBe('settings');
        expect(searchParams.get('artopts')).toBe('off');
    });

    it('reads and writes the artificial-controls display choice explicitly', () => {
        const shownViewState = parseWorkshopAdminViewState(new URLSearchParams('artopts=on'));
        const hiddenViewState = parseWorkshopAdminViewState(new URLSearchParams('artopts=off'));

        expect(shownViewState.isArtificialOptionsShown).toBe(true);
        expect(hiddenViewState.isArtificialOptionsShown).toBe(false);
        expect(serializeViewState(shownViewState)).toBe('artopts=on');
        expect(serializeViewState(hiddenViewState)).toBe('artopts=off');
    });
});
