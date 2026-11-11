import Link from 'next/link';
import type { LegalDocument } from './legalDocument';
import { getLegalPagePath } from './legalPagePaths';
import { PROMPTBOOK_ONLINE_TERMS_V1_VERSION as PROMPTBOOK_ONLINE_TERMS_VERSION } from './promptbookOnlineTermsVersion';

// This edition records the supplier and contact as published; shared identity changes must not rewrite it.
const ONLINE_OPERATOR_IDENTIFICATION = 'AI Web s.r.o., IČO 21012288, se sídlem Rohožnická 2908, Újezd nad Lesy, 190 16 Praha 9, zapsaná u Městského soudu v Praze, oddíl C, vložka 395519';
const LEGAL_CONTACT_EMAIL = 'legal@ptbk.io';

/** An immutable edition for the initial online offer. Use a new edition and URL for future wording. */
export const PROMPTBOOK_ONLINE_TERMS_V1_DOCUMENT: LegalDocument = {
    title: 'Podmínky online předplatného Promptbook',
    publication: {
        date: '2026-11-09',
        isDraft: false,
        notice: `Znění ${PROMPTBOOK_ONLINE_TERMS_VERSION}. Platí pro online objednávky, které na ně výslovně odkazují.`,
    },
    perex: 'Podmínky pro první online objednávky tarifů Start a Business od českých a slovenských podnikatelů.',
    sections: [
        {
            heading: 'Objednávka a aktivace',
            paragraphs: [
                `Dodavatelem je ${ONLINE_OPERATOR_IDENTIFICATION} („AI Web“). Zákazník objednává v rámci svého podnikání a odpovídá za správnost fakturačních údajů. Se smluvními a fakturačními dotazy se obracejte na ${LEGAL_CONTACT_EMAIL}.`,
                'Před platbou zákazník uvede údaje k ověření fakturačního subjektu a zkontroluje tarif, konkrétní vydání a licenci enginu, rozsah plnění, kanál podpory, cenu v Kč, případnou slevu a cenu následné obnovy. Smlouva vzniká potvrzením objednávky ze strany AI Webu po úspěšné platbě nebo po dokončení objednávky s nulovou první platbou, pokud byla výslovně nabídnuta. Od potvrzení je dostupná podpora a placené oprávnění na sjednané období. Potvrzení s údaji objednávky a odkazem na neměnné znění přijatých podmínek je po aktivaci k dispozici v zákaznické sekci. Doklad vystavuje AI Web elektronicky prostřednictvím Stripe.',
            ],
        },
        {
            heading: 'Rozsah předplatného a licence enginu',
            paragraphs: [
                'Součástí předplatného je podpora výrobce pro jeden samostatně provozovaný projekt na verzi enginu určené objednávkou, návod k vlastní instalaci a přístup do zákaznické sekce. Stejný instalační balíček může být dostupný veřejně. Ovládací aplikace a spojovací služba relay jsou v přípravě a tato objednávka nezakládá nárok na jejich dostupnost ani na konkrétní datum jejich vydání.',
                'Po dobu aktivního předplatného AI Web v rozsahu vlastních práv poskytuje nevýhradní oprávnění provozovat uvedenou verzi enginu pro vlastní podnikání zákazníka v jednom projektu, včetně produkčního provozu v zákazníkově prostředí a kopií či úprav potřebných pro tento provoz. Zákazník může vlastním jménem pověřit provozem nebo úpravami svého dodavatele. Oprávnění nepřechází na jiné projekty ani nezakládá další distribuci, sublicenci či právo ke značce.',
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
                'Sjednaná cena je základ bez DPH. AI Web DPH připočte u budoucí obnovy, pokud ji bude povinen účtovat. Před zvýšením částky inkasované kvůli připočtení DPH sdělí zákazníkovi e-mailem novou celkovou cenu a první dotčenou obnovu nejméně 30 dní předem. Zákazník může obnovu před změnou zrušit. Pravidlo se použije pouze do budoucna a nemění zákonné daňové povinnosti stran. U plnění v režimu přenesení daňové povinnosti přiznává DPH zákazník podle příslušných pravidel.',
            ],
        },
        {
            heading: 'Obnovování a ukončení',
            paragraphs: [
                'První platba pokrývá jeden měsíc. Předplatné se poté každý měsíc obnovuje automaticky s platbou sjednanou kartou. Doklad a správa předplatného jsou dostupné v zákaznické sekci nebo prostřednictvím odkazu zaslaného zákazníkovi.',
                `Zákazník může automatickou obnovu vypnout v zákaznické sekci nebo e-mailem na ${LEGAL_CONTACT_EMAIL} doručeným před začátkem dalšího období. Předplatné a podpora doběhnou do konce již uhrazeného období. Po neúspěšné obnově se nové období aktivuje až po úhradě. Pokud AI Web přestane poskytovat část již uhrazeného plnění, vrátí zákazníkovi cenu odpovídající neposkytnuté části. Zákonná práva z vad zůstávají zachována.`,
                'Změny běžící smlouvy nad rámec předem sjednaného způsobu výpočtu DPH nebo skončení již sjednané slevy vyžadují dohodu stran. Zveřejnění nového znění nemění přijatou objednávku. Použije se české právo.',
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
