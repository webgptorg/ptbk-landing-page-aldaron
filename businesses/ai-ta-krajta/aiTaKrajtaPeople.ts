import { normalizeAiTaKrajtaSearchText } from '@/businesses/ai-ta-krajta/aiTaKrajtaTextSearch';

/**
 * Folder of `public` which every normalized portrait this page draws is kept in, shared with the rest of the site
 */
const PERSON_PORTRAIT_DIRECTORY_PATH = '/people';

/**
 * A normalized portrait is always a PNG with a real alpha channel, so the avatar component can place it on the
 * shared gradient treatment without inheriting a photographed background.
 */
export type AiTaKrajtaPortraitFileName = `${string}.png`;

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
     * Transparent PNG in `public/people` the portrait is drawn from.
     *
     * Note: `scripts/_cutAiTaKrajtaPeoplePortraits.mjs` records the published source of each portrait crop.
     */
    readonly portraitFileName: AiTaKrajtaPortraitFileName;

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
        portraitFileName: 'pavol-hejny-portrait.png',
        // Note: `pavlem` is the same ending as the one a description uses before the surname of a Pavel it talks
        //       about, as in `speciálním hostem Pavlem Ungrem`. The comma and the conjunction are what say that the
        //       sentence is listing who sat at the microphone, the same way `petrem,` does for Petr Glaser.
        mentionPatterns: ['pavol', 'pavlem,', 'pavlem a ', 'hejn'],
        episodeNumbers: [],
    },
    {
        id: 'jiri-jahn',
        name: 'Jiří Jahn',
        headline: 'Řeší, co z AI firma reálně použije. Tahá debatu k praktickým otázkám.',
        url: 'https://www.ptbk.io/jirka',
        portraitFileName: 'jiri-jahn-portrait.png',
        mentionPatterns: ['jirka', 'jirkou', 'jirkovi', 'jiří jahn', 'jiřím jahnem'],
        episodeNumbers: [],
    },
    {
        id: 'petr-glaser',
        name: 'Petr Glaser',
        headline: 'Vývojář, píše bleeding.dev. Testuje nové modely dřív, než se o nich začne psát.',
        url: 'https://bleeding.dev/',
        portraitFileName: 'petr-glaser-portrait.png',
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
        portraitFileName: 'patrik-braborec-portrait.png',
        mentionPatterns: ['patrik', 'patrikem', 'braborec'],
        episodeNumbers: [],
    },
    {
        id: 'jacek-soubusta',
        name: 'Jacek Soubusta',
        headline: 'Data a nástroje kolem AI. Umí veřejně přiznat, že vlastní MCP server spláchl do záchodu.',
        url: null,
        portraitFileName: 'jacek-soubusta-portrait.png',
        mentionPatterns: ['jacek', 'jackem', 'soubust'],
        episodeNumbers: [],
    },
    {
        id: 'simon-podhajsky',
        name: 'Šimon Podhajský',
        headline: 'Přednášel na AI Engineer o read-only AI a kognitivních výparech. Nejskeptičtější hlas u stolu.',
        url: null,
        portraitFileName: 'simon-podhajsky-portrait.png',
        mentionPatterns: ['šimon', 'šimonov', 'podhajsk'],
        episodeNumbers: [],
    },
    {
        id: 'roman-baranovic',
        name: 'Roman Baranovič',
        headline: 'Expert na digitální transformaci školství. Vrací se do dílů o AI ve školách.',
        url: 'https://narnia.sk/employees/roman-baranovic-2/',
        portraitFileName: 'roman-baranovic-portrait.png',
        mentionPatterns: ['baranovi'],
        episodeNumbers: [],
    },
    {
        id: 'katka-fajmanova',
        name: 'Katka Fajmanová',
        headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
        url: null,
        portraitFileName: 'katka-fajmanova-portrait.png',
        mentionPatterns: ['fajman'],
        episodeNumbers: [],
    },
    {
        id: 'prokop-simek',
        name: 'Prokop Simek',
        headline: 'Šéf DX Heroes, prvního sponzora podcastu. V IT je 13 let napříč vývojem, marketingem a byznysem.',
        url: 'https://prokopsimek.cz/en',
        portraitFileName: 'prokop-simek-portrait.png',
        mentionPatterns: ['prokop'],
        episodeNumbers: [],
    },
    {
        id: 'matyas-krecek',
        name: 'Matyáš Křeček',
        headline: 'I on je z DX Heroes. Pomáhá firmám zavést AI do celého vývojového procesu, dřív sám vyvíjel.',
        url: 'https://cz.linkedin.com/in/matyas-krecek',
        portraitFileName: 'matyas-krecek-portrait.png',
        mentionPatterns: ['matyáš', 'křečk'],
        episodeNumbers: [],
    },
    {
        id: 'tomas-koblizek',
        name: 'Tomáš Koblížek',
        headline: 'Analytický filozof, spoluautor knihy Dezinformace a Hate Speech.',
        url: null,
        portraitFileName: 'tomas-koblizek-portrait.png',
        mentionPatterns: ['koblíž'],
        episodeNumbers: [],
    },
    {
        id: 'adam-zvada',
        name: 'Adam Zvada',
        headline: 'Prodal Steer Code firmě Expo. Mluvil o agent engineeringu a orchestraci agentů.',
        url: null,
        portraitFileName: 'adam-zvada-portrait.png',
        mentionPatterns: ['zvad'],
        episodeNumbers: [],
    },
    {
        id: 'lukas-caha',
        name: 'Lukáš Caha',
        headline: 'Zakladatel Youklidu. Ukázal, že se dá růst i tak, že AI hype ignorujete.',
        url: 'https://youklid.cz/',
        portraitFileName: 'lukas-caha-portrait.png',
        mentionPatterns: ['caha', 'cahou', 'youklid'],
        episodeNumbers: [],
    },
    {
        id: 'richard-mladek',
        name: 'Richard Mládek',
        headline: 'Staví autonomní kódovací agenty ovládané přes Telegram. Díl o AI psychóze z produktivity.',
        url: null,
        portraitFileName: 'richard-mladek-portrait.png',
        mentionPatterns: ['mládek', 'mládk'],
        episodeNumbers: [],
    },
    {
        id: 'dalibor-krejci',
        name: 'Dalibor Krejčí',
        headline: 'Česká odnož hnutí PAUSE AI. Přišel obhájit moratorium na vývoj pokročilých modelů.',
        url: null,
        portraitFileName: 'dalibor-krejci-portrait.png',
        mentionPatterns: ['dalibor', 'krejčí', 'krejčího'],
        episodeNumbers: [],
    },
    {
        id: 'petr-brzek',
        name: 'Petr Brzek',
        headline: 'Macaly, český AI startup. Díl o tom, co drží second time founders nad vodou.',
        url: null,
        portraitFileName: 'petr-brzek-portrait.png',
        // Note: Only the instrumental case, because that is how a description says that the show talked with him.
        //       The nominative also appears in a díl which only mentions him as an example.
        mentionPatterns: ['brzkem'],
        episodeNumbers: [],
    },
    {
        id: 'petr-simecek',
        name: 'Petr Šimeček',
        headline: 'V Googlu dělal časové řady a predikci návštěvnosti. Host dílu o tom, jak se do Googlu dostat.',
        url: 'https://about.me/petr',
        portraitFileName: 'petr-simecek-portrait.png',
        mentionPatterns: ['šimeček'],
        episodeNumbers: [],
    },
    {
        id: 'tomas-kroupa',
        name: 'Tomáš Kroupa',
        headline: 'CTO Agent ID, který hlídá AI agenty deterministickými limity a auditovatelností.',
        url: 'https://cz.linkedin.com/in/tom-kroupa',
        portraitFileName: 'tomas-kroupa-portrait.png',
        mentionPatterns: ['kroup'],
        episodeNumbers: [],
    },
    {
        id: 'ondrej-sukac',
        name: 'Ondřej Sukač',
        headline: 'Spoluzakladatel Galenia, které bourá jazykové bariéry ve zdravotnictví. Studuje právo v Brně.',
        url: 'https://cz.linkedin.com/in/ondrej-sukac',
        portraitFileName: 'ondrej-sukac-portrait.png',
        mentionPatterns: ['sukač'],
        episodeNumbers: [],
    },
    {
        id: 'tomas-mikolov',
        name: 'Tomáš Mikolov',
        headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
        url: 'https://bottlecapai.com/',
        portraitFileName: 'tomas-mikolov-portrait.png',
        // Note: No `mikolov` pattern, because the show talks about him in later díly he never sat in - a description
        //       which only quotes what BottleCap AI or he himself published is not a person at the microphone.
        mentionPatterns: [],
        episodeNumbers: [23],
    },
    {
        id: 'jan-cienciala',
        name: 'Jan Cienciala',
        headline: 'V AI týmu CloudTalku dělá research a prototypy, které kolegové dotáhnou do produkce.',
        url: 'https://cz.linkedin.com/in/cienciala',
        portraitFileName: 'jan-cienciala-portrait.png',
        // Note: The transcript of díl #24 hears him as `Činčala`; he spells his own surname without háčky.
        mentionPatterns: ['ciencial', 'činčal'],
        episodeNumbers: [],
    },
    {
        id: 'lenka-sefcakova',
        name: 'Lenka Šefčáková',
        headline: 'V CloudTalku vyvíjí a prototypuje jejich AI funkce, třeba detekci hlasové schránky.',
        url: 'https://sk.linkedin.com/in/lenkasefcakova',
        portraitFileName: 'lenka-sefcakova-portrait.png',
        mentionPatterns: ['šefčák'],
        episodeNumbers: [],
    },
    {
        id: 'pavel-ungr',
        name: 'Pavel Ungr',
        headline: 'SEO konzultant s dvacetiletou praxí. Říkal, jak zviditelnit web v ChatGPT, Geminu i u Googlu.',
        url: 'https://www.pavelungr.cz/',
        portraitFileName: 'pavel-ungr-portrait.png',
        mentionPatterns: ['ungr'],
        episodeNumbers: [],
    },
    {
        id: 'matous-havlena',
        name: 'Matouš Havlena',
        headline: 'Spoluzakladatel a CTO Apoca, s IBM Research dělá aplikovaný výzkum. Host dílu o emocích v LLM.',
        url: 'https://www.havlena.com/about',
        portraitFileName: 'matous-havlena-portrait.png',
        mentionPatterns: ['havlen'],
        episodeNumbers: [],
    },
    {
        id: 'ondra',
        name: 'Ondra',
        headline: 'CTO startupu, který se snaží pomocí AI zlepšit život mladým lidem a pomoct jim s administrativou.',
        url: null,
        portraitFileName: 'ondra-portrait.png',
        // Note: The show never says his surname, so nothing here may match on a first name: `Ondra` is also what the
        //       host of díl #21 calls Ondřej Sukač. The díl he sat in is what attributes him.
        mentionPatterns: [],
        episodeNumbers: [58],
    },
];

