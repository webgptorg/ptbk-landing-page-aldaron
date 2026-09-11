import { FeatureCard } from '@/components/feature-cards-section';
import { Briefcase, ClipboardList, Code, Gauge, GitBranch, Search, Shield, Target, Users } from 'lucide-react';

export interface HackathonFactoryHighlight {
    value: string;
    label: string;
    description: string;
}

export const hackathonFactoryHighlights: HackathonFactoryHighlight[] = [
    {
        value: '1-2 dny',
        label: 'sprint',
        description: 'Online nebo prezenčně. Vždy nad jedním konkrétním zadáním z praxe.',
    },
    {
        value: '0 Kč',
        label: 'zveřejnění zadání',
        description: 'Úvodní konzultace a posouzení zadání jsou bez závazků.',
    },
    {
        value: 'Prototyp / plán / rozhodnutí',
        label: 'výstup',
        description: 'Výstup, který můžete druhý den použít ve firmě, produktu nebo interním procesu.',
    },
];

export const hackathonFactoryProcessNote = (
    <>
        <strong>Není to soutěž o tričko.</strong> Na konci máte <strong>funkční prototyp</strong>,{' '}
        <strong>rozhodnutí</strong> nebo <strong>plán</strong>, který můžete hned další den použít.
    </>
);

export const hackathonFactoryProcess: FeatureCard[] = [
    {
        icon: ClipboardList,
        eyebrow: '1',
        title: 'Zadání problému',
        description: 'Pošlete nám krátký brief. Společně ho zpřesníme tak, aby se dal vyřešit během jednoho sprintu.',
        items: [
            'Krátký formulář nebo rychlý hovor.',
            'Ujasníme si rozsah, omezení, data a očekávaný výstup.',
            'Schválené zadání a podklady pro účastníky.',
        ],
        highlight: 'Do 2 týdnů před akcí',
    },
    {
        icon: Code,
        eyebrow: '2',
        title: 'Hackathon sprint',
        description: 'Vývojáři na zadání pracují v reálném čase. Na konci ukážou, co skutečně vzniklo.',
        items: [
            '1-2 dny, online nebo prezenčně.',
            'Funkční demo, prototyp nebo podklad pro rozhodnutí.',
            'Dokumentace, ke které se dá vrátit i po sprintu.',
        ],
        highlight: 'Funkční výstup, ne slide deck',
    },
    {
        icon: Users,
        eyebrow: '3',
        title: 'Navázání spolupráce',
        description: 'Když si s týmem nebo jednotlivcem sednete, pomůžeme vám domluvit pokračování po hackathonu.',
        items: [
            'Pokračování po sprintu podle dohody.',
            'Doporučení lidí, kteří vašemu problému rozuměli nejlépe.',
            'Bez provize a bez vynucené vazby.',
        ],
        highlight: 'Férové propojení',
    },
];

export const hackathonFactoryAudience: FeatureCard[] = [
    {
        icon: Briefcase,
        eyebrow: 'Máte problém k řešení',
        title: 'Pro firmy, startupy, CTO i lidi se zadáním',
        description:
            'Chcete rychle a levně zjistit, co je reálně možné, bez dalšího náboru a bez velkého projektu naslepo.',
        items: [
            'Máte produkt, proces nebo interní nástroj, který by šel zlepšit.',
            'Chcete rychle otestovat hypotézu nebo nový směr.',
            'Chcete vidět funkční výsledek, než investujete víc.',
            'Nevíte, kde začít, ale chcete z problému udělat konkrétní brief.',
            'Hledáte lidi, se kterými můžete pokračovat.',
        ],
        highlight: 'Reálné zadání z vaší praxe',
    },
    {
        icon: Target,
        eyebrow: 'Chcete řešit problémy',
        title: 'Pro developery, designéry a technology',
        description: 'Baví vás něco postavit a chcete mít v portfoliu projekty, které fungují v praxi.',
        items: [
            'Preferujete konkrétní brief před umělou soutěžní výzvou.',
            'Chcete řešit problém z reálného provozu firmy nebo produktu.',
            'Zajímá vás spolupráce i po hackathonu.',
            'Dává vám smysl rychlé prototypování, ověřování a rozhodování.',
        ],
        highlight: 'Pro ty, kdo chtějí stavět',
    },
];

export const hackathonFactorySituations: FeatureCard[] = [
    {
        icon: Search,
        title: '"Vyplatí se nám tahle automatizace nebo AI ve workflow?"',
        description: 'Sprint rychle ukáže, co má smysl otestovat a podle čeho se rozhodnout.',
    },
    {
        icon: Code,
        title: '"Máme nápad, ale nemáme kapacitu na interní prototyp."',
        description: 'Za sprint zjistíte, co funguje a co zatím nemá cenu stavět.',
    },
    {
        icon: Gauge,
        title: '"Chceme zjistit, jaká řešení existují bez závazku k drahému projektu."',
        description: 'Nejdřív uvidíte reálné možnosti. O větší investici rozhodnete až potom.',
    },
    {
        icon: Users,
        title: '"Chceme najít vývojáře nebo tým pro další spolupráci."',
        description: 'Uvidíte technické řešení i to, jak se vám s lidmi pracuje.',
    },
    {
        icon: GitBranch,
        title: '"Chceme přidat novou technologii do produktu, ale nevíme kudy. Chceme vidět víc možností."',
        description: 'Různé týmy ukážou různé cesty. Vy je porovnáte podle výsledku, ne podle slibů.',
    },
    {
        icon: ClipboardList,
        title: '"Nevíme, kde začít. Potřebujeme z problému udělat konkrétní brief."',
        description: 'Společně zadání zúžíme tak, aby za 1-2 dny vedlo k prototypu nebo rozhodnutí.',
    },
];

export const hackathonFactoryPrinciplesNote = (
    <>Když zadání pro Hackathon Factory nesedí, řekneme to rovnou a doporučíme jiný postup.</>
);

export const hackathonFactoryPrinciples: FeatureCard[] = [
    {
        icon: GitBranch,
        title: 'Iterativní',
        description: 'Na výsledek se dá navázat dalším sprintem nebo implementací.',
    },
    {
        icon: Shield,
        title: 'Udržitelné',
        description: 'Zadání musí dávat smysl i po hackathonu, ne jen během dvou dnů.',
    },
    {
        icon: Target,
        title: 'Reálné',
        description: 'Vágní nebo nerealizovatelná zadání odmítáme. Nevedla by k použitelnému výsledku.',
    },
];
