/**
 * Folder of `public` which every portrait this page draws is kept in, shared with the rest of the site
 */
const PERSON_PHOTO_DIRECTORY_PATH = '/people';

export type AiTaKrajtaPerson = {
    /**
     * Identifier which the filter of the episode list carries in the address of the page
     */
    readonly id: string;

    readonly name: string;

    /**
     * What the person does, in one line and only as far as the episodes of the show actually say it
     */
    readonly headline: string;

    /**
     * Where the person can be found, `null` when they publish no page of their own
     */
    readonly url: string | null;

    /**
     * File of `public/people` the portrait of the person is drawn from, `null` when the page draws their initials
     *
     * Note: `scripts/_cutAiTaKrajtaPeoplePortraits.mjs` cuts these files and records where each of them comes from.
     */
    readonly photoFileName: string | null;

    /**
     * Pieces of text which name this person in an episode title or description, including Czech declensions
     *
     * Note: They are matched without regard to letter case, so `koblíž` finds both `Koblížek` and `Koblížkem`. Keep
     *       them long enough not to match a different word - a wrong face next to an episode is worse than none.
     */
    readonly mentionPatterns: readonly string[];

    /**
     * Episodes this person took part in but which do not name them
     *
     * Note: The podcast feed is the source of truth and most descriptions do name who is at the microphone. This list
     *       is here for the rest, so an editor can attribute an episode by hand without touching any component.
     */
    readonly episodeNumbers: readonly number[];
};

/**
 * Everyone the show has introduced by name
 *
 * Note: Every line here is taken from the episode descriptions of the show or from the site itself. Nobody is given a
 *       title the show has not given them.
 *
 * Note: This is the roster, not the order the page shows it in - `aiTaKrajtaPeopleOrder.ts` draws that one. The order
 *       written down here is only what people the archive names equally often fall back on.
 */
