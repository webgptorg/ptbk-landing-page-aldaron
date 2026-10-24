# Kontakt, sdílení a PDF kalkulace

## Kontaktní akce

Marketingová kontaktní tlačítka pod `/cs` a `/en` zachovávají společný modál. Hlavní a partnerská stránka navíc obsahují na konci přímo viditelný formulář **Napište nám**. Návštěvník k němu může dojít běžným scrollováním bez otevření pop-upu. Inline formulář modál nenahrazuje; oba používají stejný kontaktní kontrakt. Tlačítka nesimulují přihlášení do aplikace, neodesílají e-mail a nevytvářejí objednávku. Běžné e-mailové a telefonní odkazy u zakladatelů zůstávají samostatnými přímými kontakty.

Používají stávající serverovou cestu `/api/waitlist` a existující evidenci Contact v administraci. Nevzniká nová tabulka, duplicitní CRM, soukromý export kontaktů ani změna způsobu ukládání jiných stránek.

Běžná žádost v modálu i inline formuláři: povinný validní e-mail, nepovinné jméno a zpráva. Kontext tlačítka nebo stránky se ukládá jako téma, například Start, Business, partnerství, konkrétní agenda nebo Pavol/technologie či Jiří/obchod. Zachová se stávající provenance stránky a referrer. Obě podoby mají stejný identifikátor místa `new-website-contact`. Odesílání zamkne pole a tlačítko, zabrání souběžnému zápisu a při chybě zachová rozepsanou zprávu.

Před odesláním je vidět společné znění o zpracování osobních údajů s odkazem na lokalizovanou stránku `/cs/soukromi` nebo `/en/soukromi` a účelem vyřízení žádosti. Žádný automatický souhlas s newsletterem. Úspěch se zobrazí až po přijetí kontaktního záznamu backendem. Systém tím neslibuje doručený e-mail nebo konkrétní lhůtu odpovědi mimo sjednané SLA.

## Nezávazný zájem a vlastní instalace

Hero hlavní a partnerské landing page má jedno výrazné tlačítko zájmu a pod ním menší textový odkaz na lokalizovanou `/open-source`. Nejsou to dvě rovnocenné akce vedle sebe. Hlavní tlačítko používá téma Promptbooku nebo nasazování klientům; instalační pomoc zůstává běžným tematickým kontaktem. Závěrečnou sloganovou výzvu nahrazuje samotný viditelný formulář, nikoli druhá kopie hero CTA.

Před odesláním je jasné, že jde o nezávazný zájem: tým se ozve k potřebám návštěvníka a následně dá vědět o dostupnosti aplikace. Formulář může nabídnout pomoc s vlastním enginem už nyní. Režim zájmu a jeho účel se zapíší do poznámky existujícího kontaktu. Úspěch po potvrzení backendem říká, že zájem byl zaznamenán; nesimuluje okamžitý přístup k aplikaci, registraci, odeslaný e-mail ani objednávku. Není to newsletter a nevzniká nový kontaktní systém.

## E-mailová brána PDF

Z rychlé i pokročilé kalkulačky lze zvolit **Stáhnout PDF výpočet**. Akce zmrazí aktuální scénář, tab a všechny vstupy. Otevře modál s e-mailem; nerozesílá PDF a neslibuje jeho zaslání. Návštěvník vidí, že se uloží kontakt a odkaz na danou kalkulaci a že nejde o odběr novinek.

Po úspěšném uložení e-mailu do Contact (`placeName: new-calculator-pdf`) se v prohlížeči vytvoří a stáhne skutečné PDF. V poznámce kontaktu je účel, scénář, režim, verze obchodního modelu a sdílený odkaz se snapshotem. E-mail ani jméno se nezapisují do parametrů kalkulačky nebo obsahu reportu. Kód neodesílá testovací kontakty na produkci.

PDF nevznikne před úspěšným potvrzením uložení kontaktu. Selhání kontaktu ukáže chybu a zachová formulář. Selhání PDF po uložení nabídne opakování vytvoření PDF bez dalšího zápisu stejného kontaktu v rámci otevřeného modálu. Dvojité kliknutí během práce nevytváří souběžné požadavky. Modál během odesílání neodchází na jinou stránku ani neztrácí stav.

