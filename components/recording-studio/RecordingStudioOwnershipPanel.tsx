'use client';

import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { RecordingStudioOwnerView, RecordingStudioTakeoverFailure } from '@/lib/recording-studio/RecordingStudioOwnership';
import type { RecordingStudioHandoverStage } from '@/lib/recording-studio/recordingStudioOwnershipMessages';
import { formatRecordingDuration } from '@/lib/recording-studio/recordingStudioTiming';
import { getRecordingWorkspacePath } from '@/lib/recording-studio/recordingStudioSessionTime';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { useRecordingStudio } from './useRecordingStudio';

const OWNER_PHASE_LABELS = {
    loading: 'Načítání', idle: 'Připraveno', starting: 'Spouští záznam', recording: 'Nahrává',
    pausing: 'Ukládá pauzu', paused: 'Pozastavený záznam', resuming: 'Obnovuje záznam',
    stopping: 'Dokončuje záznam', unavailable: 'Nedostupné',
};
const HANDOVER_STAGE_LABELS: Record<RecordingStudioHandoverStage, string> = {
    accepted: 'Jiná karta potvrdila požadavek.', 'stopping-recording': 'Zastavuje záznam a ukládá poslední části.',
    'saving-edits': 'Ukládá změny editoru.', 'cancelling-work': 'Ukončuje exporty, generování a uploady.', releasing: 'Uvolňuje zařízení a zámek.',
};

function describeOwner(owner: RecordingStudioOwnerView): string {
    if (owner.kind === 'absent') return 'Studio nyní neřídí žádná karta.';
    if (owner.kind === 'pending') return 'Zjišťuji stav jiné instance…';
    if (owner.kind === 'unknown') return 'Stav jiné instance je neznámý. Může stále nahrávat; skrytá karta sama o sobě není nefunkční.';
    const { state } = owner;
    return `Poslední hlášený stav: ${OWNER_PHASE_LABELS[state.phase]} · ${formatRecordingDuration(state.recordedSeconds)}.${state.isFileWorkRunning ? ' Probíhá práce se soubory nebo upload.' : ''}${state.isEditUnsaved ? ' Editor má neuložené změny.' : ''}`;
}

function describeFailure(failure: RecordingStudioTakeoverFailure): string {
    switch (failure.kind) {
        case 'ownership-changed': return 'Studio mezitím převzala jiná karta. Tato karta zůstává neaktivní; zjistěte nový stav a zkuste převzetí znovu.';
        case 'revocation-unconfirmed': return 'Nepodařilo se bezpečně potvrdit odebrání práva zapisovat. Studio zůstává blokované. Jiná instance může dokončovat zápis do souboru nebo na server; počkejte a zkuste převzetí znovu.';
        case 'error': return `Převzetí selhalo: ${failure.detail}`;
        case 'rejected': return ({ busy: 'Jiná karta už předává studio jinému žadateli.', 'unsaved-edits': 'Jiná instance nemohla uložit změny editoru. Studio nebylo předáno.', 'cleanup-failed': 'Jiná instance nemohla bezpečně dokončit svou práci. Studio nebylo předáno.', cancelled: 'Předání bylo zrušeno. Případně zastavený take se sám znovu nespustí.' }[failure.reason]) + (failure.detail ? ` ${failure.detail}` : '');
    }
}

