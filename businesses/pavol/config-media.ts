import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export type PavolMediaImportance = 'highlight' | 'rest';

export type PavolMediaAppearance = {
    href: string;
    imageSrc?: string;
    source: string;
    kind: string;
    title: string;
    description: string;
    importance: PavolMediaImportance;
    thumbnailLabel?: string;
    thumbnailClassName?: string;

    /**
     * Color behind the thumbnail, for an appearance whose brand color is written down elsewhere
     *
     * Note: Tailwind only knows the classes which are spelled out in the source, so a color which comes from a
     *       configuration has to reach the thumbnail as a style rather than as a class.
     */
    thumbnailBackgroundColor?: string;
};

type LocalizedMediaCopy = Pick<PavolMediaAppearance, 'kind' | 'title' | 'description'>;

type SharedMediaAppearance = Omit<PavolMediaAppearance, 'kind' | 'title' | 'description'> & {
    copy: Record<SupportedHomepageLanguage, LocalizedMediaCopy>;
};

export const pavolMediaMoreHref = 'https://www.linkedin.com/in/hejny/';

const sharedMediaAppearances: SharedMediaAppearance[] = [
    {
        href: 'https://devconfcz2023.sched.com/event/1MYeB/2023s-most-interesting-browser-apis',
        source: 'DevConf.CZ',
        importance: 'rest',
        thumbnailLabel: 'dc',
        thumbnailClassName: 'bg-[#6f3cc3] text-white',
        copy: {
            cs: {
                kind: 'Přednáška',
                title: 'Most interesting browser APIs',
                description:
                    'Přednáška z DevConf.CZ o webových API, včetně Web Speech API, Sensor APIs, WebXR, Offscreen Canvas a File System Access API.',
            },
            en: {
                kind: 'Talk',
                title: 'Most interesting browser APIs',
                description:
                    'A DevConf.CZ talk about web APIs, including Web Speech API, Sensor APIs, WebXR, Offscreen Canvas, and the File System Access API.',
            },
        },
    },
    {
        href: 'https://www.youtube.com/watch?v=K0eMvbSID44',
        imageSrc: '/pavol/media/openalt-talk.jpg',
        source: 'OpenAlt',
        importance: 'rest',
        copy: {
            cs: {
                kind: 'Přednáška',
                title: 'Vývoj modulárních aplikací pro online vzdělávání',
                description:
                    'Přednáška o modulárních aplikacích a technickém zázemí digitálních produktů pro školství.',
            },
            en: {
                kind: 'Talk',
                title: 'Building modular apps for online education',
                description:
                    'A talk about modular applications and the technology behind digital products for education.',
            },
        },
    },
    {
        href: 'https://www.youtube.com/watch?v=i7gQtatWSKc',
        imageSrc: '/pavol/media/linuxdays-talk.jpg',
        source: 'LinuxDays',
        importance: 'rest',
        copy: {
            cs: {
                kind: 'Přednáška',
                title: 'LinuxDays - Užitečná browser APIs',
                description:
                    'Technická přednáška o méně známých browser API a o tom, jak mohou vývojářům ušetřit práci.',
            },
            en: {
                kind: 'Talk',
                title: 'LinuxDays - Useful browser APIs',
                description:
                    'A technical talk about lesser-known browser APIs and how they can save developers time.',
            },
        },
    },
    {
        href: 'https://www.euro.cz/clanky/digitalni-skamny-pandemie-rozpohybovala-zkostnatele-ceske-skolstvi/',
        imageSrc: '/pavol/media/euro-article.jpg',
        source: 'Euro.cz',
        importance: 'rest',
        copy: {
            cs: {
                kind: 'Článek',
                title: 'Digitální škamny. Pandemie rozpohybovala zkostnatělé české školství',
                description:
                    'Článek o změnách ve školství, digitalizaci a projektech kolem online výuky.',
            },
            en: {
                kind: 'Article',
                title: 'Digital school desks: the pandemic shook Czech education awake',
                description:
                    'An article about changes in education, digitalization, and projects built around online teaching.',
            },
        },
    },
];

function localizeMediaAppearance(
    language: SupportedHomepageLanguage,
    appearance: SharedMediaAppearance,
): PavolMediaAppearance {
    const { copy, ...sharedAppearance } = appearance;

    return {
        ...sharedAppearance,
        ...copy[language],
    };
}

export const pavolMediaAppearances: Record<SupportedHomepageLanguage, PavolMediaAppearance[]> = {
    cs: sharedMediaAppearances.map((appearance) => localizeMediaAppearance('cs', appearance)),
    en: sharedMediaAppearances.map((appearance) => localizeMediaAppearance('en', appearance)),
};
