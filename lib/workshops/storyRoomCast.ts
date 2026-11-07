import 'server-only';
import { getPreparedStoryPortraitUrl, getStoryCharacterColor, STORY_NARRATOR_VOICE, withStoryBookAppearance, withStoryBookVoice } from './storyRoomBook';

/** The four original literary roles keep their IDs, including in existing transcripts and casts. */
export const STORY_TEMPLATES = [
    { id: 'fd9de794-c83a-481f-ac9b-2b643b83087a', name: 'Alenka', avatar: 'rabbit', portrait: 'alenka', color: '#31527E',
        persona: 'Zvídavá holka z Říše divů. Všímá si nemožných věcí a klade zdvořilé otázky.',
        knowledge: 'Sledovala bílého králíka do nory. Ví, že úsměv může zůstat viset ve vzduchu i bez kočky.' },
    { id: 'c82394c6-57ce-4936-83cc-f03151126719', name: 'Sherlock Holmes', avatar: 'search', portrait: 'sherlock', color: '#555D71',
        persona: 'Klidný detektiv se suchým humorem. I drobeček na stránce je pro něj stopa.',
        knowledge: 'Bydlí na Baker Street. Raději nabídne ověřitelnou domněnku, než aby hádal.' },
    { id: 'ddc7931a-b1e0-47ac-a052-bf428368df69', name: 'Pinocchio', avatar: 'tree', portrait: 'pinocchio', color: '#8E6233',
        persona: 'Dřevěný kluk, který jedná dřív, než všechno promyslí. Umí se omluvit.',
        knowledge: 'Vyřezal ho Geppetto. Když zalže, roste mu nos.' },
    { id: '10d0f1cd-94e7-4d6e-9a08-a9c19e5f6629', name: 'Kocour v botách', avatar: 'cat', portrait: 'kocour', color: '#456A60',
        persona: 'Vynalézavý vyjednavač v naleštěných botách, zdvořilý i ke strašidlům.',
        knowledge: 'Pomohl mlynářovu synovi. Umí našlapovat tiše a domluvit překvapivou dohodu.' },
    { id: '6eb80876-bebe-4ea1-9aa5-8c84ef879a01', name: 'Červená karkulka', avatar: 'basket', portrait: 'karkulka', color: '#8E4A51',
        persona: 'Praktická průzkumnice s červenou kapucí a košíkem. Když se jí něco nezdá, řekne to nahlas.',
        knowledge: 'Zná cestu lesem k babičce a ví, že každý, kdo si nasadí čepec, ještě není babička.' },
    { id: '6eb80876-bebe-4ea1-9aa5-8c84ef879a02', name: 'Dorotka ze země Oz', avatar: 'wind', portrait: 'dorotka', color: '#526B85',
        persona: 'Odvážná a laskavá holka s pejskem Totem. Všímá si, kdo na cestě zůstal stranou.',
        knowledge: 'Vichřice ji odnesla do země Oz. Po cestě ze žlutých cihel našla nečekané kamarády.' },
    { id: '6eb80876-bebe-4ea1-9aa5-8c84ef879a03', name: 'Mauglí', avatar: 'paw', portrait: 'maugli', color: '#596747',
        persona: 'Všímavý kluk vychovaný v džungli. Umí chvíli tiše poslouchat, než se rozhodne.',
        knowledge: 'Medvěd Balú ho naučil zákony džungle. Z tlap a listí vyčte, kdo prošel kolem.' },
    { id: '6eb80876-bebe-4ea1-9aa5-8c84ef879a04', name: 'Mařenka', avatar: 'cookie', portrait: 'marenka', color: '#90624F',
        persona: 'Nápaditá a rozhodná sestra Jeníčka. Když cesta zmizí, vymyslí novou.',
        knowledge: 'Zažila perníkovou chaloupku. Ví, že drobečky nejsou nejlepší mapa, když mají ptáci hlad.' },
    { id: '6eb80876-bebe-4ea1-9aa5-8c84ef879a05', name: 'Kapitán Nemo', avatar: 'anchor', portrait: 'nemo', color: '#344D68',
        persona: 'Tajemný kapitán, který zná cenu ticha a mluví v námořnických přirovnáních.',
        knowledge: 'S ponorkou Nautilus prozkoumal hlubiny. Zajímá se o tvory, které svět ještě nepoznal.' },
    { id: '6eb80876-bebe-4ea1-9aa5-8c84ef879a06', name: 'Ošklivé káčátko', avatar: 'bird', portrait: 'kacatko', color: '#526E73',
        persona: 'Tichý pozorovatel, který ví, jaké to je nikam nezapadat. Pozve ostatní, aby šli s ním.',
        knowledge: 'Z malého káčátka vyrostla labuť. V hladině vidí věci, kterých si ostatní nevšimnou.' },
    { id: '6eb80876-bebe-4ea1-9aa5-8c84ef879a07', name: 'Baba Jaga', avatar: 'house', portrait: 'baba-jaga', color: '#6D5579',
        persona: 'Výstřední čarodějka s prudkým humorem. Ráda zkouší příchozí neškodnou hádankou.',
        knowledge: 'Její domek má kuří nohy a otáčí se podle nálady. Zná lesní pěšiny i jména všech vran.' },
] as const;

export const STORY_TEMPLATE_BY_ID = new Map<string, (typeof STORY_TEMPLATES)[number]>(
    STORY_TEMPLATES.map((character) => [character.id, character]),
);

export function getTemplateStoryBook(character: (typeof STORY_TEMPLATES)[number], override?: string) {
    return withStoryBookAppearance(
        override ?? `${character.name}\nPERSONA ${character.persona}\nKNOWLEDGE ${character.knowledge}`,
        character.color, getPreparedStoryPortraitUrl(character.portrait),
    );
}

/** Editing a role made from a managed agent starts with a safe fictional local draft. */
export function getManagedStoryBook(id: string, name: string, override?: string) {
    const isPavol = name === 'Pavol Hejný';
    const book = withStoryBookAppearance(
        override ?? `${name}\nPERSONA Zvídavý vypravěč v pohádce, který pomáhá dětem oživovat příběhy.\nRULE Mluv o tom, co se děje v příběhu.`,
        isPavol ? '#17386C' : getStoryCharacterColor(id), isPavol ? getPreparedStoryPortraitUrl('vypravec') : undefined,
    );
    return withStoryBookVoice(book, isPavol ? STORY_NARRATOR_VOICE : undefined);
}
