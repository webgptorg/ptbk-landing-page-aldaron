/**
 * @vitest-environment jsdom
 */

import type { AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const PEOPLE_SECTION_MOCKS = vi.hoisted(() => ({
    orderedPeople: [] as readonly { readonly id: string; readonly name: string }[],
    pageState: {
        archive: { episodes: [] },
        viewState: { personId: null },
        togglePersonFilter: vi.fn(),
    },
}));

vi.mock('@/businesses/ai-ta-krajta/AiTaKrajtaPageState', () => ({
    useAiTaKrajtaPageState: () => PEOPLE_SECTION_MOCKS.pageState,
}));

vi.mock('@/businesses/ai-ta-krajta/useAiTaKrajtaOrderedPeople', () => ({
    useAiTaKrajtaOrderedPeople: () => PEOPLE_SECTION_MOCKS.orderedPeople,
}));

vi.mock('@/businesses/ai-ta-krajta/AiTaKrajtaPersonCard', () => ({
    AiTaKrajtaPersonCard: ({ person }: { readonly person: { readonly name: string } }) => <span>{person.name}</span>,
}));

import { AiTaKrajtaPeopleSection } from './AiTaKrajtaPeopleSection';

const ORDERED_PEOPLE: readonly AiTaKrajtaPerson[] = [
    {
        id: 'first-person',
        name: 'První člověk',
        headline: 'Často mluví v dílech.',
        url: null,
        photoFileName: null,
        mentionPatterns: [],
        episodeNumbers: [],
    },
    {
        id: 'second-person',
        name: 'Druhý člověk',
        headline: 'Také se objevuje v archivu.',
        url: null,
        photoFileName: null,
        mentionPatterns: [],
        episodeNumbers: [],
    },
];

beforeEach(() => {
    PEOPLE_SECTION_MOCKS.orderedPeople = ORDERED_PEOPLE;
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('AI ta Krajta people section', () => {
    it('renders the drawn roster as one list in its received order', () => {
        render(<AiTaKrajtaPeopleSection />);

        const peopleList = screen.getByRole('list');

        expect(screen.getAllByRole('list')).toHaveLength(1);
        expect(
            within(peopleList)
                .getAllByRole('listitem')
                .map((item) => item.textContent),
        ).toEqual(ORDERED_PEOPLE.map((person) => person.name));
        expect(screen.queryByText('U mikrofonu')).toBeNull();
        expect(screen.queryByText('Byli u nás')).toBeNull();
    });
});
