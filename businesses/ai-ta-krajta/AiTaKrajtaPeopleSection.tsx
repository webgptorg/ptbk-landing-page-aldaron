'use client';

import { useAiTaKrajtaPageState } from '@/businesses/ai-ta-krajta/AiTaKrajtaPageState';
import { countAiTaKrajtaEpisodesByPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import { AiTaKrajtaPersonCard } from '@/businesses/ai-ta-krajta/AiTaKrajtaPersonCard';
import { useAiTaKrajtaOrderedPeople } from '@/businesses/ai-ta-krajta/useAiTaKrajtaOrderedPeople';
import { AI_TA_KRAJTA_SECTION_IDS } from '@/businesses/ai-ta-krajta/config';
import { useMemo } from 'react';

/**
 * People of the show, each of them a button which narrows the archive down to their episodes
 */
export function AiTaKrajtaPeopleSection() {
    const { archive, viewState, togglePersonFilter } = useAiTaKrajtaPageState();

    const episodeCountByPersonId = useMemo(() => countAiTaKrajtaEpisodesByPerson(archive.episodes), [archive.episodes]);

    const orderedPeople = useAiTaKrajtaOrderedPeople(episodeCountByPersonId);

    const team = orderedPeople.filter((person) => person.isTeamMember);
    const guests = orderedPeople.filter((person) => !person.isTeamMember);

    const renderPeople = (people: typeof orderedPeople, label: string) => (
        <ul aria-label={label} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
                <li key={person.id}>
                    <AiTaKrajtaPersonCard
                        person={person}
                        episodeCount={episodeCountByPersonId.get(person.id) ?? 0}
                        isSelected={viewState.personId === person.id}
                        onSelect={() => handleSelect(person.id)}
                    />
                </li>
            ))}
        </ul>
    );

    const handleSelect = (personId: string) => {
        togglePersonFilter(personId);

        // Note: The cards are below the archive they filter, so the visitor has to be taken back up to see what their
        //       click did. The hash makes that destination shareable and lets the browser perform the anchor scroll.
        window.location.hash = AI_TA_KRAJTA_SECTION_IDS.EPISODES;
    };

    return (
        <section
            id={AI_TA_KRAJTA_SECTION_IDS.PEOPLE}
            className="scroll-mt-28 md:scroll-mt-20 border-t border-white/10 py-16 sm:py-20"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Kdo v tom jede</h2>
                <p className="mt-3 max-w-2xl text-white/60">
                    Podcast připravuje náš tým. Do jednotlivých dílů zveme hosty podle tématu.
                    Kliknutím na člověka najdete jeho díly.
                </p>

                <h3 className="mt-10 text-xl font-semibold text-white">Tým podcastu</h3>
                {renderPeople(team, 'Tým podcastu')}

                <details className="mt-10 border-t border-white/10 pt-6">
                    <summary className="cursor-pointer text-xl font-semibold text-white">
                        Hosté podcastu ({guests.length})
                    </summary>
                    {renderPeople(guests, 'Hosté podcastu')}
                </details>
            </div>
        </section>
    );
}
