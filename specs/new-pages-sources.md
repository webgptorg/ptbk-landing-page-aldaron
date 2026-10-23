# Zdroje a rozhodnutí

## Autorita zadání

**L:** „Promptbook - licence pro firemní AI agenty.pdf“, verze 1.0, 15. října 2026, 3 strany. S. 1 definuje plány, platby a klientské prostředí. S. 2 provozní výluky, podíl a servisní SLA. S. 2–3 veřejnou licenci a individuální rozsah. Je to návrh nabídky pro jednání, ne nahrazení smlouvy.

**W:** „Web ptbk plus hlavní myšlenka ptbk.pdf“, 10 stran. Positioning, opakovaná firemní práce, agentury jako primární cesta, příběh změny od úkolování k agendám. Obsahuje také rozpracované cenové hypotézy a historický stav přípravy aplikace.

**C:** Celá konverzace, s předností posledního explicitního zadání 23. října 2026: provést a commitnout branding; plnohodnotně přepracovat hlavní i partnerskou stránku; tři příběhy (podcast AI ta Krajta, kontextový CRM e-mail, noční oprava), nezávisle volitelná aplikace a vlastní engine, vzdušný indigový 2.5D styl, čitelné soubory/Git/modely a přesné hranice E2E. Jedno kontaktní tlačítko sbírá nezávazný zájem s informací o budoucí dostupnosti aplikace, menší instalační odkaz vede na npm/shell/EXE. Veřejné jazyky jsou `/cs` a `/en`, kořen vybírá jazyk prohlížeče. Pět původních dem zůstává na agendách. C výslovně povoluje převzetí osobních referencí beze změn, zachování Slezské univerzity a Technologické inkubace, vyloučení Prahy 13 a ponechání BUSL beze změny.

**R:** Stávající repozitář: kontaktní helper a `/api/waitlist`, Contact, společné právní dokumenty, organizační konstanty, skutečné fotografie/jména obou zakladatelů a licencované PDF fonty.

**E:** Externí primární zdroje konkrétních alternativ, kontrolované 15. října 2026; jsou uvedené v [srovnáních](new-comparisons.md) a na stránkách. Jde o nově vyžádaný výzkum, ne o ověření všech tvrzení v původních PDF.

Originální PDF se nevkládají do veřejného repozitáře nebo downloadů. Zachovávají se názvy a lokátory pro dohledatelnost.

## Vyřešené rozpory

| Téma | Rozhodnutí |
| --- | --- |
| Cena a podíl | L má přednost před starším Starter 10 USD, volitelnými provizemi nebo trialovými hypotézami W. Start 19 USD / 30 dní, Business 100 USD / prostředí/měsíc, pevně 20 %. |
| Předmět licence | Software a produkční klientské prostředí podle L; nepřepisuje se zpět na pouhý poplatek za UI. |
| Open source / zdarma | Veřejná licence konkrétní verze a již udělená práva; veřejný kód se nevydává za neomezené produkční oprávnění. |
| Dostupnost na webu | Nejnovější C požaduje nezávazný zájem: tým návštěvníka kontaktuje a informuje o dostupnosti aplikace. Dřívější zákaz této informace je překonaný. Roadmapové odznaky a termín dokončení se nevracejí; formulář neaktivuje účet. |
| Book / kniha | Poslední C ruší metaforu „napište knihu“. Book se nepřekládá a veřejný web jej vůbec nevyžaduje. Konfiguraci může vytvořit systém nebo partner. |
| CTA | Jedno výrazné tlačítko zájmu a menší instalační odkaz pod ním. Stávající endpoint/evidence R, žádné marketingové mailto, falešná objednávka či registrace. |
| Data a E2E | C výslovně potvrzuje cílovou architekturu a chce hlavní bezpečnostní sdělení. Popsat ovládací kanál přesně, nezamlčet externí modelové vstupy a nevydávat webový úkol za audit. |
| Kontaktní osoba | L určuje Jiřího pro SLA. C určuje oba rovnocenné spoluzakladatele v prezentaci: Pavol technologie, Jiří obchod. Nejde o změnu adresy eskalačního SLA. |
| Firma | Nepřesný hlasový název se nenahrazuje novou identitou. Právní údaje jsou z existujícího R: AI Web s.r.o. |
| Srovnání | C nově žádá výzkum. Nepravdivé zkratky W o permanentním hlídání konkurentů se nepřebírají; používají se skutečné schopnosti z E. |
| Úvod vs. podrobnosti | C schvaluje samostatné podstránky. Smluvní a technické vysvětlení patří do ceníku/FAQ/bezpečnosti, nikoli do každé karty homepage. |

## Reference a přesné zdroje

- Osobní reference jsou převzaté z `businesses/pavol/config-testimonials.ts`, samostatně pro češtinu a angličtinu: Tomáš Studeník, Jan Šedo, Max Kozlov, Bob Kartous a Tereza Texlová. Zachovávají přesné citace včetně „s Pavolem“, jména, role a fotografie z `public/pavol/testimonials/`. Produktová kopie `businesses/new/brandTestimonialsData.ts` je nezávislá na budoucím vývoji osobního webu; titul výslovně označuje zkušenost se spoluprací s Pavolem.
- Produktová reference Slezské univerzity v Opavě pochází z `businesses/pro-firmy/proFirmyContent.tsx` a `proFirmyTestimonials.tsx`. Zachovává původní českou/anglickou citaci a roli IT oddělení, odděleně od osobních referencí. Nepřebírají se sousední nepodložené metriky.
- Technologická inkubace přebírá přesné dvojjazyčné poděkování z `components/footer.tsx` a původní `public/sponsors/CI-Technology-Incubation.png`.
- Praha 13 nesmí být veřejnou referencí, logem ani metadatem. Kontrola veřejných zdrojů při této změně nenašla skutečný existující výskyt; podobné fragmenty v binárních/base64 datech nejsou reference.

## Příběh a důkazy

Příběh popisuje pouze vlastníkem uvedený vývoj od webových chatbotů k jednotlivým úkolům a dlouhodobým agendám, použití coding harnesses, vlastní soubory a partnerskou distribuci. Bez nových letopočtů, osobních příhod, citací, jmen klientů nebo smyšlených metrik.

Žádné tvrzení „Neonmedia běží na Promptbooku“ bez schváleného pilotu, žádné převzaté procentní tržní statistiky a žádné falešné reference/videa. Ilustrace agend používají syntetické podklady a jsou označené jako ukázka. Výsledky kalkulací vycházejí z odhadů, ne z měřených klientských úspor.

## Rozsah této změny

Aktuální branding zahrnuje web, instalační prezentaci, kontaktní texty a specifikace; navazující schválená práce v repozitáři Promptbooku sjednocuje README a veřejné vysvětlení CLI. Zachovává stávající kalkulačku/PDF, obchodní podmínky, platby, partnerskou atribuci a podporované runtime. Nemění BUSL ani jiné licenční soubory a neimplementuje kryptografický protokol. Modelové příběhy nejsou dokladem produkčního nasazení; skutečný provoz a konkrétní objednávky zůstávají součástí dodání.
