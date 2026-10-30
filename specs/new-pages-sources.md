# Zdroje a rozhodnutí

## Autorita zadání

**L:** „Promptbook - licence pro firemní AI agenty.pdf“, verze 1.0, 15. října 2026, 3 strany. S. 1 definuje plány, platby a klientské prostředí. S. 2 provozní výluky, podíl a servisní SLA. S. 2–3 veřejnou licenci a individuální rozsah. Je to návrh nabídky pro jednání, ne nahrazení smlouvy.

**W:** „Web ptbk plus hlavní myšlenka ptbk.pdf“, 10 stran. Positioning, opakovaná firemní práce, agentury jako primární cesta, příběh změny od úkolování k agendám. Obsahuje také rozpracované cenové hypotézy a historický stav přípravy aplikace.

**C:** Celá konverzace, s předností posledního explicitního zadání 24. října 2026: provést a commitnout další úpravy obou repozitářů, Promptbook ve větvi `reborn/2026-10`. Hlavní i partnerská stránka dostanou stejnou úpravu: dvoubarevné `promptbook` s původním symbolem a bez tečky, hero bez závěrečných teček, méně výplňkového textu, jeden kompaktní karusel tří 3D příběhů s běžným pohybem celé stránky při scrollování, samostatná soudržná scéna aplikace/enginu, zachovaná trojice souborů/historie/modelů, klasické karty stávajících plánů bez české kurzové vysvětlivky, jednorádkové tlačítko obnovy kalkulačky, společná mřížka všech referencí, větší zrcadlové portréty s kontakty a formulář přímo na stránce navíc k pop-upu. Obsah nabídky a ceny se nemění. Navazující README má být kratší a vizuálnější, inspirované repozitářem Paperclip. Dříve schválené jazyky `/cs` a `/en`, nezávazný zájem s informací o dostupnosti aplikace, instalace npm/shell/EXE, původní demo na agendách, přesné hranice E2E, původní reference, Technologická inkubace, vyloučení Prahy 13 a BUSL zůstávají zachované.

**R:** Stávající repozitář: kontaktní helper a `/api/waitlist`, Contact, společné právní dokumenty, organizační konstanty, skutečné fotografie/jména obou zakladatelů a licencované PDF fonty.

**E:** Externí primární zdroje konkrétních alternativ, kontrolované 15. října 2026; jsou uvedené v [srovnáních](new-comparisons.md) a na stránkách. Jde o nově vyžádaný výzkum, ne o ověření všech tvrzení v původních PDF.

Originální PDF se nevkládají do veřejného repozitáře nebo downloadů. Zachovávají se názvy a lokátory pro dohledatelnost.

## Vyřešené rozpory

| Téma | Rozhodnutí |
| --- | --- |
| Cena a podíl | L má přednost před starším Starter 10 USD, volitelnými provizemi nebo trialovými hypotézami W. Start 19 USD / 30 dní, Business 100 USD / prostředí/měsíc, pevně 20 %. |
| Předmět licence | Software a produkční klientské prostředí podle L; nepřepisuje se zpět na pouhý poplatek za UI. |
| Open source / zdarma | Veřejná licence konkrétní verze a již udělená práva; veřejný kód se nevydává za neomezené produkční oprávnění. |
| Dostupnost na webu | Zadání z 30. října 2026 má přednost: veřejný web popisuje Appku a probírané funkce v přítomném čase. Formulář stále sbírá nezávazný zájem o kontakt a nasazení; nečeká na budoucí dostupnost, neaktivuje účet a nevytváří objednávku. |
| Book / kniha | Poslední C ruší metaforu „napište knihu“. Book se nepřekládá a veřejný web jej vůbec nevyžaduje. Konfiguraci může vytvořit systém nebo partner. |
| CTA a kontakt | Hero zachovává tlačítko zájmu a menší instalační odkaz. Nejnovější C přidává viditelný formulář na stránce vedle stávajícího modálu, oba se stejným endpointem/evidencí R. Přímé ověřené e-mailové/telefonní kontakty u zakladatelů jsou samostatné. Bez falešné objednávky či registrace. |
| Data a E2E | Zadání z 30. října 2026 sjednocuje celý web se specifikacemi Rebornu: lokální dashboard bez párování, samostatná ověřená E2E Appka, relay/backend bez dešifrování pracovního obsahu včetně Walletu a servisního fallbacku. Nezamlčet metadata ani externí modelové/nástrojové vstupy; webový úkol není audit. |
| Kontaktní osoba | L určuje Jiřího pro SLA. C určuje oba rovnocenné spoluzakladatele v prezentaci: Pavol technologie, Jiří obchod. Nejde o změnu adresy eskalačního SLA. |
| Firma | Nepřesný hlasový název se nenahrazuje novou identitou. Právní údaje jsou z existujícího R: AI Web s.r.o. |
| Srovnání | C nově žádá výzkum. Nepravdivé zkratky W o permanentním hlídání konkurentů se nepřebírají; používají se skutečné schopnosti z E. |
| Úvod vs. podrobnosti | C schvaluje samostatné podstránky. Nejnovější C odstraňuje výplňkový úvod před příběhy a opakující blok celého řešení. Smluvní a technické vysvětlení patří do ceníku/FAQ/bezpečnosti. |
| Scroll | Nejnovější C odmítá připnutí scén a vynucené taby. Tři ukázky sdílejí jeden kompaktní karusel; scroll vždy pokračuje stránkou a jen lokálně ovládá prostorovou scénu. |
| České ceny | C potvrzuje ceny 400 / 2 200 Kč a mění pouze prezentaci do klasických plánů. Kurzová vysvětlivka se nezobrazuje; uložené jednotky a výpočetní model kalkulačky se nemění. |
| Reference | Nejnovější C ruší samostatné vizuální oddělení univerzity a osobních referencí. Všech šest karet sdílí mřížku, citace a atribuce zůstávají přesné. |