/**
 * Address the browser loads the portrait of a person from
 *
 * @returns the address of the transparent PNG portrait
 */
export function getAiTaKrajtaPersonPortraitPath(person: AiTaKrajtaPerson): string {
    return `${PERSON_PORTRAIT_DIRECTORY_PATH}/${person.portraitFileName}`;
}

/**
 * Finds the person a link or a filter names
 *
 * @returns the person, `null` when nobody of that identifier is in the roster
 */
export function getAiTaKrajtaPersonById(personId: string | null): AiTaKrajtaPerson | null {
    return AI_TA_KRAJTA_PEOPLE.find((person) => person.id === personId) ?? null;
}

/**
 * Whether a piece of text names a person, either by their published name or by one of their mention patterns
 *
 * Note: This is the one rule which decides that a name written by a publisher and a line of the roster are the same
 *       person. Both the roster reading of a description and the credit list of an episode ask it, so the two can
 *       never disagree about who is who.
 */
export function isAiTaKrajtaPersonNamedByText(person: AiTaKrajtaPerson, text: string): boolean {
    const normalizedText = normalizeAiTaKrajtaSearchText(text);

    return (
        normalizedText === normalizeAiTaKrajtaSearchText(person.name) ||
        person.mentionPatterns.some((pattern) => normalizedText.includes(normalizeAiTaKrajtaSearchText(pattern)))
    );
}
