import type { AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import type { CreateRandomNumber } from '@/lib/random/CreateRandomNumber';
import { shuffleByWeight } from '@/lib/random/shuffleByWeight';

/**
 * Chance a person carries before a single episode of theirs is counted in
 *
 * Note: Without it somebody the archive names in no episode would weigh nothing and could never come out anywhere but
 *       last. One episode is therefore worth twice as much as none rather than infinitely more.
 */
const BASE_PERSON_WEIGHT = 1;

/**
 * Multiplier used for a person whose roster entry does not set one
 */
const DEFAULT_PERSON_FACTOR = 1;

/**
 * Multiplier of a person's credited episode appearances when drawing the roster
 */
function getPersonFactor(person: AiTaKrajtaPerson): number {
    return person.factor ?? DEFAULT_PERSON_FACTOR;
}

/**
 * How much of the front of the list one person has a chance at, which is how often the show has them on
 */
function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;

    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
}

/**
 * The people of the show from the most often heard to the least often heard
 *
 * Note: This is the order the draw below leans towards and the one the page is built in before anybody draws anything.
 *       People heard equally often keep the order of the roster, because sorting here never moves what it does not
 *       have to.
 */
export function orderAiTaKrajtaPeopleByAppearances(
    people: readonly AiTaKrajtaPerson[],
    episodeCountByPersonId: ReadonlyMap<string, number>,
): readonly AiTaKrajtaPerson[] {
    return [...people].sort(
        (firstPerson, secondPerson) =>
            getPersonWeight(secondPerson, episodeCountByPersonId) -
            getPersonWeight(firstPerson, episodeCountByPersonId),
    );
}

/**
 * The people of the show in a freshly drawn order which still leans on how often they are heard
 *
 * Note: A roster written down once has the same person on top of it every single time, which reads as a ranking the
 *       show never made. The draw keeps the list alive between visits while somebody who is on every other episode
 *       still comes up high far more often than somebody named in one díl.
 */
export function shuffleAiTaKrajtaPeopleByAppearances(
    people: readonly AiTaKrajtaPerson[],
    episodeCountByPersonId: ReadonlyMap<string, number>,
    createRandomNumber: CreateRandomNumber,
): readonly AiTaKrajtaPerson[] {
    return shuffleByWeight(people, {
        getWeight: (person) => getPersonWeight(person, episodeCountByPersonId),
        createRandomNumber,
    });
}
