import Link from 'next/link';
import type { LegalDocument } from './legalDocument';
import { getLegalPagePath } from './legalPagePaths';
import { PROMPTBOOK_ONLINE_TERMS_V2_VERSION as PROMPTBOOK_ONLINE_TERMS_VERSION, PROMPTBOOK_ONLINE_TERMS_V1_VERSION } from './promptbookOnlineTermsVersion';
import { PROMPTBOOK_ONLINE_TERMS_V1_DOCUMENT } from './promptbookOnlineTermsV1Document';

// This edition records the supplier and contact as published; shared identity changes must not rewrite it.
const ONLINE_OPERATOR_IDENTIFICATION = 'AI Web s.r.o., IČO 21012288, se sídlem Rohožnická 2908, Újezd nad Lesy, 190 16 Praha 9, zapsaná u Městského soudu v Praze, oddíl C, vložka 395519';
const LEGAL_CONTACT_EMAIL = 'legal@ptbk.io';

/** An immutable edition for the online offer for consumers and business customers. Use a new edition and URL for future wording. */
export const PROMPTBOOK_ONLINE_TERMS_V2_DOCUMENT: LegalDocument = {
    title: 'Podmínky online předplatného Promptbook',
    publication: {
        date: '2026-11-11',
        isDraft: false,
        notice: `Znění ${PROMPTBOOK_ONLINE_TERMS_VERSION}. Platí pro online objednávky, které na ně výslovně odkazují.`,
    },
    perex: 'Podmínky online objednávek tarifů Start a Business pro spotřebitele a podnikatele z Česka a Slovenska.',
    sections: [
        {
            heading: 'Objednávka a aktivace',
            paragraphs: [
                `Dodavatelem je ${ONLINE_OPERATOR_IDENTIFICATION} („AI Web“). Zákazníkem může být spotřebitel i podnikatel z Česka nebo Slovenska. Zákazník odpovídá za správnost fakturačních údajů; IČO vyplňuje jen při nákupu na firmu. Údaje doplněné z veřejného registru může před objednáním opravit. Se smluvními a fakturačními dotazy se obracejte na ${LEGAL_CONTACT_EMAIL}.`,
                'Před platbou zákazník uvede fakturační údaje a zkontroluje tarif, rozsah plnění, cenu v Kč, případnou slevu a cenu následné obnovy. Konkrétní vydání, licence enginu a kontakt podpory jsou součástí potvrzení objednávky. Smlouva vzniká potvrzením objednávky ze strany AI Webu po úspěšné platbě nebo po dokončení objednávky s nulovou první platbou, pokud byla výslovně nabídnuta. Od potvrzení je dostupná podpora a placené oprávnění na sjednané období. Potvrzení s údaji objednávky a úplným neměnným zněním přijatých podmínek je po aktivaci k dispozici ke stažení v zákaznické sekci, kde si je zákazník může uložit. Doklad vystavuje AI Web elektronicky prostřednictvím Stripe.',
            ],
        },
        {
            heading: 'Rozsah předplatného a licence enginu',
            paragraphs: [
                'Součástí předplatného je podpora výrobce pro jeden samostatně provozovaný projekt na verzi enginu určené objednávkou, návod k vlastní instalaci a přístup do zákaznické sekce. Stejný instalační balíček může být dostupný veřejně. Ovládací aplikace a spojovací služba relay jsou v přípravě a tato objednávka nezakládá nárok na jejich dostupnost ani na konkrétní datum jejich vydání.',
                'Po dobu aktivního předplatného AI Web v rozsahu vlastních práv poskytuje nevýhradní oprávnění provozovat uvedenou verzi enginu pro vlastní potřeby nebo podnikání zákazníka v jednom projektu, včetně produkčního provozu v zákazníkově prostředí a kopií či úprav potřebných pro tento provoz. Zákazník může vlastním jménem pověřit provozem nebo úpravami svého dodavatele. Oprávnění nepřechází na jiné projekty ani nezakládá další distribuci, sublicenci či právo ke značce.',
                'Zachovávají se všechna práva podle licence přiložené ke konkrétnímu vydání, dříve platně nabytá práva a licence komponent třetích stran. Oprávnění navíc udělené výhradně tímto předplatným končí spolu s ním. Jeden projekt může mít více agend a jeho technické přejmenování nebo migrace sama o sobě nezakládá nový projekt.',
                'Start pokrývá 3 aktivované odborné agenty, 1 ovládajícího uživatele, 1 připojenou instanci harnessu a 1 oddělený webový profil. Business pokrývá 10 odborných agentů, 5 ovládajících uživatelů a 5 oddělených webových profilů a počet připojených instancí harnessu licenčně neomezuje. Core a systémové role se mezi odborné agenty nepočítají. Příplatky a další kapacita vyžadují samostatnou dohodu.',
            ],
        },
        {
            heading: 'Podpora od aktivace',
            paragraphs: [
                'Start zahrnuje podporu výrobce bez garantované reakční doby. U Businessu AI Web poskytne první věcnou reakci na řádně doručené hlášení do 16 pracovních hodin. Pracovní doba je pondělí až pátek 9:00–17:00 v časové zóně Europe/Prague mimo české svátky. Věcnou reakcí je posouzení, žádost o potřebné podklady nebo návrh dalšího postupu.',
                'Pro hlášení použijte kanál uvedený v objednávce a uveďte verzi, popis a dostupné podklady. Podporováno je výslovně určené vydání, i pokud jde o předběžnou verzi. Tím se tato verze nestává stabilním vydáním a nevzniká pro ni 90denní politika podpory stabilních řad. Podpora zahrnuje řešení hlášených problémů a návrh dalšího postupu. Pevný termín opravy, dostupnost nebo nepřetržitá pohotovost se nesjednávají.',
                'Hosting, instalaci na zakázku, integrace, individuální školení, modely, klíče, tokeny a služby třetích stran si zákazník zajišťuje samostatně. Případná individuální pomoc se sjednává zvlášť. Zákazník odpovídá za vlastní přístupy, zálohy, kontrolu výstupů a způsob využití enginu.',
            ],
        },
        {
            heading: 'Cena, slevový kód a DPH',
            paragraphs: [
                'Cenu určuje potvrzená objednávka. Při nákupu lze uplatnit jeden platný kód. Rozsah slevy, doba jejího čerpání a následná běžná cena se zobrazí před platbou a evidují u potvrzené objednávky. Po vyčerpání sjednané slevy se při další obnově účtuje oznámená běžná cena. Pozdější změna nebo stažení slevového kódu platí pro nové objednávky. Již sjednaná sleva doběhne podle potvrzených podmínek.',
                'Cena zobrazená před platbou je celková částka k úhradě včetně případných daní. AI Web nyní není plátcem DPH. Pokud mu vznikne povinnost účtovat DPH, platí změna celkové ceny jen pro budoucí obnovy oznámené níže uvedeným způsobem. Před zvýšením částky inkasované kvůli připočtení DPH sdělí zákazníkovi e-mailem novou celkovou cenu a první dotčenou obnovu nejméně 30 dní předem. Zákazník může obnovu před změnou zrušit. Pravidlo se použije pouze do budoucna a nemění zákonné daňové povinnosti stran. U plnění v režimu přenesení daňové povinnosti přiznává DPH zákazník podle příslušných pravidel.',
            ],
        },
        {
            heading: 'Obnovování a ukončení',
            paragraphs: [
                'První platba pokrývá jeden měsíc. Předplatné se poté každý měsíc obnovuje automaticky s platbou sjednanou kartou. Doklad a správa předplatného jsou dostupné v zákaznické sekci nebo prostřednictvím odkazu zaslaného zákazníkovi.',
                `Zákazník může automatickou obnovu vypnout v zákaznické sekci nebo e-mailem na ${LEGAL_CONTACT_EMAIL} doručeným před začátkem dalšího období. Předplatné a podpora doběhnou do konce již uhrazeného období. Po neúspěšné obnově se nové období aktivuje až po úhradě. Pokud AI Web přestane poskytovat část již uhrazeného plnění, vrátí zákazníkovi cenu odpovídající neposkytnuté části. Zákonná práva z vad zůstávají zachována.`,
                'Změny běžící smlouvy nad rámec předem sjednaného způsobu výpočtu DPH nebo skončení již sjednané slevy vyžadují dohodu stran. Zveřejnění nového znění nemění přijatou objednávku. Použije se české právo. Tím nejsou dotčena povinná práva spotřebitele podle práva země jeho obvyklého bydliště.',
            ],
        },
        {
            heading: 'Odstoupení spotřebitele',
            paragraphs: [
                'Spotřebitel může od smlouvy bez udání důvodu odstoupit do 14 dnů od jejího uzavření. Předplatné se na jeho výslovnou žádost zpřístupní ihned po aktivaci. Žádost o okamžité zpřístupnění neznamená ztrátu práva odstoupit. Při odstoupení v této lhůtě AI Web vrátí celou přijatou cenu bez poměrné srážky za již poskytnuté plnění.',
                `Pro odstoupení stačí odeslat jednoznačné sdělení na ${LEGAL_CONTACT_EMAIL} nebo na adresu sídla AI Webu. Uveďte své jméno, objednávku a datum jejího uzavření, aby bylo možné smlouvu dohledat. Můžete použít níže uvedený vzor, jeho použití však není povinné. Lhůta je zachována, pokud sdělení odešlete před jejím uplynutím.`,
                'AI Web bez zbytečného odkladu, nejpozději do 14 dnů od obdržení odstoupení, vrátí platbu stejným způsobem, jakým ji přijal, pokud se se spotřebitelem nedohodne jinak, bez dalších nákladů pro spotřebitele. Odstoupením se ukončí předplatné a budoucí obnovování. Tato pravidla neomezují jiná zákonná práva spotřebitele, zejména práva z vadného plnění.',
            ],
        },
        {
            heading: 'Vzor odstoupení od smlouvy',
            paragraphs: [
                `Adresát: ${ONLINE_OPERATOR_IDENTIFICATION}, e-mail ${LEGAL_CONTACT_EMAIL}.`,
                'Oznamuji, že odstupuji od smlouvy o předplatném Promptbook. Číslo objednávky: […]. Datum uzavření smlouvy: […]. Jméno a příjmení: […]. Adresa: […]. E-mail: […]. Datum: […]. Podpis pouze při odeslání v listinné podobě.',
            ],
        },
        {
            heading: 'Reklamace a řešení sporů',
            paragraphs: [
                `Vadu plnění oznamte na kontakt podpory uvedený v objednávce nebo na ${LEGAL_CONTACT_EMAIL}. Popište problém a požadovaný způsob vyřízení. AI Web vydá potvrzení o uplatnění a vyřízení reklamace. Reklamaci digitálního obsahu nebo digitální služby vyřídí v přiměřené době s ohledem na jejich povahu a účel, bez značných obtíží pro spotřebitele, a o vyřízení jej informuje. U ostatního spotřebitelského plnění činí lhůta nejvýše 30 dnů, pokud se strany nedohodnou jinak. Zákonná práva z vadného plnění, včetně požadavku na nápravu, přiměřenou slevu nebo odstoupení za zákonných podmínek, zůstávají zachována.`,
                <>K mimosoudnímu řešení spotřebitelského sporu je příslušná Česká obchodní inspekce, Ústřední inspektorát – oddělení ADR, Gorazdova 1969/24, 120 00 Praha 2, <a href="https://coi.gov.cz/informace-o-adr/">coi.gov.cz/informace-o-adr</a>. Nejdříve se pokuste spor vyřešit přímo s AI Webem.</>,
            ],
        },
        {
            heading: 'Údaje pro platbu a podporu',
            paragraphs: [
                <>Platby a faktury technicky zajišťuje Stripe. AI Web používá údaje k ověření zákazníka, vyřízení objednávky, evidenci předplatného, fakturaci a podpoře. Podrobnosti stanoví <Link href={getLegalPagePath('privacyPolicy', 'cs')}>informace o ochraně osobních údajů</Link>.</>,
                'Při hlášení neposílejte přístupové údaje, platební údaje ani osobní údaje třetích osob, které nejsou nutné k řešení. Případná podpora vyžadující zpracování zákaznických osobních údajů na jeho pokyn se sjednává zvlášť.',
            ],
        },
    ],
};

