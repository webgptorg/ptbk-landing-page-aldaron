import chatAsset from '@/public/integrations/chat.png';
import gmailAsset from '@/public/integrations/gmail.png';
import graphAsset from '@/public/integrations/graph.png';
import { Integration } from '@/components/integrations-section';

export const forAgroIntegrations: Integration[] = [
    {
        preview: chatAsset,
        title: 'Agronomický AI expert',
        description:
            'Odpovídá na dotazy k chorobám plodin, výživě, správě půdy a osvědčeným postupům podle vašich interních metodik.',
        features: [
            'Jednotná doporučení pro terénní týmy',
            'Symptomy a postupy najdete rychle',
            'Interní metodiky i sezónní doporučení na jednom místě',
        ],
    },
    {
        preview: graphAsset,
        title: 'Asistent pro regulatorní compliance',
        description:
            'Pomáhá týmu projít zemědělské předpisy, interní pravidla a auditní požadavky bez zbytečného dohadování.',
        features: [
            'Odkazy na interní směrnice a legislativu',
            'Povinné kroky a evidence pod kontrolou',
            'Přehlednější audity a interní kontroly',
        ],
    },
    {
        preview: gmailAsset,
        title: 'Dodavatelský řetězec pod kontrolou',
        description:
            'Pomáhá s logistikou, inventářem a dodavatelskými protokoly pro osiva, hnojiva, přípravky i technické vybavení.',
        features: [
            'Dodavatelské postupy na jednom místě',
            'Přehled zásob a kritických položek',
            'Stejné postupy ve všech provozech',
        ],
    },
    {
        preview: chatAsset,
        title: 'Asistent pro regionální týmy',
        description:
            'Pomůže distributorům, agronomům a vedoucím provozu sdílet know-how mezi více lokalitami.',
        features: [
            'Expertiza dostupná v každé oblasti',
            'Odpovědi v mobilu, chatu i e-mailu',
            'Menší závislost na jednotlivcích',
        ],
    },
];
