'use client';

import Link from 'next/link';

export function RecordingDisplayCaptureHelp({ compact = false }: { readonly compact?: boolean }) {
    return (
        <details open={!compact} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
            <summary className="cursor-pointer font-semibold">macOS Spaces: okno může v prohlížeči chybět nebo přestat posílat obraz</summary>
            <div className="mt-2 space-y-2">
                <p>
                    Hlášení se týká Chrome na macOS: VS Code na jiném Space nebylo v nabídce oken, zatímco volby celé obrazovky a karty Chrome byly vidět.
                    Přesné verze macOS a Chrome, stav oprávnění i průběžný obraz po přepnutí Space nebyly zaznamenány.
                    Jde o jeden neúplně popsaný případ, ne potvrzené chování všech Maců nebo prohlížečů. Běžný Space, fullscreen Space,
                    minimalizované či skryté okno a okno na jiném monitoru jsou odlišné případy.
                </p>
                <p>
                    Výběr vlastní prohlížeč a macOS. Studio neprochází seznam systémových oken a nemůže přidat chybějící položku ani obejít
                    potvrzení. Uložený název okna je jen vodítko; při každém připojení se okno vybírá znovu.
                </p>
                <p>
                    Pro srovnání spusťte základní test bez preferencí studia, nejprve s viditelným oknem na stejném běžném Space a potom
                    zvlášť v dalších stavech. Po výběru změňte obsah VS Code, přepněte Space a vraťte se k náhledu. Stejný Space je první
                    nízce expozicový pokus, ne ověřená oprava tohoto případu.
                </p>
                <p>
                    Celá obrazovka je výslovná alternativa pouze tehdy, když smí záznam zachytit všechna okna, oznámení a další obsah,
                    který se zobrazí na vybraném monitoru. Její výběr sám o sobě nepotvrzuje, že obraz zůstane živý při přepnutí Space.
                    Karta Chrome zachytí obsah karty, nikoli nativní okno VS Code.
                </p>
                <Link className="inline-flex font-semibold underline underline-offset-2" href="/admin/recording-studio/capture-probe" target="_blank" rel="noreferrer">
                    Otevřít základní test výběru a průběžného obrazu
                </Link>
            </div>
        </details>
    );
}
