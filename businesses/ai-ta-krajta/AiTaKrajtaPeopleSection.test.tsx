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
        isTeamMember: true,
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
    it('separates the team from invited guests without losing either person', () => {
        render(<AiTaKrajtaPeopleSection />);

        const team = screen.getByRole('list', { name: 'Tým podcastu' });
        const guests = screen.getByRole('list', { name: 'Hosté podcastu', hidden: true });

        expect(within(team).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['První člověk']);
        expect(within(guests).getAllByRole('listitem', { hidden: true }).map((item) => item.textContent)).toEqual(['Druhý člověk']);
        expect(within(team).queryByText('Druhý člověk')).toBeNull();
        expect(screen.getByText('Hosté podcastu (1)')).toBeDefined();
    });
});