Jde o uživatelskou bránu pro získání kontaktu, nikoli o kryptografický nebo serverový licenční nárok k reportu. Uživatelské výpočty nejsou neveřejná data poskytovaná backendem.

## PDF report

A4, čitelné okraje, místní fonty s českou diakritikou, značka Promptbook a číslování stran. Renderer se načte až při vyžádání; nepřidává objemný PDF kód do první interakce s landing page.

Report obsahuje:

1. Název scénáře, režim, skutečné období a hlavní výsledek ve větě. Záporný výsledek se nezakrývá. Úspora kapacity je odlišena od hotovosti, partnerovy tržby od výsledku po nákladech.
2. Hlavní mezivýsledky příslušného režimu, jednorázové nasazení a souhrn za horizont.
3. Úplný rozpad jednoho klienta: licence, AI, externí měřené služby, rezerva, server, databáze, zálohy, elektřina, rozpočítaný hardware, jiné nástroje, servis partnera a zbývající lidská práce. Zvolený plátce infrastruktury je vysvětlen bez dvojího účtování.
4. Start/Business a pevné podmínky 20% podílu, verze obchodních předpokladů, DPH a vymezení ilustrativních odhadů.
5. Všechny uložené vstupy včetně názvů a jednotek. Neaktivní hodnoty se uchovávají kvůli znovuotevření; report výslovně říká, že například tokenové parametry při předplatném nevstupují do ceny.
6. Klikací odkaz otevře stejné parametry na pokročilé kalkulačce. E-mail se do odkazu nedostane. Příjemce odkazu vidí celý finanční model.

U Startu je skutečné období 30 dní, jedna instance a MRR nula. Dříve nastavený Business horizont se může uchovat mezi vstupy, ale není použit pro projekci Startu. Tabulky nesmějí useknout text nebo částky; řádky se nerozdělují přes stránky. Dlouhý odkaz se zobrazuje jako čitelný popisek, nikoli nekonečný řetězec přes okraj stránky.

## GET parametry a sdílení

Pokročilá kalkulačka ukládá celý formulářový stav do URL: verzi, režim, scénář a všechny známé vstupy. Změny neobnovují stránku. Otevření odkazu, reload a historie obnoví odpovídající model. Odkaz z rychlé kalkulačky předá i neviditelné odhady; neztratí rozpracovanou cenu, platební režim nebo partnerovy parametry.

Ukládají se i výchozí hodnoty, aby pouhá pozdější změna příkladu neposunula starý odkaz. Odkaz používá aktuální verzi výpočetního/obchodního modelu; není archivním příslibem budoucí ceny licence. Při budoucí změně cen musí být verze modelu vyhodnocena a uživatel nesmí být uveden v omyl.

Parser přijímá pouze allowlist polí. Nikdy nemění obchodní konstantu 20 %, nečte e-mail do kalkulačky, nešíří neznámá pole/prototypy a omezuje čísla. Neplatný enum se nahradí bezpečným výchozím stavem. Prázdná/nečíselná/ne-konečná URL hodnota použije výchozí odhad, nikoli NaN. Podrobné rozsahy jsou ve specifikaci kalkulačky.

**Sdílet kalkulaci** kopíruje URL a zároveň poskytuje ručně kopírovatelné pole pro případ nedostupné schránky. E-mailová brána není nutná k prostému kopírování odkazu. Výpočet a úpravy bez odeslání kontaktního formuláře samy o sobě nevytvářejí lead. Celowebová existující analytika a souhlas se touto změnou nepřepisují; URL není tajné úložiště.

## Přístupnost

Inline formulář i modál mají srozumitelný nadpis, viditelné labely, validaci, stav práce a přístupné oznámení úspěchu nebo chyby. Fokus zůstává uvnitř modálu, Escape zavírá při neprobíhajícím požadavku a po zavření se vrací na původní spouštěč. Úspěch a chyba se nesdělují pouze barvou. Tlačítko pro PDF má stejné chování v obou velikostech kalkulačky.
