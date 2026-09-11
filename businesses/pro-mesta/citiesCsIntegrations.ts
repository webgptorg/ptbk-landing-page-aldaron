import chatAsset from '@/public/integrations/chat.png';
import gmailAsset from '@/public/integrations/gmail.png';
import graphAsset from '@/public/integrations/graph.png';
import { Integration } from '../../components/integrations-section';

// TODO: !!! [🌆] `/pro-mesta` Figure out best integrations
// TODO: !!! [🌆] `/pro-mesta` Better copy of `citiesCsIntegrations`

export const citiesCsIntegrations: Array<Integration> = [
    {
        preview: chatAsset,
        title: 'Asistent pro úředníky',
        description:
            'Pomůže s dokumenty, usneseními a zápisy. Hlídá přitom interní směrnice a legislativu.',
        features: ['Kontroluje formální správnost', 'Drží se standardů města', 'Méně času na administrativu'],
    },
    {
        preview: graphAsset,
        title: 'Znalostní báze úřadu',
        description:
            'Interní předpisy, metodiky a zkušenosti najdete na jednom místě. Odbory pak mohou rozhodovat rychleji a jednotněji.',
        features: ['Rychlé hledání v dokumentech', 'Sdílené zkušenosti mezi odbory', 'Přizpůsobení vašemu městu'],
    },
    {
        preview: chatAsset,
        title: 'Virtuální asistent pro občany',
        description:
            'Chatbot na webu města odpoví na dotazy k úředním hodinám, životním situacím i místním akcím.',
        features: ['Dostupný 24 hodin denně, 7 dní v týdnu', 'Odpovědi podle aktuálních dat města', 'Méně dotazů na infolince'],
    },
    {
        preview: gmailAsset,
        title: 'E-mailová podatelna',
        description:
            'Příchozí e-maily roztřídí podle agendy a připraví návrh odpovědi pro rychlejší vyřízení.',
        features: ['Třídění podle tématu', 'Návrh odpovědi jedním kliknutím', 'Rychlejší vyřízení'],
    },
];
