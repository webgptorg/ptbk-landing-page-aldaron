import {
    AI_TA_KRAJTA_APP_ICONS,
    AI_TA_KRAJTA_BRAND_NAME,
    AI_TA_KRAJTA_COLORS,
    AI_TA_KRAJTA_COVER_IMAGE_PATH,
    AI_TA_KRAJTA_ICON_SIZE_IN_PIXELS,
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE,
} from '@/businesses/ai-ta-krajta/config';

export type AiTaKrajtaBrandColor = {
    readonly id: string;

    /**
     * Name the colour is called by, so two people can talk about it without reading hexadecimal to each other
     */
    readonly name: string;

    readonly hex: string;

    /**
     * Where the colour belongs
     */
    readonly description: string;

    /**
     * Whether the drawn snake may be placed straight onto this colour
     */
    readonly isLogoBackground: boolean;
};

export type AiTaKrajtaBrandFile = {
    readonly id: string;
    readonly label: string;

    /**
     * Where the site itself serves the file, so the brand kit hands out exactly what the show uses
     */
    readonly path: string;

    readonly description: string;
};

export type AiTaKrajtaBrandRule = {
    readonly title: string;
    readonly description: string;
};

export type AiTaKrajtaBrandNameExample = {
    readonly correct: string;
    readonly incorrect: string;
    readonly explanation: string;
};

export type AiTaKrajtaBrandBoilerplate = {
    readonly id: string;
    readonly label: string;
    readonly text: string;
};

export type AiTaKrajtaBrandTypeface = {
    readonly id: string;

    /**
     * Name the typeface is found under on Google Fonts
     */
    readonly name: string;

    /**
     * What is set in it
     */
    readonly role: string;

    readonly description: string;
};

/**
 * The two typefaces the whole site is set in, headings first
 *
 * Note: Both are loaded in `app/globals.css`, where the heading rule hands every `h1` to `h6` over to the first of
 *       them. The brand kit only writes down what is already true there.
 */
export const AI_TA_KRAJTA_BRAND_TYPEFACES: readonly AiTaKrajtaBrandTypeface[] = [
    {
        id: 'outfit',
        name: 'Outfit',
        role: 'Nadpisy',
        description:
            'Geometrický grotesk pro všechny nadpisy. Používáme ho tučně a bez velkých rozestupů mezi písmeny.',
    },
    {
        id: 'inter',
        name: 'Inter',
        role: 'Text',
        description: 'Pro běžný text, popisky a tlačítka. Zůstává čitelný i v malé velikosti a na tmavém pozadí.',
    },
];

/**
 * The palette of the show, described one colour at a time
 *
 * Note: Every value is read from `AI_TA_KRAJTA_COLORS`, which the page, the mini player, the icons and the generated
 *       sharing image already share. The brand kit therefore cannot publish a colour the show does not wear.
 */
export const AI_TA_KRAJTA_BRAND_COLORS: readonly AiTaKrajtaBrandColor[] = [
    {
        id: 'moss',
        name: 'Mechová',
        hex: AI_TA_KRAJTA_COLORS.MOSS,
        description: 'Podklad pro logo a hlavní plocha obalu pořadu.',
        isLogoBackground: true,
    },
    {
        id: 'moss-deep',
        name: 'Tmavá mechová',
        hex: AI_TA_KRAJTA_COLORS.MOSS_DEEP,
        description: 'Nejtmavší zelená na stránce. Patří do lišty prohlížeče, patičky a přehrávače.',
        isLogoBackground: true,
    },
    {
        id: 'coral',
        name: 'Korálová',
        hex: AI_TA_KRAJTA_COLORS.CORAL,
        description: 'Hlava hada a hlavní tlačítko. Držte se jedné hlavní akce na obrazovku.',
        isLogoBackground: false,
    },
    {
        id: 'indigo',
        name: 'Indigová',
        hex: AI_TA_KRAJTA_COLORS.INDIGO,
        description: 'Ocas hada, odkazy a doplňkové akcenty.',
        isLogoBackground: false,
    },
    {
        id: 'paper',
        name: 'Papírová',
        hex: AI_TA_KRAJTA_COLORS.PAPER,
        description: 'Světlý podklad pro tisk a pro místa, kde tmavá plocha nefunguje.',
        isLogoBackground: true,
    },
];

/**
 * The colours the logo may be placed on directly
 */
export const AI_TA_KRAJTA_LOGO_BACKGROUND_COLORS: readonly AiTaKrajtaBrandColor[] = AI_TA_KRAJTA_BRAND_COLORS.filter(
    (brandColor) => brandColor.isLogoBackground,
);

/**
 * Everything the brand kit hands out, all of it already served by the site itself
 */
