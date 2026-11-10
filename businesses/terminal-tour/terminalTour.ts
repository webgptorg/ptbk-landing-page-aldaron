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
        description: 'V průvodci otevřeném klávesou N popiš běžnou řečí, co má Promptbook dělat a kdy se má zeptat.',
        imagePath: `${MEDIA_PATH}/04-agenda.webp`,
        imageAlt: 'Zadání agendy běžnou řečí v terminálovém průvodci.',
    },
    {
        id: 'vysledek',
        title: 'Zkontroluj uložený projekt',
        description: 'Ověření nástroje AI se v záznamu nepodařilo. Průvodce spuštěný samostatně uložil zadání Péče o kontakty a připravil první úlohu.',
        commands: ['ptbk init --no-harness'],
        note: 'Vzdálené prostředí nepovolilo lokální IPC spojení potřebné pro službu na pozadí. Záznam končí uložením projektu před spuštěním úlohy.',
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
type AgendaFrame = {
    readonly title: string;
    readonly imagePath: string;
    readonly imageAlt: string;
};

export const TERMINAL_TOUR_OTHER_AGENDAS = [
    {
        title: 'Správa podcastu',
        imagePath: `${MEDIA_PATH}/06-podcast.webp`,
        imageAlt: 'Zadání agendy pro správu podcastu v terminálovém průvodci.',
    },
    {
        title: 'Údržba webu',
        imagePath: `${MEDIA_PATH}/07-web.webp`,
        imageAlt: 'Zadání agendy pro údržbu webu v terminálovém průvodci.',
    },
] as const satisfies readonly AgendaFrame[];

export const TERMINAL_TOUR_ARTICLE_FRAMES: ReadonlyMap<string, AgendaFrame> = new Map<string, AgendaFrame>([
    ['pece-o-kontakty', {
        title: 'Péče o kontakty',
        imagePath: `${MEDIA_PATH}/08-contacts.webp`,
        imageAlt: 'Zadání agendy pro péči o kontakty v terminálovém průvodci.',
    }],
    ['sprava-podcastu', TERMINAL_TOUR_OTHER_AGENDAS[0]],
    ['udrzba-webu', TERMINAL_TOUR_OTHER_AGENDAS[1]],
]);
