import { Conversation } from '@/lib/conversations-data';
import dariaHvizdalova from '@/public/people/daria-hvizdalova.jpeg';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import spaceTrim from 'spacetrim';

export const hackathonFactoryConversation = {
    title: 'Příklad přihlášky do sprintu',
    description: 'CTO popíše konkrétní problém a během pár zpráv z něj vznikne brief pro sprint.',
    participants: [
        {
            name: 'USER',
            fullname: 'Lucie, CTO SaaS startupu',
            color: '#1c6981ff',
            personality: '',
            avatar: dariaHvizdalova.src,
            isMe: true,
        },
        {
            name: 'AGENT',
            fullname: 'Jirka, Hackathon Factory',
            color: '#5df1e8ff',
            personality: '',
            avatar: jiriJahn.src,
        },
    ],
    messages: [
        {
            author: 'USER',
            content: spaceTrim(`
                Chceme do Hackathon Factory přihlásit zadání.

                Kontext:
                - B2B SaaS pro správu servisních požadavků
                - tým podpory ručně třídí cca 600 ticketů týdně
                - často nepoznáme, co je bug, co onboarding a co urgentní eskalace

                Cíl sprintu:
                - během dvou dnů ověřit, jestli dává smysl automatická triáž
                - vidět alespoň dva různé přístupy
                - na konci mít demo, doporučení a hrubý plán další implementace

                Omezení:
                - žádné nasazení do produkce
                - citlivé údaje musí být anonymizované
                - řešení musí jít napojit na náš stávající stack
            `),
            timestamp: '2026-03-20T09:00:00Z',
        },
        {
            author: 'AGENT',
            content: spaceTrim(`
                Tohle je dobrý kandidát pro Hackathon Factory. Převedu ho do briefu:

                ## Zadání: Triáž support ticketů pro B2B SaaS

                **Co řešíme**
                Rychlé rozpoznání typu ticketu, priority a doporučeného dalšího kroku.

                **Co má být na konci**
                - funkční demo nad anonymizovanými daty
                - porovnání alespoň dvou technických přístupů
                - doporučení, co dál stavět a co ne
                - stručná dokumentace a návrh dalšího sprintu

                **Podle čeho poznáme, že to funguje**
                - rychlejší první klasifikace ticketu
                - rozumná přesnost v prioritních kategoriích
                - jasné rozhodnutí, zda pokračovat pilotem
            `),
            timestamp: '2026-03-20T09:01:10Z',
        },
        {
            author: 'USER',
            content:
                'Ještě doplň prosím, že chceme doporučení, s jakým týmem nebo jednotlivci má smysl pokračovat po hackathonu.',
            timestamp: '2026-03-20T09:01:42Z',
        },
        {
            author: 'AGENT',
            content: spaceTrim(`
                Dopsáno do briefu:

                **Co dál po sprintu**
                Pokud si zadání a tým sednou, doporučíme, s kým má smysl pokračovat. Bez provize a bez závazku.

                Brief je připravený ke zveřejnění účastníkům.
            `),
            timestamp: '2026-03-20T09:02:05Z',
        },
    ],
} satisfies Conversation;
