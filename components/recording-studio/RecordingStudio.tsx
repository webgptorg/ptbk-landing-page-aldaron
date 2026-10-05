'use client';

import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { isRecordingSourceReady, matchesRecordingSourceConfiguration, reconcileRecordingSourcesForConfiguration } from '@/lib/recording-studio/recordingStudioDevices';
import { areRecordingSourceConfigurationsEqual, getRecordingSourceConfigurationRestore, type RecordingSourceConfigurationRestore } from '@/lib/recording-studio/recordingStudioSourceConfiguration';
import { formatRecordingBytes, formatRecordingDuration, getRecordingByteLength } from '@/lib/recording-studio/recordingStudioTiming';
import { DEFAULT_MONITOR_PREFERENCES, loadRecordingMonitorPreferences, saveRecordingMonitorPreferences, type RecordingMonitorPreferences } from '@/lib/recording-studio/recordingStudioMonitoring';
import type { StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { Circle, Pause, Play, Plus, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { RecordingAlertPanel } from './RecordingAlertPanel';
import { RecordingEditor } from './RecordingEditor';
import { RecordingLibrary } from './RecordingLibrary';
import { RecordingSourcePicker } from './RecordingSourcePicker';
import { RecordingSourcePreview } from './RecordingSourcePreview';
import { RecordingStoragePanel } from './RecordingStoragePanel';
import { useRecordingStudio } from './useRecordingStudio';
import { RecordingStudioOwnershipPanel } from './RecordingStudioOwnershipPanel';

export function RecordingStudio() {
    const studio = useRecordingStudio();
    const { recordingId } = useParams<{ recordingId?: string }>();
    const selectedRecording = studio.recordings.find((recording) => recording.id === recordingId);
    const [isLibraryBusy, setIsLibraryBusy] = useState(false);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [appendRecordingId, setAppendRecordingId] = useState<string | null>(null);
    const [isSourceSetChangeAllowed, setIsSourceSetChangeAllowed] = useState(false);
    const isAppendCaptureStarted = useRef(false);
    const [monitorPreferences, setMonitorPreferences] = useState<RecordingMonitorPreferences>(DEFAULT_MONITOR_PREFERENCES);
    const monitorPreferencesReference = useRef<RecordingMonitorPreferences>(DEFAULT_MONITOR_PREFERENCES);
    const [restoreRequest, setRestoreRequest] = useState<{
        readonly recording: StudioRecording;
        readonly restore: RecordingSourceConfigurationRestore;
        readonly isAppend: boolean;
        readonly reportSuccess?: (message: string) => void;
    } | null>(null);
    const [configurationRestoreMessage, setConfigurationRestoreMessage] = useState<string | null>(null);
    useEffect(() => {
        const loadedPreferences = loadRecordingMonitorPreferences();
        monitorPreferencesReference.current = loadedPreferences;
        setMonitorPreferences(loadedPreferences);
    }, []);
    useEffect(() => {
        if (!appendRecordingId) { isAppendCaptureStarted.current = false; return; }
        if (studio.phase !== 'idle') isAppendCaptureStarted.current = true;
        if (studio.phase === 'idle' && isAppendCaptureStarted.current) {
            isAppendCaptureStarted.current = false;
            setAppendRecordingId(null);
            setIsSourceSetChangeAllowed(false);
        }
    }, [appendRecordingId, studio.phase]);
    const isRecording = studio.phase === 'recording';
    const isPaused = studio.phase === 'paused';
    const isSessionBusy = ['starting', 'recording', 'pausing', 'paused', 'resuming', 'stopping'].includes(studio.phase);
    const sessionStatus = {
        loading: 'Načítání', idle: 'Připraveno', starting: 'Spouštění všech stop', recording: 'Nahrávání',
        pausing: 'Pozastavování a ukládání', paused: 'Pozastaveno', resuming: 'Obnovování všech stop',
        stopping: 'Dokončování a ukládání', unavailable: 'Nedostupné',
    }[studio.phase];
    const isAppendWorkspace = Boolean(recordingId && appendRecordingId === recordingId);
    const isReady = studio.isActive && studio.phase === 'idle' && !studio.isChoosingDirectory;
    const enabledConfigurations = studio.sourceConfigurations.filter(({ isCaptureEnabled }) => isCaptureEnabled);
    const readySourceIds = new Set(enabledConfigurations.filter((configuration) => {
        const source = studio.sources.find((candidate) => candidate.id === configuration.id);
        return Boolean(source && studio.sourceReadiness[configuration.id] === 'ready' &&
            matchesRecordingSourceConfiguration(source, configuration) && isRecordingSourceReady(source));
    }).map((configuration) => configuration.id));
    const readySourceCount = readySourceIds.size;
    const sourcesNeedingConnection = enabledConfigurations.filter((configuration) => !readySourceIds.has(configuration.id));
    const isRecordingReady = enabledConfigurations.length > 0 && readySourceCount === enabledConfigurations.length;
    const latestTake = selectedRecording?.takes?.[selectedRecording.takes.length - 1];
    const previousSourceIds = latestTake?.sourceIds ?? selectedRecording?.tracks.map((track) => track.id) ?? [];
    const isSourceSetChanged = isAppendWorkspace && JSON.stringify([...previousSourceIds].sort()) !==
        JSON.stringify(enabledConfigurations.map((configuration) => configuration.id).sort());
    const primarySourceId = studio.sourceConfigurations.some((configuration) => configuration.id === monitorPreferences.primarySourceId)
        ? monitorPreferences.primarySourceId : studio.sourceConfigurations[0]?.id ?? null;
    const updateMonitorPreferences = (change: Partial<RecordingMonitorPreferences>) => {
        const nextPreferences = { ...monitorPreferencesReference.current, ...change };
        monitorPreferencesReference.current = nextPreferences;
        saveRecordingMonitorPreferences(nextPreferences);
        setMonitorPreferences(nextPreferences);
    };
    const toggleMonitorSource = (field: 'hiddenSourceIds' | 'minimizedSourceIds' | 'audibleSourceIds' | 'mirroredSourceIds', sourceId: string) => {
        const previousIds = monitorPreferencesReference.current[field];
        updateMonitorPreferences({ [field]: previousIds.includes(sourceId)
            ? previousIds.filter((id) => id !== sourceId) : [...previousIds, sourceId] });
    };
    const finishSourceConfigurationRestore = (request: NonNullable<typeof restoreRequest>) => {
        try {
            const result = studio.restoreSourceConfiguration(request.restore);
            if (!result) return;
            const isDisplaySourcePresent = request.restore.configurations.some(({ kind }) => kind === 'screen');
            const legacyMessage = result.isLegacyIncomplete
                ? 'Starší záznam neuložil všechny volby zařízení. Otevřete Nastavení u označené kamery nebo mikrofonu a výběr potvrďte; původní okno ani jeho oprávnění obnovit nelze.'
                : '';
            if (request.isAppend) { setIsSourceSetChangeAllowed(false); setAppendRecordingId(request.recording.id); }
            const message = `Konfigurace záznamu „${request.recording.title}“ je připravena pro ${request.isAppend ? 'donahrání do stejného projektu' : 'nový záznam'}. Zachováno aktivních náhledů: ${result.readySourceCount}; zdrojů k připojení: ${result.sourcesNeedingConnection}. ${isDisplaySourcePresent ? 'Sdílenou obrazovku nebo okno vyberte znovu v dialogu prohlížeče; uložený název a typ jsou jen vodítko. ' : ''}Připojte zdroje a zkontrolujte připravenost; nahrávání se samo nespustí. ${legacyMessage}`.trim();
            setConfigurationRestoreMessage(message);
            request.reportSuccess?.(message);
            setRestoreRequest(null);
        } catch (error) {
            setConfigurationRestoreMessage(error instanceof Error ? error.message : 'Konfiguraci zdrojů se nepodařilo obnovit.');
            request.reportSuccess?.('Konfiguraci zdrojů se nepodařilo obnovit. Zkontrolujte stav studia a zkuste akci znovu.');
            setRestoreRequest(null);
        }
    };
    const requestSourceConfigurationRestore = (recording: StudioRecording, reportSuccess?: (message: string) => void, isAppend = false) => {
        const restore = getRecordingSourceConfigurationRestore(recording);
        const isCurrentSetupPresent = studio.sourceConfigurations.length > 0 || studio.sources.length > 0;
        const sourceReconciliation = reconcileRecordingSourcesForConfiguration(restore.configurations, studio.sources);
        const isAuthorizedSourceReleaseRequired = sourceReconciliation.releasedSources.some((source) => source.stream.getTracks().some((track) => track.readyState === 'live'));
        const isReplacingCurrentSetup = isCurrentSetupPresent &&
            (!areRecordingSourceConfigurationsEqual(studio.sourceConfigurations, restore.configurations) || isAuthorizedSourceReleaseRequired);
        if (isReplacingCurrentSetup) {
            setRestoreRequest({ recording, restore, isAppend, ...(reportSuccess ? { reportSuccess } : {}) });
            return;
        }
        finishSourceConfigurationRestore({ recording, restore, isAppend, ...(reportSuccess ? { reportSuccess } : {}) });
    };
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
            <div className="mx-auto max-w-7xl space-y-9">
                <nav className="flex flex-wrap items-center gap-4 text-sm" aria-label="Režim studia">
                    <Link href="/admin/recording-studio" className="font-semibold text-cyan-800 underline">Studio · nastavení a záznamy</Link>
                    {recordingId && <span>{isAppendWorkspace ? 'Donahrávání do projektu' : 'Střih a export projektu'}</span>}
                </nav>
                <RecordingStudioOwnershipPanel studio={studio} />
                {recordingId && <section className="space-y-5" aria-label="Pracovní prostor záznamu">
                    <h2 className="text-2xl font-bold">{isAppendWorkspace ? 'Donahrávání do projektu' : 'Pracovní prostor záznamu'}</h2>
                    <p className="break-all text-xs text-slate-500">ID: {recordingId} · Média jsou místní pro tento prohlížeč a profil. Adresa je nepřenáší na jiný počítač.</p>
                    {studio.errorMessage && <p role="alert">{studio.errorMessage}</p>}
                    {isAppendWorkspace && <div className="space-y-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950"><p>Nový take začne na konci uložené časové osy. Připojení oprávnění nic nespustí; po kontrole zdrojů stiskněte Start. Původní média i vlastní ořez zůstanou zachované.</p>
                        {!isSessionBusy && <Button type="button" variant="outline" onClick={() => { setAppendRecordingId(null); setIsSourceSetChangeAllowed(false); }}>Zrušit donahrání a vrátit se ke střihu</Button>}</div>}
                    {studio.phase === 'loading' ? <p role="status">Načítám místní záznam…</p> : studio.phase === 'unavailable' ? <p>Záznam je přístupný pouze v aktivní instanci studia. Převzetí a případnou chybu vyřešte výše.</p> : !selectedRecording ? <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-5">
                        <h3 className="font-semibold">Místní záznam není dostupný</h3><p>Na této adrese nejsou v tomto profilu uložená média. Otevřete ji v původním prohlížeči nebo připojte složku záznamu ve studiu. Nový prázdný záznam se nevytváří.</p>
                        <Link href="/admin/recording-studio" className="underline">Otevřít studio a obnovit ze složky</Link>
                    </div> : studio.phase === 'idle' && !isAppendWorkspace && <>
                        <RecordingEditor key={selectedRecording.id} recording={selectedRecording} isDisabled={isLibraryBusy || !studio.isActive} onChange={studio.updateRecording} onUseSourceConfiguration={(reportSuccess) => requestSourceConfigurationRestore(selectedRecording, reportSuccess)} onAppend={() => requestSourceConfigurationRestore(selectedRecording, undefined, true)} />
                        <RecordingLibrary recordings={[selectedRecording]} isWorkspace isDisabled={!isReady} onChange={studio.updateRecording} onDelete={studio.removeRecording} onBusyChange={setIsLibraryBusy} onStorageChange={studio.refreshStorage} onUseSourceConfiguration={requestSourceConfigurationRestore} />
                    </>}
                </section>}
                <div className={recordingId && !isAppendWorkspace ? 'hidden' : 'contents'}>
                <div className="max-w-3xl space-y-2"><h2 className="text-2xl font-bold">{isAppendWorkspace ? 'Příprava a živý monitor projektu' : 'Nahrávací studio'}</h2><p className="text-sm leading-6 text-slate-600">Kamera může nahrávat vybraný mikrofon do svého video souboru. Rozložení, poslech a zrcadlení živého náhledu jsou pouze volby monitoru; nemění surové soubory. Zastavení ponechá náhledy aktivní, dokud zařízení neuvolníte.</p></div>
                {studio.errorMessage && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{studio.errorMessage}</p>}
                {configurationRestoreMessage && <p role="status" className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950">{configurationRestoreMessage}</p>}
                {studio.phase === 'loading' && <p role="status" className="text-sm text-slate-500">Načítám místní záznamy…</p>}
                <div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Společný čas záznamu · {sessionStatus}</p><p className="mt-2 text-3xl font-semibold tabular-nums" aria-label="Délka záznamu">{formatRecordingDuration(studio.elapsedSeconds)}</p><p className="mt-2 text-xs text-slate-500">{studio.activeRecording ? `${formatRecordingBytes(getRecordingByteLength(studio.activeRecording))} uloženo` : 'Všechny stopy mají společný čas.'}</p></div>
                </div>
                <RecordingAlertPanel studio={studio} isTakeRunning={isSessionBusy} />
                <RecordingStoragePanel studio={studio} isDisabled={!isReady || isLibraryBusy} />
                <section className="space-y-5" aria-labelledby="recording-sources-title">
                    <div className="flex flex-wrap items-center justify-between gap-4"><h2 id="recording-sources-title" className="text-xl font-bold">Zdroje <span className="ml-1 text-slate-400">{studio.sourceConfigurations.length}</span></h2>
                        <div className="flex flex-wrap gap-2">
                            <AdminEditorButton label="Přidat zdroj" title="Přidat zdroj záznamu" buttonProps={{ disabled: !isReady || isLibraryBusy }}>
                                {(closeEditor) => <RecordingSourcePicker isDisabled={!studio.isActive} initialLabel={`Kamera ${studio.sourceConfigurations.filter(({ kind }) => kind === 'camera').length + 1}`} onAdd={studio.addSource} onClose={closeEditor} />}
                            </AdminEditorButton>
                            {studio.sources.length > 0 && !isSessionBusy && <Button type="button" variant="outline" disabled={!isReady || isLibraryBusy} onClick={studio.releaseSources}>Uvolnit všechna zařízení</Button>}
                            {studio.sourceConfigurations.length > 0 && !isSessionBusy && <Button type="button" variant="outline" disabled={!isReady || isLibraryBusy} onClick={() => setIsResetDialogOpen(true)}>Resetovat nastavení zdrojů</Button>}
                            {isSessionBusy ? <>
                                <Button type="button" variant="outline" disabled={!studio.isActive || (!isRecording && !isPaused)} onClick={isPaused ? studio.resumeRecording : studio.pauseRecording}>{isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}{isPaused ? 'Pokračovat ve všech stopách' : studio.phase === 'pausing' ? 'Ukládám pauzu…' : 'Pozastavit všechny stopy'}</Button>
                                <Button type="button" variant="destructive" disabled={!studio.isActive || (!isRecording && !isPaused)} onClick={studio.stopRecording}><Square className="mr-2 h-4 w-4" />{studio.phase === 'stopping' ? 'Ukládám všechny stopy…' : 'Zastavit všechny stopy'}</Button>
                            </> : <Button type="button" disabled={!isReady || isLibraryBusy || !isRecordingReady || (isSourceSetChanged && !isSourceSetChangeAllowed)} onClick={() => studio.startRecording(isAppendWorkspace ? selectedRecording : undefined, isSourceSetChangeAllowed)}><Circle className="mr-2 h-4 w-4 fill-current text-red-400" />{isAppendWorkspace ? 'Start · donahrát do projektu' : 'Nahrávat připravené zdroje'}</Button>}
                        </div>
                    </div>
                    <p role="status" className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                        {enabledConfigurations.length === 0
                            ? 'Zapněte alespoň jeden zdroj, který chcete nahrávat.'
                            : `${sessionStatus}: ${readySourceCount} z ${enabledConfigurations.length} zapnutých zdrojů · ${studio.activeRecording?.tracks.length ?? enabledConfigurations.length} stop v celém projektu. Rozložení monitoru nemění počet nahrávaných zdrojů.`}
                    </p>
                    {sourcesNeedingConnection.length > 0 && !isSessionBusy && <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm" aria-label="Zdroje k připojení">
                        <span className="font-medium text-amber-950">Před Start připojte:</span>
                        {sourcesNeedingConnection.map((configuration) => <Button key={configuration.id} type="button" variant="outline" size="sm" disabled={!isReady || isLibraryBusy} onClick={() => { void studio.connectSource(configuration.id); }}>Připojit {configuration.label}</Button>)}
                    </div>}
                    {isSourceSetChanged && <label className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"><input type="checkbox" checked={isSourceSetChangeAllowed} disabled={!studio.isActive || isSessionBusy} onChange={(event) => setIsSourceSetChangeAllowed(event.target.checked)} className="mt-1" /><span>Výslovně změnit sadu zdrojů v tomto novém take. Chybějící původní zdroje zůstanou v projektu jako mezery; nové zdroje mají mezeru před tímto take. Dřívější média se nemažou.</span></label>}
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm" aria-label="Rozložení živého monitoru">
                        <span className="mr-2 font-medium">Živý monitor</span>
                        {(['grid', 'focus', 'pinned'] as const).map((layout) => <Button key={layout} type="button" size="sm" variant="outline" aria-pressed={monitorPreferences.layout === layout} onClick={() => updateMonitorPreferences({ layout })}>{layout === 'grid' ? 'Mřížka' : layout === 'focus' ? 'Jeden zdroj' : 'Připnutý zdroj'}</Button>)}
                        {monitorPreferences.layout !== 'grid' && <label className="flex items-center gap-2">Hlavní zdroj <select aria-label="Hlavní zdroj monitoru" className="rounded border p-2" value={primarySourceId ?? ''} onChange={(event) => updateMonitorPreferences({ primarySourceId: event.target.value })}>{studio.sourceConfigurations.map((configuration) => <option key={configuration.id} value={configuration.id}>{configuration.label}</option>)}</select></label>}
                        {monitorPreferences.hiddenSourceIds.filter((id) => studio.sourceConfigurations.some((configuration) => configuration.id === id)).map((id) => <Button key={id} type="button" variant="outline" size="sm" onClick={() => toggleMonitorSource('hiddenSourceIds', id)}>Zobrazit {studio.sourceConfigurations.find((configuration) => configuration.id === id)?.label}</Button>)}
                    </div>
                    {studio.sourceConfigurations.length === 0 ? <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 p-10 text-center"><Plus className="h-7 w-7 text-slate-400" /><p className="text-sm text-slate-500">Přidejte kameru se zvukem, samostatný mikrofon nebo sdílení obrazovky.</p></div> :
                        <div className={`grid gap-4 ${monitorPreferences.layout === 'focus' ? 'grid-cols-1' : monitorPreferences.layout === 'pinned' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>{studio.sourceConfigurations.map((configuration, sourceIndex) => {
                            const source = studio.sources.find((candidate) => candidate.id === configuration.id && matchesRecordingSourceConfiguration(candidate, configuration)) ?? null;
                            const isFocusHidden = monitorPreferences.layout === 'focus' && configuration.id !== primarySourceId;
                            const isPinnedPrimary = monitorPreferences.layout === 'pinned' && configuration.id === primarySourceId;
                            const isHidden = isFocusHidden || (monitorPreferences.layout !== 'focus' &&
                                !isPinnedPrimary && monitorPreferences.hiddenSourceIds.includes(configuration.id));
                            return <div key={configuration.id} className={`${isHidden ? 'hidden' : ''} ${monitorPreferences.layout === 'pinned' && configuration.id === primarySourceId ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
                                <RecordingSourcePreview configuration={configuration} source={source} readiness={studio.sourceReadiness[configuration.id] ?? 'needs-permission'} errorMessage={studio.sourceErrors[configuration.id] ?? null} byteLength={studio.activeRecording?.tracks.find((track) => track.id === configuration.id)?.byteLength ?? 0} isRecording={isRecording || isPaused} capturePhase={isSessionBusy ? studio.phase as 'recording' | 'pausing' | 'paused' | 'resuming' | 'starting' | 'stopping' : 'idle'} isBusy={isSessionBusy || !isReady || isLibraryBusy} sourceIndex={sourceIndex} sourceCount={studio.sourceConfigurations.length}
                                    isPreviewMinimized={monitorPreferences.minimizedSourceIds.includes(configuration.id)} isPreviewMuted={!monitorPreferences.audibleSourceIds.includes(configuration.id)} isMirrorPreview={monitorPreferences.mirroredSourceIds.includes(configuration.id)}
                                    onTogglePreviewMinimized={() => toggleMonitorSource('minimizedSourceIds', configuration.id)} onTogglePreviewMuted={() => toggleMonitorSource('audibleSourceIds', configuration.id)} onToggleMirrorPreview={() => toggleMonitorSource('mirroredSourceIds', configuration.id)}
                                    onConnect={() => studio.connectSource(configuration.id)} onRemove={() => studio.removeSource(configuration.id)} onMove={(offset) => studio.moveSource(configuration.id, offset)} onSetCaptureEnabled={(isCaptureEnabled) => studio.setSourceCaptureEnabled(configuration.id, isCaptureEnabled)}>
                                <AdminEditorButton label="Nastavení" title="Nastavení zdroje" buttonProps={{ disabled: isSessionBusy || !isReady || isLibraryBusy }}>
                                    {(closeEditor) => <RecordingSourcePicker isDisabled={!studio.isActive} initialConfiguration={configuration} onAdd={studio.addSource} onClose={closeEditor} />}
                                </AdminEditorButton>
                                </RecordingSourcePreview>
                                {monitorPreferences.layout !== 'focus' && !isPinnedPrimary && <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => toggleMonitorSource('hiddenSourceIds', configuration.id)}>Skrýt dlaždici z monitoru</Button>}
                            </div>;
                        })}</div>}
                    <p className="text-xs leading-5 text-slate-500">{isSessionBusy ? 'Před odchodem nebo odhlášením zastavte nahrávání. Selhání nebo odpojení zdroje zastaví jen jeho stopu, ohlásí se výstrahou a ostatní stopy nahrávají dál na společném čase; celý záznam skončí, až když nezbude co nahrávat nebo když selže ukládání.' : 'Obraz ani zvuk se neodesílá na server. Nastavení se ukládá v místním úložišti této domény a profilu prohlížeče; po obnovení stránky se zařízení sama nezapnou. Kameru nebo mikrofon může prohlížeč znovu vyžádat a sdílenou plochu je vždy nutné vybrat znovu.'}</p>
                </section>
                <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Resetovat uložená nastavení zdrojů?</AlertDialogTitle>
                            <AlertDialogDescription>Tato akce smaže uložené zdroje a uvolní jejich aktuální náhledy. Již uložené záznamy ani jejich média neovlivní.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Zrušit</AlertDialogCancel>
                            <AlertDialogAction disabled={!studio.isActive} onClick={studio.resetSourceConfigurations}>Resetovat zdroje</AlertDialogAction>
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
                            <AlertDialogAction disabled={!studio.isActive} onClick={() => { if (restoreRequest) finishSourceConfigurationRestore(restoreRequest); }}>Nahradit nastavení zdrojů</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                {!recordingId && <RecordingLibrary recordings={studio.recordings} isDisabled={!isReady} onChange={studio.updateRecording} onDelete={studio.removeRecording} onBusyChange={setIsLibraryBusy} onStorageChange={studio.refreshStorage} onUseSourceConfiguration={requestSourceConfigurationRestore} />}
                </div>
            </div>
        </main>
    );
}