export const AI_TA_KRAJTA_BRAND_FILES: readonly AiTaKrajtaBrandFile[] = [
    {
        id: 'logo-svg',
        label: 'Logo SVG',
        path: AI_TA_KRAJTA_APP_ICONS.SCALABLE.path,
        description:
            'Kresba hada na mechové dlaždici se zaoblenými rohy a průhledem kolem nich. Zůstane ostrá v jakékoli velikosti, od plakátu po patičku.',
    },
    {
        id: 'logo-png',
        label: `Logo PNG ${AI_TA_KRAJTA_ICON_SIZE_IN_PIXELS} × ${AI_TA_KRAJTA_ICON_SIZE_IN_PIXELS}`,
        path: AI_TA_KRAJTA_APP_ICONS.RASTER.path,
        description:
            'Stejná kresba vyplňuje celý čtverec. Hodí se tam, kde rohy zaoblí samotná plocha, třeba u dlaždic, profilovek a ikon aplikací.',
    },
    {
        id: 'cover',
        label: 'Obal pořadu JPG',
        path: AI_TA_KRAJTA_COVER_IMAGE_PATH,
        description:
            'Obal, pod kterým pořad vychází na YouTube, Spotify i v Apple Podcasts. Použijte ho, když píšete o konkrétním dílu.',
    },
];

/**
 * What to do with the logo, in the order the brand kit explains it
 */
export const AI_TA_KRAJTA_BRAND_RULES: readonly AiTaKrajtaBrandRule[] = [
    {
        title: 'Nechte hadovi místo',
        description:
            'Nechte kolem dlaždice místo aspoň na výšku hadovy hlavy. Logo nemačkejte do rámečku ani do textového bloku.',
    },
    {
        title: 'Držte kontrast',
        description:
            'Logo patří na tmavou, mechovou nebo papírovou plochu. Na fotce ho použijte jen na klidném místě, kde zůstane had čitelný.',
    },
    {
        title: 'Zmenšujte s mírou',
        description:
            'Pod zhruba 24 pixelů se z hada stane skvrna. V takové velikosti raději napište jen název pořadu.',
    },
    {
        title: 'Stahujte soubory odsud',
        description:
            'Logo na této stránce je stejné jako to, které používá lišta prohlížeče a obal pořadu. Použijte soubor odsud, ne výřez ze snímku obrazovky nebo cizí prezentace.',
    },
];

/**
 * What the logo must not go through, said plainly so nobody has to guess
 */
export const AI_TA_KRAJTA_BRAND_MISUSES: readonly string[] = [
    'Přebarvovat hada nebo dlaždici pod ním na firemní barvy.',
    'Natahovat, naklánět, otáčet nebo zrcadlit kresbu.',
    'Přidávat obrys, stín, přechod nebo efekt, který v kresbě není.',
    'Spojovat logo s jiným logem do jednoho znaku.',
    'Nahrazovat hada jiným hadem, emotikonem nebo vlastní ilustrací.',
    'Vydávat spolupráci za pořad. Partnerství označte textem, ne naším logem.',
];

/**
 * How the name of the show is written, held against the way the show writes it itself
 */
export const AI_TA_KRAJTA_BRAND_NAME_EXAMPLES: readonly AiTaKrajtaBrandNameExample[] = [
    {
        correct: AI_TA_KRAJTA_NAME,
        incorrect: 'AI Ta Krajta',
        explanation: '"ta" je obyčejné slovo uprostřed názvu, proto zůstává malé.',
    },
    {
        correct: AI_TA_KRAJTA_NAME,
        incorrect: 'AI TA KRAJTA',
        explanation: 'Velká písmena z názvu dělají křik. Nepíšeme ho tak ani v titulku, ani v perexu.',
    },
    {
        correct: AI_TA_KRAJTA_NAME,
        incorrect: 'Ai ta krajta',
        explanation: 'AI je zkratka a Krajta jméno. Obojí zůstává velké.',
    },
    {
        correct: AI_TA_KRAJTA_BRAND_NAME,
        incorrect: 'AI ta Krajta 🐍🐍',
        explanation: 'Had za názvem je nepovinný. Když ho použijete, stačí jeden. Patří do lišt a záložek, ne do vět.',
    },
];

/**
 * Text a magazine or a partner may take about the show without asking first
 */
export const AI_TA_KRAJTA_BRAND_BOILERPLATES: readonly AiTaKrajtaBrandBoilerplate[] = [
    {
        id: 'one-line',
        label: 'Jedna věta',
        text: AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE.cs,
    },
    {
        id: 'paragraph',
        label: 'Odstavec',
        text:
            `${AI_TA_KRAJTA_NAME} je český podcast o umělé inteligenci. Každý týden probírá nové modely, nástroje a ` +
            'průšvihy kolem AI a řeší, co znamenají pro lidi, kteří s ní pracují. Vychází na ' +
            'YouTube, Spotify a v Apple Podcasts. Posluchači si ho mohou přidat i do vlastní podcastové aplikace přes RSS feed.',
    },
];