export function RecordingStudioOwnershipPanel({ studio }: { readonly studio: ReturnType<typeof useRecordingStudio> }) {
    const [confirmation, setConfirmation] = useState<'takeover' | 'discard' | 'force' | null>(null);
    const router = useRouter();
    const ownership = studio.ownership;
    const stoppedRecordingId = ownership?.activation?.origin === 'handover' ? ownership.activation.report.stoppedRecording?.id : undefined;
    useEffect(() => { if (stoppedRecordingId) router.replace(getRecordingWorkspacePath(stoppedRecordingId)); }, [router, stoppedRecordingId]);
    if (!ownership || ownership.status === 'acquiring') return null;
    if (ownership.status === 'active') {
        if (ownership.isHandingOver) return <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4">Předávám studio do jiné karty. Nové nahrávání, úpravy a mazání jsou zablokované; dokončuji uložené části a změny.</p>;
        const activation = ownership.activation;
        if (!activation || activation.origin === 'opened') return null;
        return <div role="status" className="space-y-2 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm">
            <p>Studio je aktivní v této kartě. Zdroje jsou načtené z uložené konfigurace; kamery a mikrofony znovu připojte a obrazovku vyberte v dialogu prohlížeče. Nahrávání se samo nespustí.</p>
            {activation.origin === 'forced' && <p>Nucené převzetí odebralo jiné instanci právo zapisovat. Prohlížeč tím její kameru ani mikrofon fyzicky nevypnul; instance je uvolní, až bude moci opět vykonávat kód. Neuložený konec a změny mohly být ztraceny.</p>}
            {activation.origin === 'owner-vanished' && <p>Jiná instance skončila bez potvrzení předání. Obnovené jsou pouze dříve potvrzené části.</p>}
            {activation.origin === 'handover' && <>
                {activation.report.stoppedRecording && <p>Záznam „{activation.report.stoppedRecording.title}“ byl zachován a otevřen. {activation.report.stoppedRecording.errorMessage}</p>}
                {activation.report.unsavedEditDetail && <p role="alert">Výslovně převzato bez neuložených změn: {activation.report.unsavedEditDetail}</p>}
            </>}
            <Button type="button" variant="outline" size="sm" onClick={studio.dismissActivation}>Rozumím</Button>
        </div>;
    }
    const { takeover, inactivity } = ownership;
    const isWaiting = ['requesting', 'handing-over', 'stalled'].includes(takeover.phase);
    const isBusy = isWaiting || takeover.phase === 'activating' || takeover.phase === 'forcing';
    const isForceOffered = takeover.phase === 'stalled' || (takeover.phase === 'failed' && takeover.isForceOffered);
    const isDiscardOffered = takeover.phase === 'failed' && takeover.failure.kind === 'rejected' && takeover.failure.reason === 'unsaved-edits';
    return <section className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950" aria-label="Vlastnictví studia">
        <p role="alert">{inactivity?.reason === 'another-tab' ? 'Studio už je otevřené v jiné kartě.' : inactivity?.reason === 'unavailable' ? 'Studio v této kartě není dostupné.' : 'Studio je v této kartě deaktivované. Nahrávání, úpravy a mazání jsou vypnuté. Ani obnovení stránky ho automaticky nepřevezme.'}</p>
        <p>{describeOwner(ownership.owner)}</p>
        {takeover.phase === 'idle' && takeover.cancellation && <p role="status">{takeover.cancellation.isOwnerWorkStopped ? 'Požadavek byl zrušen po zahájení předání. Jiná instance může dokončovat zastavení; zrušení nemůže automaticky obnovit původní take.' : 'Převzetí bylo zrušeno. Vlastnictví se nezměnilo.'}</p>}
        {takeover.phase === 'requesting' && <p role="status">Čekám nejvýše 5 sekund na odpověď jiné instance…</p>}
        {takeover.phase === 'handing-over' && <p role="status">{HANDOVER_STAGE_LABELS[takeover.stage]} Čekám nejvýše 30 sekund, potom nabídnu další postup.</p>}
        {takeover.phase === 'stalled' && <p role="alert">{takeover.cause === 'no-answer' ? 'Jiná instance včas neodpověděla. To neznamená, že nenahrává.' : 'Předání se včas nedokončilo.'} {takeover.stage && HANDOVER_STAGE_LABELS[takeover.stage]} Studio zatím nebylo převzato.</p>}
        {takeover.phase === 'activating' && <p role="status">Získávám skutečný zámek a načítám potvrzená data…</p>}
        {takeover.phase === 'forcing' && <p role="status">Ověřuji bezpečné odebrání práva zapisovat; úložiště má nejvýše 8 sekund…</p>}
        {takeover.phase === 'failed' && <p role="alert">{describeFailure(takeover.failure)}</p>}
        <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={isBusy} onClick={() => { studio.prepareTakeover(); void studio.refreshOwner(); setConfirmation('takeover'); }}>Převzít studio v této kartě</Button>
            <Button type="button" variant="outline" disabled={isBusy} onClick={() => void studio.refreshOwner()}>Zjistit stav znovu</Button>
            {isWaiting && <Button type="button" variant="outline" onClick={studio.cancelTakeover}>Zrušit požadavek</Button>}
            {takeover.phase === 'stalled' && <Button type="button" variant="outline" onClick={studio.continueWaiting}>Počkat znovu</Button>}
            {isForceOffered && <Button type="button" variant="destructive" onClick={() => setConfirmation('force')}>Nuceně převzít studio</Button>}
            {isDiscardOffered && <Button type="button" variant="destructive" onClick={() => { studio.prepareTakeover(); setConfirmation('discard'); }}>Převzít bez neuložených změn</Button>}
        </div>
        <AlertDialog open={confirmation !== null} onOpenChange={(isOpen) => { if (!isOpen) setConfirmation(null); }}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>{confirmation === 'force' ? 'Nuceně převzít studio?' : confirmation === 'discard' ? 'Převzít bez neuložených změn?' : 'Převzít studio v této kartě?'}</AlertDialogTitle>
                    <AlertDialogDescription asChild><div className="space-y-3">
                        <p>{describeOwner(ownership.owner)}</p>
                        <p>Jiná instance může právě nahrávat. Převzetí zastaví její nahrávání i další aktivní práci, včetně exportů, generování a uploadů. Již potvrzený materiál zůstane zachovaný, přerušená operace ale může ztratit neuložený konec. Původní kartu nezavřeme ani neobnovíme.</p>
                        {confirmation === 'force' && <p>Nucené převzetí je možné jen po bezpečném odebrání práva zapisovat v úložišti. Nezaručuje uložení posledních dat ani fyzické vypnutí kamery nebo mikrofonu zamrzlé karty. Zachytávání skončí, až jiná instance může znovu vykonávat kód.</p>}
                        {confirmation === 'discard' && <p>Neuložené změny editoru budou zahozeny. Poslední uložená verze a původní média zůstanou zachované.</p>}
                        <p>Po zahájení zastavování nemůže zrušení požadavku automaticky obnovit původní take.</p>
                    </div></AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Zrušit</AlertDialogCancel><AlertDialogAction onClick={() => {
                    if (confirmation === 'force') studio.forceTakeover();
                    else studio.requestTakeover(confirmation === 'discard');
                    setConfirmation(null);
                }}>{confirmation === 'force' ? 'Potvrdit nucené převzetí' : 'Potvrdit převzetí'}</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </section>;
}