## Reference a přesné zdroje

- Osobní reference jsou převzaté z `businesses/pavol/config-testimonials.ts`, samostatně pro češtinu a angličtinu: Tomáš Studeník, Jan Šedo, Max Kozlov, Bob Kartous a Tereza Texlová. Zachovávají přesné citace včetně „s Pavolem“, jména, role a fotografie z `public/pavol/testimonials/`. Produktová kopie `businesses/new/brandTestimonialsData.ts` je nezávislá na budoucím vývoji osobního webu. Nejnovější C ruší rozdělující titulky; původní citace a atribuce nadále určují kontext zkušenosti.
- Produktová reference Slezské univerzity v Opavě pochází z `businesses/pro-firmy/proFirmyContent.tsx` a `proFirmyTestimonials.tsx`. Zachovává původní českou/anglickou citaci a roli IT oddělení jako jednu další kartu stejné mřížky. Nepřebírají se sousední nepodložené metriky.
- Kontakty zakladatelů pocházejí z `components/team-section.tsx`: Jiří Jahn `jiri@ptbk.io`, `+420 777 090 067`; Pavol Hejný `pavol@ptbk.io`, `+420 777 759 767`.
- Technologická inkubace přebírá přesné dvojjazyčné poděkování z `components/footer.tsx` a původní `public/sponsors/CI-Technology-Incubation.png`.
- Praha 13 nesmí být veřejnou referencí, logem ani metadatem. Kontrola veřejných zdrojů při této změně nenašla skutečný existující výskyt; podobné fragmenty v binárních/base64 datech nejsou reference.

## Příběh a důkazy

Příběh popisuje pouze vlastníkem uvedený vývoj od webových chatbotů k jednotlivým úkolům a dlouhodobým agendám, použití coding harnesses, vlastní soubory a partnerskou distribuci. Bez neověřených letopočtů, osobních příhod, citací, jmen klientů nebo smyšlených metrik.

Žádné tvrzení „Neonmedia běží na Promptbooku“ bez schváleného pilotu, žádné převzaté procentní tržní statistiky a žádné falešné reference/videa. Ilustrace agend používají syntetické podklady a jsou označené jako ukázka. Výsledky kalkulací vycházejí z odhadů, ne z měřených klientských úspor.

## Rozsah této změny

Aktuální branding zahrnuje web, instalační prezentaci, kontaktní texty a specifikace; navazující schválená práce v repozitáři Promptbooku sjednocuje README a veřejné vysvětlení CLI. Zachovává stávající kalkulačku/PDF, obchodní podmínky, platby, partnerskou atribuci a podporované runtime. Nemění BUSL ani jiné licenční soubory a neimplementuje kryptografický protokol. Modelové příběhy nejsou dokladem produkčního nasazení; skutečný provoz a konkrétní objednávky zůstávají součástí dodání.

## Ověřené podklady časové osy — 25. října 2026

- 2023, WebGPT: zakladatelé jsou na https://webgpt.cz/; Pavolův veřejný profil https://cz.linkedin.com/in/hejny/cs uvádí WebGPT od září 2023 do května 2024 a přechod na Promptbook. Jiřího veřejný profil https://cz.linkedin.com/in/jirkajahn sdílí zakladatelův popis začátku generování webů v srpnu 2023. Nejde o výzkumný projekt OpenAI stejného jména.
- 2024, Promptbook a propojené postupy: https://github.com/webgptorg/promptbook/discussions/118 (5. září a odpověď 29. listopadu 2024) a /discussions/111 popisují orchestraci zadání a řízené postupy.
- 2025, agenti s kontextem: Pavolův vlastní popis v Data Talk #157, zveřejněno 16. října 2025: https://www.datatalk.cz/podcast/epizoda-157, úvodní představení popisuje AI kolegy, znalostní bázi a pravidla.
- 2026, dlouhodobé agendy, vlastní engine a ovládání: aktuální vlastníkovo zadání a specifikace tohoto repozitáře. Přítomný čas veřejné prezentace vychází z výslovného zadání z 30. října 2026, nikoli ze samotného zobrazení na časové ose.

Nové večerní zadání nahrazuje dřívější textovou esej chronologií po těchto doložených letech a schvaluje změnu české veřejné ceny Start na 400 Kč. Původní USD model kalkulačky, Business a anglické ceny se nemění.

## Sladění s Rebornem — 30. října 2026

Vlastník schválil úpravu FAQ, bezpečnosti a dalších souvisejících textů celého webu a push přímo do `main`. Nový [kontrakt bezpečnosti a autonomie](new-security-and-autonomy.md) vychází z publikovaných specifikací enginu ve větvi `reborn/2026-10`, commit [`7da13b7`](https://github.com/webgptorg/promptbook/commit/7da13b7e6d4838cfea79c26cc2bdede78fe5bf4e). Přítomný čas platí i pro kontaktní dialogy a přístupné popisy scén. Doplněné učení v mezích pevných pravidel a automatické aktualizace nemění ceny, licence, právní dokumenty, původní citace ani backend kontaktů. Neimplementuje se engine ani Appka.
