import { COMMERCIAL_TERMS } from './commercialTerms';
export const FAQ = [
    [
        'Jak funguje Business zdarma?',
        'Zkouška je na 14 dní bez platební karty a pouze pro Česko a Slovensko. Začne až vaším výslovným potvrzením po přípravě enginu. Zahrnuje 10 míst v komunitě Promptbook. Po skončení se nic automaticky nestrhne; placené pokračování objednáte zvlášť. Překročení nebo skončení licence upozorní na stav, ale nezablokuje práci enginu. AI a případný server hradíte zvlášť.',
    ],
    [
        'Musím umět programovat?',
        'Pro běžné ovládání ne. Technické nastavení a připojení vašich systémů může vyřešit partner. Vy určíte práci, pravidla a hranice schvalování.',
    ],
    [
        'Čím se agenda liší od chatbota?',
        'Chat obvykle začíná otázkou. Agenda má vymezenou dlouhodobou práci a reaguje na další podklady nebo naplánované úkoly. Není potřeba znovu popisovat každý jednotlivý krok.',
    ],
    [
        'Funguje to i s vypnutým notebookem?',
        'Ano, pokud engine běží na jiném dostupném stroji, například na vašem serveru. Když vypnete přímo počítač s enginem, zastaví se i jeho práce.',
    ],
    [
        'Co když AI udělá chybu?',
        'Nastavíte oprávnění a schvalování citlivých kroků, počítáte s kontrolou výstupů a řešením výjimek. Autonomie neznamená bezchybnost ani převzetí odborné odpovědnosti.',
    ],
    [
        'Kam jdou naše data?',
        'Pracovní kontext a soubory jsou ve Vašem prostředí. Aplikace a engine spolu komunikují end-to-end šifrovaně; relay ani centrální backend tento pracovní obsah nedešifrují. Účet a předplatné jsou oddělené. Externí modely a připojené nástroje dostávají vstupy, které jim Vaše agenda odešle.',
    ],
    [
        'Mohou si agenti měnit naše pravidla?',
        'Postupy a znalosti mohou zlepšovat jen v mezích, které jim určíte. Pevné cíle, zákazy a hranice schvalování sami nemění, ani při opravě nebo aktualizaci. Můžete také uzavřít celé zadání agenta proti automatickému přepisování. Pevná pravidla měníte Vy.',
    ],
    [
        'Mohu si své agenty a práci odnést?',
        'Ano. Agenti, úkoly, konverzace a nastavení jsou čitelné soubory ve vašem projektu. Můžete je otevřít běžným editorem, zálohovat a přenést. Promptbook při dokončených změnách standardně vytváří Git historii, takže vidíte i předchozí verze.',
    ],
    [
        'Mohu změnit AI nebo použít lokální model?',
        'Ano, v rámci podporovaných harnessů a modelů. Role, pravidla a soubory přitom zůstávají ve vašem projektu. Lokální model vyžaduje kompatibilní napojení harnessu a odpovídající hardware; kvalitu a schopnost pracovat s nástroji ověřte na své agendě. Externí nástroje mohou data odesílat i při použití lokálního modelu.',
    ],
    [
        'Jak svou agendu ovládám?',
        'Dnes použijete lokální Console v terminálu nebo desktopové aplikaci na stroji s enginem. Vzdálenou ovládací appku připravujeme; samotné propojení přes relay ještě neznamená hotové ovládání. Po jejím zpřístupnění nabídneme prvním uživatelům další Business zkoušku.',
    ],
    [
        'Co když aplikaci zavřu nebo ztratím spojení?',
        'Engine pokračuje na svém dostupném stroji podle zadaných pravidel i po zavření aplikace, odhlášení nebo ztrátě zařízení. Nedostupné spojení samo o sobě neznamená zastavený projekt. Ruční pauza přeruší automatickou práci, ale ponechá chat a ovládání dostupné; zastavení ukončí běh enginu.',
    ],
    [
        'Jak fungují automatické aktualizace?',
        'Ve výchozím nastavení engine ve volné chvíli instaluje stabilní opravné a menší verze v rámci stejné hlavní verze. Automatiku můžete vypnout nebo připnout verzi. Předběžná vydání se sama nezapínají; pokud už na jednom jste, postupujete po něm ke stabilní verzi a pak zůstáváte na stabilních vydáních. Ruční pauza i zastavení zůstávají platné.',
    ],
    [
        'Jak začnu na vlastním serveru?',
        'Návody nabízejí instalaci na podporovaný Ubuntu server i postup s vaším lokálním AI nástrojem přes SSH. Potom se přihlásíte ke své AI a nastavíte první agendu. Přihlášení dokončujete vy v chráněném rozhraní nebo terminálu; hesla ani kódy neposílejte do běžného chatu. S nasazením může pomoci partner.',
    ],
    [
        'Je engine zdarma?',
        'Veřejný kód má vlastní licenční podmínky. Samostatný vývoj a neprodukční testování jsou bez licenčního poplatku podle licence dané verze. Produkční použití se řídí právy konkrétní verze a případnou komerční licencí Start či Business.',
    ],
    ['Co znamená jeden projekt?', COMMERCIAL_TERMS.instance],
    ['Jak se počítají odborní agenti?', COMMERCIAL_TERMS.specialists],
    ['Kdo je ovládající uživatel?', COMMERCIAL_TERMS.users],
    ['Co je instance harnessu?', COMMERCIAL_TERMS.harnesses],
    ['Co je oddělený webový profil?', COMMERCIAL_TERMS.browserProfiles],
    ['Jak se účtují rozšíření Businessu?', COMMERCIAL_TERMS.expansion],
    ['Mohu zůstat na Startu nebo změnit plán?', COMMERCIAL_TERMS.planChanges],
    [
        'Znamená 24/7 provoz i podporu v noci?',
        'Ne. Business má první věcnou reakci do 16 pracovních hodin v definovaném pracovním okně, nikoli nepřetržitou pohotovost, garanci opravy nebo dostupnosti. Podrobnosti jsou v ceníku.',
    ],
    [
        'Kdo nám řešení nasadí?',
        'Partner, který s vámi vybere agendu a postará se o nastavení i běžnou péči podle dohody. Promptbook poskytuje technologii a licenční produktovou podporu. Samostatné technické nasazení je také možné.',
    ],
    [
        'Musím odejít od svých současných nástrojů?',
        'Ne nutně. Podívejte se na srovnání jednotlivých přístupů. Některé nástroje, například coding harnessy, mohou být součástí vašeho řešení s Promptbookem.',
    ],
] as const;
