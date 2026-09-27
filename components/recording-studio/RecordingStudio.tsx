'use client';

import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { isRecordingSourceReady, matchesRecordingSourceConfiguration, reconcileRecordingSourcesForConfiguration } from '@/lib/recording-studio/recordingStudioDevices';
import { areRecordingSourceConfigurationsEqual, getRecordingSourceConfigurationRestore, type RecordingSourceConfigurationRestore } from '@/lib/recording-studio/recordingStudioSourceConfiguration';
import { formatRecordingBytes, formatRecordingDuration, getRecordingByteLength } from '@/lib/recording-studio/recordingStudioTiming';
import type { StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { Circle, Plus, Square } from 'lucide-react';
import { useState } from 'react';
import { RecordingLibrary } from './RecordingLibrary';
import { RecordingSourcePicker } from './RecordingSourcePicker';
import { RecordingSourcePreview } from './RecordingSourcePreview';
import { RecordingStoragePanel } from './RecordingStoragePanel';
import { useRecordingStudio } from './useRecordingStudio';

export function RecordingStudio() {
    const studio = useRecordingStudio();
    const [isLibraryBusy, setIsLibraryBusy] = useState(false);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [restoreRequest, setRestoreRequest] = useState<{
        readonly recording: StudioRecording;
        readonly restore: RecordingSourceConfigurationRestore;
        readonly reportSuccess?: (message: string) => void;
    } | null>(null);
    const [configurationRestoreMessage, setConfigurationRestoreMessage] = useState<string | null>(null);
    const isRecording = studio.phase === 'recording';
    const isSessionBusy = ['starting', 'recording', 'stopping'].includes(studio.phase);
    const isReady = studio.phase === 'idle' && !studio.isChoosingDirectory;
    const enabledConfigurations = studio.sourceConfigurations.filter(({ isCaptureEnabled }) => isCaptureEnabled);
    const readySourceCount = enabledConfigurations.filter((configuration) => {
        const source = studio.sources.find((candidate) => candidate.id === configuration.id);
        return Boolean(source && studio.sourceReadiness[configuration.id] === 'ready' &&
            matchesRecordingSourceConfiguration(source, configuration) && isRecordingSourceReady(source));
    }).length;
    const isRecordingReady = enabledConfigurations.length > 0 && readySourceCount === enabledConfigurations.length;
    const finishSourceConfigurationRestore = (request: NonNullable<typeof restoreRequest>) => {
        try {
            const result = studio.restoreSourceConfiguration(request.restore);
            if (!result) return;
            const isDisplaySourcePresent = request.restore.configurations.some(({ kind }) => kind === 'screen');
            const legacyMessage = result.isLegacyIncomplete
                ? 'Starší záznam neuložil všechny volby zařízení. Otevřete Nastavení u označené kamery nebo mikrofonu a výběr potvrďte; původní okno ani jeho oprávnění obnovit nelze.'
                : '';
            const message = `Konfigurace záznamu „${request.recording.title}“ je připravena pro nový záznam. Zachováno aktivních náhledů: ${result.readySourceCount}; zdrojů k připojení: ${result.sourcesNeedingConnection}. ${isDisplaySourcePresent ? 'Sdílenou obrazovku nebo okno vyberte znovu v dialogu prohlížeče; uložený název a typ jsou jen vodítko. ' : ''}Připojte zdroje a zkontrolujte připravenost; nahrávání se samo nespustí. ${legacyMessage}`.trim();
            setConfigurationRestoreMessage(message);
            request.reportSuccess?.(message);
            setRestoreRequest(null);
        } catch (error) {
            setConfigurationRestoreMessage(error instanceof Error ? error.message : 'Konfiguraci zdrojů se nepodařilo obnovit.');
            request.reportSuccess?.('Konfiguraci zdrojů se nepodařilo obnovit. Zkontrolujte stav studia a zkuste akci znovu.');
            setRestoreRequest(null);
        }
    };
    const requestSourceConfigurationRestore = (recording: StudioRecording, reportSuccess?: (message: string) => void) => {
        const restore = getRecordingSourceConfigurationRestore(recording);
        const isCurrentSetupPresent = studio.sourceConfigurations.length > 0 || studio.sources.length > 0;
        const sourceReconciliation = reconcileRecordingSourcesForConfiguration(restore.configurations, studio.sources);
        const isAuthorizedSourceReleaseRequired = sourceReconciliation.releasedSources.some((source) => source.stream.getTracks().some((track) => track.readyState === 'live'));
        const isReplacingCurrentSetup = isCurrentSetupPresent &&
            (!areRecordingSourceConfigurationsEqual(studio.sourceConfigurations, restore.configurations) || isAuthorizedSourceReleaseRequired);
        if (isReplacingCurrentSetup) {
            setRestoreRequest({ recording, restore, ...(reportSuccess ? { reportSuccess } : {}) });
            return;
        }
        finishSourceConfigurationRestore({ recording, restore, ...(reportSuccess ? { reportSuccess } : {}) });
    };
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
            <div className="mx-auto max-w-6xl space-y-9">
                <div className="max-w-3xl space-y-2"><h2 className="text-2xl font-bold">Nahrávací studio</h2><p className="text-sm leading-6 text-slate-600">Nová kamera standardně nahrává i vybraný mikrofon přímo do stejného video souboru. Mikrofon můžete vypnout nebo přidat jako samostatný zdroj. Obraz náhledu je vždy ztlumený. Zastavení nahrávání ponechá dostupné náhledy aktivní; oprávnění uvolníte samostatným tlačítkem.</p></div>
                {studio.errorMessage && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{studio.errorMessage}</p>}
                {configurationRestoreMessage && <p role="status" className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950">{configurationRestoreMessage}</p>}
                {studio.phase === 'loading' && <p role="status" className="text-sm text-slate-500">Načítám místní záznamy…</p>}
                <div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Délka záznamu</p><p className="mt-2 text-3xl font-semibold tabular-nums" aria-label="Délka záznamu">{formatRecordingDuration(studio.elapsedSeconds)}</p><p className="mt-2 text-xs text-slate-500">{studio.activeRecording ? `${formatRecordingBytes(getRecordingByteLength(studio.activeRecording))} uloženo` : 'Všechny stopy mají společný čas.'}</p></div>
                </div>
                <RecordingStoragePanel studio={studio} isDisabled={!isReady || isLibraryBusy} />
                <section className="space-y-5" aria-labelledby="recording-sources-title">
                    <div className="flex flex-wrap items-center justify-between gap-4"><h2 id="recording-sources-title" className="text-xl font-bold">Zdroje <span className="ml-1 text-slate-400">{studio.sourceConfigurations.length}</span></h2>
                        <div className="flex flex-wrap gap-2">
                            <AdminEditorButton label="Přidat zdroj" title="Přidat zdroj záznamu" buttonProps={{ disabled: !isReady || isLibraryBusy }}>
                                {(closeEditor) => <RecordingSourcePicker initialLabel={`Kamera ${studio.sourceConfigurations.filter(({ kind }) => kind === 'camera').length + 1}`} onAdd={studio.addSource} onClose={closeEditor} />}
                            </AdminEditorButton>
                            {studio.sources.length > 0 && !isSessionBusy && <Button type="button" variant="outline" disabled={!isReady || isLibraryBusy} onClick={studio.releaseSources}>Uvolnit všechna zařízení</Button>}
                            {studio.sourceConfigurations.length > 0 && !isSessionBusy && <Button type="button" variant="outline" disabled={!isReady || isLibraryBusy} onClick={() => setIsResetDialogOpen(true)}>Resetovat nastavení zdrojů</Button>}
                            {isSessionBusy ? <Button type="button" variant="destructive" disabled={studio.phase !== 'recording'} onClick={studio.stopRecording}><Square className="mr-2 h-4 w-4" />{studio.phase === 'stopping' ? 'Ukládám všechny stopy…' : studio.phase === 'starting' ? 'Připravuji záznam…' : 'Zastavit všechny stopy'}</Button> :
                                <Button type="button" disabled={!isReady || isLibraryBusy || !isRecordingReady} onClick={studio.startRecording}><Circle className="mr-2 h-4 w-4 fill-current text-red-400" />Nahrávat připravené zdroje</Button>}
                        </div>
                    </div>
                    <p role="status" className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                        {enabledConfigurations.length === 0
                            ? 'Zapněte alespoň jeden zdroj, který chcete nahrávat.'
                            : `Před zahájením je připraveno ${readySourceCount} z ${enabledConfigurations.length} zapnutých zdrojů. Každý zdroj musí být připojen zvlášť; výběr obrazovky může prohlížeč vyžádat znovu.`}
                    </p>
                    {studio.sourceConfigurations.length === 0 ? <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 p-10 text-center"><Plus className="h-7 w-7 text-slate-400" /><p className="text-sm text-slate-500">Přidejte kameru se zvukem, samostatný mikrofon nebo sdílení obrazovky.</p></div> :
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{studio.sourceConfigurations.map((configuration, sourceIndex) => {
                            const source = studio.sources.find((candidate) => candidate.id === configuration.id && matchesRecordingSourceConfiguration(candidate, configuration)) ?? null;
                            return <RecordingSourcePreview key={configuration.id} configuration={configuration} source={source} readiness={studio.sourceReadiness[configuration.id] ?? 'needs-permission'} errorMessage={studio.sourceErrors[configuration.id] ?? null} byteLength={studio.activeRecording?.tracks.find((track) => track.id === configuration.id)?.byteLength ?? 0} isRecording={isRecording} isBusy={isSessionBusy || !isReady || isLibraryBusy} sourceIndex={sourceIndex} sourceCount={studio.sourceConfigurations.length} onConnect={() => studio.connectSource(configuration.id)} onRemove={() => studio.removeSource(configuration.id)} onMove={(offset) => studio.moveSource(configuration.id, offset)} onSetCaptureEnabled={(isCaptureEnabled) => studio.setSourceCaptureEnabled(configuration.id, isCaptureEnabled)}>
                                <AdminEditorButton label="Nastavení" title="Nastavení zdroje" buttonProps={{ disabled: isSessionBusy || !isReady || isLibraryBusy }}>
                                    {(closeEditor) => <RecordingSourcePicker initialConfiguration={configuration} onAdd={studio.addSource} onClose={closeEditor} />}
                                </AdminEditorButton>
                            </RecordingSourcePreview>;
                        })}</div>}
                    <p className="text-xs leading-5 text-slate-500">{isSessionBusy ? 'Před odchodem nebo odhlášením zastavte nahrávání. Selhání nebo odpojení kterékoli požadované stopy zastaví celý záznam a zachová uložené části i společný čas.' : 'Obraz ani zvuk se neodesílá na server. Nastavení se ukládá v místním úložišti této domény a profilu prohlížeče; po obnovení stránky se zařízení sama nezapnou. Kameru nebo mikrofon může prohlížeč znovu vyžádat a sdílenou plochu je vždy nutné vybrat znovu.'}</p>
                </section>
                <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Resetovat uložená nastavení zdrojů?</AlertDialogTitle>
                            <AlertDialogDescription>Tato akce smaže uložené zdroje a uvolní jejich aktuální náhledy. Již uložené záznamy ani jejich média neovlivní.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Zrušit</AlertDialogCancel>
                            <AlertDialogAction onClick={studio.resetSourceConfigurations}>Resetovat zdroje</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <AlertDialog open={restoreRequest !== null} onOpenChange={(isOpen) => { if (!isOpen) setRestoreRequest(null); }}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Nahradit aktuální nastavení zdrojů?</AlertDialogTitle>
                            <AlertDialogDescription>
                                {restoreRequest && <>Nastavení prohlížeče se nahradí zdroji z „{restoreRequest.recording.title}“ v jejich uloženém pořadí. Nepatřící aktivní náhledy se uvolní; původní záznam, soubory, časová osa a ořez zůstanou beze změny. Zařízení, která nejdou bezpečně zachovat, připojíte zvlášť. Sdílení obrazovky nebo okna vždy vyžádá nový výběr v prohlížeči. Nahrávání se nespustí.</>}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Zrušit</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { if (restoreRequest) finishSourceConfigurationRestore(restoreRequest); }}>Nahradit nastavení zdrojů</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <RecordingLibrary recordings={studio.recordings} isDisabled={!isReady} onChange={studio.updateRecording} onDelete={studio.removeRecording} onBusyChange={setIsLibraryBusy} onStorageChange={studio.refreshStorage} onUseSourceConfiguration={requestSourceConfigurationRestore} />
            </div>
        </main>
    );
}