export const AI_TA_KRAJTA_PEOPLE: readonly AiTaKrajtaPerson[] = [
    {
        id: 'pavol-hejny',
        name: 'Pavol Hejný',
        headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
        url: 'https://www.ptbk.io/pavol',
        photoFileName: 'pavol-hejny-transparent-square.png',
        mentionPatterns: ['pavol', 'pavlem', 'hejn'],
        episodeNumbers: [],
    },
    {
        id: 'jiri-jahn',
        name: 'Jiří Jahn',
        headline: 'Řeší, co z AI firma reálně použije. Tahá debatu k praktickým otázkám.',
        url: 'https://www.ptbk.io/jirka',
        photoFileName: 'jiri-jahn-transparent-square.png',
        mentionPatterns: ['jirka', 'jirkou', 'jirkovi', 'jiří jahn', 'jiřím jahnem'],
        episodeNumbers: [],
    },
    {
        id: 'petr-glaser',
        name: 'Petr Glaser',
        headline: 'Vývojář, píše bleeding.dev. Testuje nové modely dřív, než se o nich začne psát.',
        url: 'https://bleeding.dev/',
        photoFileName: 'petr-glaser.jpg',
        // Note: Plain `petrem` would also catch the díl with Petrem Brzkem, so the patterns keep the comma and the
        //       conjunction which the descriptions write when they list who sat at the microphone.
        mentionPatterns: ['glaser', 'petrem,', 'petrem a '],
        episodeNumbers: [],
    },
    {
        id: 'patrik-braborec',
        name: 'Patrik Braborec',
        headline: 'Součást klasické sestavy podcastu. Drží díly pohromadě a hlídá, aby debata nesklouzla do hype.',
        url: null,
        photoFileName: 'patrik-braborec.jpg',
        mentionPatterns: ['patrik', 'patrikem', 'braborec'],
        episodeNumbers: [],
    },
    {
        id: 'jacek-soubusta',
        name: 'Jacek Soubusta',
        headline: 'Data a nástroje kolem AI. Umí veřejně přiznat, že vlastní MCP server spláchl do záchodu.',
        url: null,
        photoFileName: 'jacek-soubusta.jpg',
        mentionPatterns: ['jacek', 'jackem', 'soubust'],
        episodeNumbers: [],
    },
    {
        id: 'simon-podhajsky',
        name: 'Šimon Podhajský',
        headline: 'Přednášel na AI Engineer o read-only AI a kognitivních výparech. Nejskeptičtější hlas u stolu.',
        url: null,
        photoFileName: 'simon-podhajsky.jpg',
        mentionPatterns: ['šimon', 'šimonov', 'podhajsk'],
        episodeNumbers: [],
    },
    {
        id: 'roman-baranovic',
        name: 'Roman Baranovič',
        headline: 'Expert na digitální transformaci školství. Vrací se do dílů o AI ve školách.',
        url: 'https://narnia.sk/employees/roman-baranovic-2/',
        photoFileName: 'roman-baranovic.jpg',
        mentionPatterns: ['baranovi'],
        episodeNumbers: [],
    },
    {
        id: 'katka-fajmanova',
        name: 'Katka Fajmanová',
        headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
        url: null,
        photoFileName: 'katka-fajmanova.jpg',
        mentionPatterns: ['fajman'],
        episodeNumbers: [],
    },
    {
        id: 'tomas-koblizek',
        name: 'Tomáš Koblížek',
        headline: 'Analytický filozof, spoluautor knihy Dezinformace a Hate Speech.',
        url: null,
        photoFileName: 'tomas-koblizek.jpg',
        mentionPatterns: ['koblíž'],
        episodeNumbers: [],
    },
    {
        id: 'adam-zvada',
        name: 'Adam Zvada',
        headline: 'Prodal Steer Code firmě Expo. Mluvil o agent engineeringu a orchestraci agentů.',
        url: null,
        photoFileName: 'adam-zvada.jpg',
        mentionPatterns: ['zvad'],
        episodeNumbers: [],
    },
    {
        id: 'lukas-caha',
        name: 'Lukáš Caha',
        headline: 'Zakladatel Youklidu. Ukázal, že se dá růst i tak, že AI hype ignorujete.',
        url: 'https://youklid.cz/',
        photoFileName: 'lukas-caha.jpg',
        mentionPatterns: ['caha', 'cahou', 'youklid'],
        episodeNumbers: [],
    },
    {
        id: 'richard-mladek',
        name: 'Richard Mládek',
        headline: 'Staví autonomní kódovací agenty ovládané přes Telegram. Díl o AI psychóze z produktivity.',
        url: null,
        photoFileName: 'richard-mladek.jpg',
        mentionPatterns: ['mládek', 'mládk'],
        episodeNumbers: [],
    },
    {
        id: 'dalibor-krejci',
        name: 'Dalibor Krejčí',
        headline: 'Česká odnož hnutí PAUSE AI. Přišel obhájit moratorium na vývoj pokročilých modelů.',
        url: null,
        photoFileName: 'dalibor-krejci.jpg',
        mentionPatterns: ['dalibor', 'krejčí', 'krejčího'],
        episodeNumbers: [],
    },
    {
        id: 'petr-brzek',
        name: 'Petr Brzek',
        headline: 'Macaly, český AI startup. Díl o tom, co drží second time founders nad vodou.',
        url: null,
        photoFileName: 'petr-brzek.jpg',
        // Note: Only the instrumental case, because that is how a description says that the show talked with him.
        //       The nominative also appears in a díl which only mentions him as an example.
        mentionPatterns: ['brzkem'],
        episodeNumbers: [],
    },
];

/**
 * Address the browser loads the portrait of a person from
 *
 * @returns the address, `null` for a person the show has no picture of
 */
export function getAiTaKrajtaPersonPhotoPath(person: AiTaKrajtaPerson): string | null {
    return person.photoFileName === null ? null : `${PERSON_PHOTO_DIRECTORY_PATH}/${person.photoFileName}`;
}

/**
 * Finds the person a link or a filter names
 *
 * @returns the person, `null` when nobody of that identifier is in the roster
 */
export function getAiTaKrajtaPersonById(personId: string | null): AiTaKrajtaPerson | null {
    return AI_TA_KRAJTA_PEOPLE.find((person) => person.id === personId) ?? null;
}
