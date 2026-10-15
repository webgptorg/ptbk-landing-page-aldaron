# Specifikace nových stránek Promptbooku

Stav: implementovaná česká revizní verze `/new` a `/new/partnership`, podle podkladů dodaných 15. října 2026. Tato specifikace popisuje celé stránky a kalkulačku, nejen změny proti předchozí verzi. Nejde o specifikaci samotného enginu, připravované aplikace nebo platebního systému.

## Záměr

Promptbook poskytuje technologii a komerční licenci pro dlouhodobé firemní AI agendy. Agentura navrhuje a nasazuje konkrétní řešení, zůstává komunikačním místem klienta a zajišťuje běžnou péči. Koncový klient platí licenci přímo Promptbooku a práci zvlášť agentuře. Web má umožnit pochopit produkt, poznat partnerskou příležitost, spočítat úplnou ekonomiku a domluvit první pilot.

Primární čtenář je majitel menší agentury, který chce usnadnit vlastní práci a nabídnout novou službu klientům. Nabídka je otevřená také freelancerům a integrátorům. Příběh koncové firmy je argumentem, který partner používá u svých klientů, nikoli slibem, že Promptbook bude jejich koncovým dodavatelem.

## Úplný rozsah specifikace

1. [Zdroje, rozhodnutí a otevřené body](new-pages-sources.md): původ požadavků, rozpory, pořadí autority, nepodložené a budoucí sliby.
2. [Produktová stránka](new-product-page.md): cílové publikum, sdělení, pořadí bloků, obsah a cesty návštěvníka.
3. [Partnerská stránka](new-partnership-page.md): role, nabídka partnerství, platby, výnosy, implementace a doporučování.
4. [Obchodní nabídka a podpora](new-commercial-offer.md): oba plány, instance, výluky, veřejná licence a SLA.
5. [Kalkulačka ekonomiky](new-economics-calculator.md): režimy, všechny vstupy, jednotky, vzorce, výsledky a okrajové stavy.
6. [Společné chování a ověření](new-pages-quality.md): navigace, mobil, přístupnost, metadata, soukromí, export, testy a akceptace.

Dokumenty se čtou dohromady. Obchodní část má přednost před staršími cenovými návrhy a marketingovým textem. Implementace nesmí přidávat nové smluvní přísliby tam, kde specifikace uvádí dohodu nebo otevřený bod.

## Hranice vydání

Aktualizují se pouze existující revizní stránky a jejich sdílené součásti. `/cs`, `/en`, `/cs/pro-firmy`, ostatní značkové weby, jejich navigace a obchodní nabídky se tímto vydáním nemění. Stránky zůstávají veřejně dostupné, ale `noindex`, mimo sitemapu. Vydání nemění upstream licenci, zákaznická data, účty, smlouvy, Stripe, provoz agentů ani partnerům neaktivuje nárok na výplatu.

Česká revizní verze je záměrně zachována. Angličtina jako budoucí výchozí jazyk celé prezentace, další jazyky, katalog, srovnávací stránky a registrace do aplikace jsou oddělené pokračování, nikoli funkce skrytě předstírané těmito dvěma stránkami.
