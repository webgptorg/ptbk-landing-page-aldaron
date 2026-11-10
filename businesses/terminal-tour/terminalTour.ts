import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';

export const TERMINAL_TOUR_PATH = '/cs/terminal';
const MEDIA_PATH = '/terminal-tour';

export const TERMINAL_TOUR_VIDEO_PATH = `${MEDIA_PATH}/walkthrough.mp4`;
export const TERMINAL_TOUR_RECORDED_VERSION = '0.119.0-85';
export const TERMINAL_TOUR_STEPS = [
    {
        id: 'instalace',
        title: 'Nainstaluj Promptbook',
        description: 'Nainstaluj balíček a ověř verzi, která se spouští.',
        commands: ['npm install --global ptbk', 'ptbk --version'],
        imagePath: `${MEDIA_PATH}/01-install.webp`,
        imageAlt: 'Terminál při instalaci Promptbooku.',
    },
    {
        id: 'konzole',
        title: 'Otevři globální konzoli',
        description: 'Globální konzole zobrazí projekty a umožní založit nový.',
        commands: ['ptbk dashboard --global'],
        imagePath: `${MEDIA_PATH}/02-console.webp`,
        imageAlt: 'Globální konzole Promptbooku s přehledem projektů.',
    },
    {
        id: 'projekt',
        title: 'Otevři průvodce projektem',
        description: 'V konzoli stiskni N a vyber složku, ve které bude Promptbook pracovat.',
        imagePath: `${MEDIA_PATH}/03-project.webp`,
        imageAlt: 'Zakládání projektu v globální konzoli.',
    },
    {
        id: 'agenda',
        title: 'Popiš agendu',
        description: 'V záznamu pokračujeme bez připojeného nástroje AI. V průvodci napiš běžnou řečí, co má Promptbook dělat a kdy se má zeptat.',
        commands: ['ptbk init --no-harness'],
        imagePath: `${MEDIA_PATH}/04-agenda.webp`,
        imageAlt: 'Zadání agendy běžnou řečí v terminálovém průvodci.',
    },
    {
        id: 'vysledek',
        title: 'Zkontroluj uložený projekt',
        description: 'Průvodce uložil zadání Péče o kontakty a připravil první úlohu. Ke spuštění úlohy připoj funkční nástroj AI.',
        imagePath: `${MEDIA_PATH}/05-result.webp`,
        imageAlt: 'Uložený projekt Péče o kontakty po dokončení průvodce.',
    },
] as const;

export const TERMINAL_TOUR_PAGE_DEFINITION: PageMetadataDefinition = {
    path: TERMINAL_TOUR_PATH,
    language: 'cs',
    title: 'Promptbook v terminálu | Promptbook',
    socialTitle: 'Promptbook v terminálu',
    description: 'Záznam z terminálu od instalace Promptbooku přes globální konzoli po založení projektu a zadání první agendy.',
    isSocialPreviewImageGenerated: true,
};

export const TERMINAL_TOUR_ARTICLE_SECTION_ID = 'jak-tuhle-agendu-spustit';
export const TERMINAL_TOUR_ARTICLE_SLUGS: ReadonlySet<string> = new Set([
    'pece-o-kontakty',
    'sprava-podcastu',
    'udrzba-webu',
]);
