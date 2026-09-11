import { Conversation } from '@/lib/conversations-data';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import spaceTrim from 'spacetrim';

export const forAgroConversation = {
    title: 'Agronomický expert a compliance',
    description: 'Agronomický tým řeší symptomy na pšenici, interní postup a zápis zásahu.',
    participants: [
        {
            name: 'USER',
            fullname: 'Eva, hlavní agronomka',
            color: '#1c6981ff',
            personality: '',
            avatar: jiriJahn.src,
            isMe: true,
        },
        {
            name: 'AGENT',
            fullname: 'Agro AI Expert',
            color: '#5df1e8ff',
            personality: '',
            avatar: pavolHejny.src,
        },
    ],
    messages: [
        {
            author: 'USER',
            content: spaceTrim(`
                Po deštích vidíme na třech lokalitách žloutnutí a skvrny na listech pšenice.

                Potřebuju rychle sjednotit doporučení pro terén:
                - jak odlišit padlí od septoriózy
                - který interní postup spustit
                - co zapsat kvůli compliance a evidenci zásahu
            `),
            timestamp: '2026-03-11T07:30:00Z',
        },
        {
            author: 'AGENT',
            content: spaceTrim(`
                Rozumím. Pro regionální tým bych postupoval takto:

                ## 1. Jak to rychle rozlišit v terénu

                | Příznak | Padlí travní | Septorióza pšenice |
                |---|---|---|
                | Povrch listu | bělavý moučný povlak | nepravidelné skvrny se žlutým lemem |
                | Typ šíření | často od spodních pater za suššího počasí | rychleji po deštích a při vysoké vlhkosti |
                | Co ověřit | intenzitu povlaku a napadení odnoží | rozsah skvrn, lokalitu a vývoj v horních listech |

                ## 2. Interní postup
                1. Potvrďte symptomy na každé lokalitě a přiložte fotodokumentaci.
                2. Porovnejte stav s posledním monitoringem a počasím za posledních 7 dní.
                3. Rozhodněte, jestli stačí lokální zásah, nebo je potřeba doporučení pro celý region.
                4. Při nejasném nebo rozsáhlém výskytu zapojte seniorního agronoma.

                ## 3. Co zapsat do evidence a pro compliance
                - lokalitu, kulturu, odrůdu a datum zjištění
                - pozorované symptomy a rozsah napadení
                - doporučený nebo provedený zásah a odpovědnou osobu
                - použitý přípravek, dávkování a důvod rozhodnutí
                - vazbu na interní metodiku a záznam o schválení

                ## 4. Pro tým
                Pokud si diagnózou nejsme jistí, nejdřív potvrďme původce. Teprve potom sjednoťme zásah pro všechny lokality.
            `),
            timestamp: '2026-03-11T07:31:10Z',
        },
    ],
} satisfies Conversation;
