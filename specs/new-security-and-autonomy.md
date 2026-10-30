# Bezpečnost, pevná pravidla a autonomie

[Rozcestník](_main.md) · [Produktové stránky](new-product-page.md) · [Kontakt](new-contact-and-pdf.md)

## Autorita a rozsah

Zadání vlastníka z 30. října 2026 požaduje sladit hlavní i partnerskou landing page a jejich podstránky s novými specifikacemi enginu ve větvi `reborn/2026-10`. Veřejná prezentace popisuje probírané funkce v přítomném čase. Překonává starší kontaktní a FAQ texty o připravované Appce i tvrzení o vzdáleném tunelu lokálního dashboardu. Zachovává se sběr nezávazného zájmu, samostatný instalační odkaz, obchodní podmínky a právní dokumenty. Odeslání kontaktu nevytváří účet ani objednávku.

Zdrojový kontrakt je v Promptbooku v commitu [`7da13b7`](https://github.com/webgptorg/promptbook/commit/7da13b7e6d4838cfea79c26cc2bdede78fe5bf4e), zejména `specs/app/integration.md`, `specs/cli/api.md`, `specs/cli/updates.md` a `specs/concepts/anchoring.md`. Jde o změnu veřejného vysvětlení, nikoli implementaci enginu, Appky nebo kryptografického protokolu; tato práce sama neprokazuje bezpečnostní audit.

## Vlastnictví a přenos

- Engine pracuje na dostupném stroji vlastníka a vlastní plánování, provádění, obnovu a aktualizaci projektu. Zavření Appky, odhlášení, ztráta zařízení a nedostupný relay samy o sobě neruší agendu. Ruční pauza a zastavení zůstávají závazné.
- Lokální dashboard/API jsou omezené na stroj s enginem a nevyžadují párování. Vzdálená Appka používá samostatné ověřené E2E spojení. Lokální port se nevystavuje do internetu a nezaměňuje se s někdejším vzdáleným tunelem.
- Relay a centrální backend pracovní obsah nedešifrují; klíče k němu zůstávají na koncových zařízeních. Hranice se vztahuje na chat, přenos souborů, Wallet a případný servisní terminál. Šifrování nenahrazuje ověření oprávnění.
- Účet, předplatné a potřebné provozní údaje jsou oddělené od pracovního obsahu. Netvrdit nulové zpracování metadat. Externí modely a nástroje dostávají vstupy, které jim agenda odešle; ani lokální model nepřemění externí nástroje na lokální.
- Git zachovává verzované soubory, nikoli vrácení externích akcí nebo zálohu ignorovaných tajemství. Veřejný kód není bezpečnostní certifikace.

## Pravidla a učení

Veřejně vysvětlit, že agent může zlepšovat metody a znalosti v povolených mezích, ale sám nemění uživatelem pevně určené cíle, zákazy a hranice schvalování. Uzavřené zadání se automaticky nepřepisuje; otevřené umožňuje učení jen v určených částech. Omezení platí také při opravě, aktualizaci a změně šablon; agent si je nemůže odstranit ani obejít jiným agentem. Pravidlo mění uživatel. Pokud brání dokončení, agent požádá o potřebné rozhodnutí a pokračuje v nezávislé práci. Nezavádět veřejný požadavek znát syntaxi OPEN/CLOSED ani novou kategorii core tasků.

## Aktualizace a ovládání

Výchozí automatika vybírá stabilní patch/minor v rámci stejného majoru, včetně minorů majoru nula. Nový major není výchozí automatický přechod. Stabilní instalace sama nevstoupí do prerelease; zvolený prerelease pokračuje po dalších vydáních téže základní verze k jejímu stabilnímu vydání, poté zůstává na stabilních. Uživatel může automatiku vypnout nebo verzi připnout. Pokročilé rozsahy zůstávají technickým detailem v odkazované specifikaci.

Engine čeká na bezpečnou volnou chvíli, respektuje ruční pauzu/stop a potřebné převody verzovaných souborů zaznamená v Gitu. Při selhání se pokusí obnovit provoz; neslibovat bezchybnost nebo univerzální rollback. Samostatné instalace mohou mít různé verze. Připnutí jednoho projektu blokuje konfliktní změnu sdílené instalace. Automatika se neprezentuje jako člověkem poskytovaná správa serveru zahrnutá v licenční ceně.

Appka nabízí chat a Start/Pause/Resume/Stop/Restart projektu. Nedostupné spojení znamená neověřený stav, nikoli potvrzené zastavení. Pauza drží automatickou práci a zachovává explicitní chat/ovládání. App-first onboarding získá příkaz pro VPS, pokračuje inicializací a skutečným přihlášením k vybraným harnessům, s chráněným CLI/terminálovým fallbackem. Běžný chat není místem pro hesla nebo přihlašovací kódy. Nepřidávat přísliby vzdáleného browser tabu, videa, jemných rolí nebo editorů, které tento minimální průchod nepotřebuje.

## Umístění a ověření

Hlavní i partnerská stránka mají krátký odkaz „Vaše data i pravidla zůstávají Vaše“. Podrobnosti patří na bezpečnost, FAQ shrnuje rozhodnutí pro běžného uživatele. Ceník odliší automatické aktualizace od placené lidské správy. Dialogové poznámky, text před odesláním a úspěch už neslibují budoucí dostupnost Appky. Přístupný popis bezpečnostní scény používá stejnou architekturu a zachovává ilustrativní charakter.

Česká i anglická počáteční vykreslení obsahují stejné informace a lokalizované odkazy. Zkontrolovat všechny marketingové texty včetně SVG popisů a formulářů, existující lokalizační/komponentové kontroly, produkční build a TypeScript. U prohlížečové kontroly neodesílat skutečné testovací kontakty. Práce na copy nemění engine, původní citace, licence, ceny, výpočty ani způsob ukládání kontaktů.
