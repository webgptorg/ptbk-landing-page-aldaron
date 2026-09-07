/**
 * @vitest-environment jsdom
 */

import { AI_TA_KRAJTA_PEOPLE } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import { orderAiTaKrajtaPeopleByAppearances } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder';
import { useAiTaKrajtaOrderedPeople } from '@/businesses/ai-ta-krajta/useAiTaKrajtaOrderedPeople';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * How many times a test which watches the draw opens the section again
 */
const MOUNT_COUNT = 20;

/**
 * An archive which names one person far more often than anybody else, so that the leaning of the draw is visible
 */
const EPISODE_COUNT_BY_PERSON_ID: ReadonlyMap<string, number> = new Map([['petr-brzek', 99]]);

const PERSON_IDS_OF_ROSTER = AI_TA_KRAJTA_PEOPLE.map((person) => person.id);

afterEach(cleanup);

/**
 * Opens the section once and writes down the roster of every single render it made
 *
 * Note: The first of them is what the server sends and what the browser hydrates against, which is why the test reads
 *       the renders one by one instead of only their outcome.
 */
function renderPeopleOrders(): readonly (readonly string[])[] {
    const renderedOrders: (readonly string[])[] = [];

    function PeopleOrderProbe() {
        renderedOrders.push(useAiTaKrajtaOrderedPeople(EPISODE_COUNT_BY_PERSON_ID).map((person) => person.id));

        return null;
    }

    render(<PeopleOrderProbe />);

    return renderedOrders;
}

/**
 * The roster as it stands once the draw has been made
 */
function renderDrawnPeopleOrder(): readonly string[] {
    const renderedOrders = renderPeopleOrders();

    return renderedOrders[renderedOrders.length - 1];
}

describe('useAiTaKrajtaOrderedPeople', () => {
    it('renders the order the draw leans towards first, so that the browser hydrates into the built page', () => {
        const [firstRenderedOrder] = renderPeopleOrders();

        expect(firstRenderedOrder).toEqual(
            orderAiTaKrajtaPeopleByAppearances(AI_TA_KRAJTA_PEOPLE, EPISODE_COUNT_BY_PERSON_ID).map(
                (person) => person.id,
            ),
        );
        expect(firstRenderedOrder[0]).toBe('petr-brzek');
    });

    it('draws its own order once the section is alive in the browser', () => {
        const renderedOrders = renderPeopleOrders();

        expect(renderedOrders.length).toBeGreaterThan(1);
        expect([...renderDrawnPeopleOrder()].sort()).toEqual([...PERSON_IDS_OF_ROSTER].sort());
    });

    it('does not show the same order to every visit', () => {
        const drawnOrders = Array.from({ length: MOUNT_COUNT }, () => renderDrawnPeopleOrder().join(' '));

        expect(new Set(drawnOrders).size).toBeGreaterThan(1);
    });
});
