'use client';

import { flushAdminSaves } from '@/lib/admin/adminPendingSaves';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { RecordingStudioCapture } from '@/lib/recording-studio/RecordingStudioCapture';
import { acquireRecordingSource, getRecordingErrorMessage, getRecordingSourceReadiness, isRecordingSourceReady, isRecordingSourceTemporarilyUnavailable, matchesRecordingSourceConfiguration, reconcileRecordingSourcesForConfiguration, releaseRecordingSource } from '@/lib/recording-studio/recordingStudioDevices';
import { clearRecordingSourceConfigurations, loadRecordingSourceConfigurations, saveRecordingSourceConfigurations, toRecordingSourceConfiguration, UNKNOWN_LEGACY_DEVICE_ID, type RecordingSourceConfigurationRestore } from '@/lib/recording-studio/recordingStudioSourceConfiguration';
import { runWithRecordingStudioLock } from '@/lib/recording-studio/recordingStudioLock';
import { estimateRecordingStorage, getRecordingStorageErrorMessage, isRecordingOriginStorageLow, readRecordingPersistence, RECORDING_STORAGE_REFRESH_MILLISECONDS, requestRecordingPersistence, UNKNOWN_RECORDING_STORAGE } from '@/lib/recording-studio/recordingStudioCapacity';
import { chooseRecordingDirectory } from '@/lib/recording-studio/recordingStudioDirectory';
import { importStudioRecordingDirectory, readStudioRecording, recoverStudioRecordings, resetRecordingDirectoryCache } from '@/lib/recording-studio/recordingStudioStorage';
import { getRecordingSessionDuration } from '@/lib/recording-studio/recordingStudioSessionTime';
import { RecordingBitrateMeter } from '@/lib/recording-studio/recordingStudioTiming';
import {
    type RecordingPersistence, type RecordingSource, type RecordingSourceConfiguration, type RecordingSourceReadiness, type StudioRecording,
} from '@/lib/recording-studio/recordingStudioTypes';
import type { RecordingAlert } from '@/lib/recording-studio/recordingStudioAlerts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecordingStudioAlerts } from './useRecordingStudioAlerts';

function getMutedAudioReadinessMessage(source: RecordingSource, configuration: RecordingSourceConfiguration): string {
    const microphoneName = source.microphoneLabel || source.label;
    return configuration.kind === 'camera'
        ? `Mikrofon „${microphoneName}“ dočasně neposílá zvuk. Znovu připojte kameru se zvukem nebo výslovně vypněte Nahrávat zvuk.`
        : `Mikrofon „${microphoneName}“ dočasně neposílá zvuk. Znovu připojte zdroj nebo vyberte jiný mikrofon.`;
}

function getMutedVideoReadinessMessage(source: RecordingSource): string {
    return `Prohlížeč nebo systém dočasně neposílá obraz ze zdroje „${source.label}“. Záznam se při tomto přerušení zastaví; připojte zdroj znovu a potvrďte výběr v prohlížeči.`;
}

function getRecordingSourceReadinessMessage(source: RecordingSource, configuration: RecordingSourceConfiguration): string {
    const videoTrack = source.stream.getVideoTracks()[0];
    if (configuration.kind !== 'microphone') {
        if (videoTrack?.readyState === 'live' && videoTrack.muted) return getMutedVideoReadinessMessage(source);
        if (!videoTrack || videoTrack.readyState === 'ended') {
            return configuration.kind === 'screen'
                ? `Sdílené okno, karta nebo obrazovka „${source.label}“ skončila. Připojte zdroj znovu a vyberte jej v dialogu prohlížeče.`
                : `Obraz z kamery „${source.label}“ skončil. Připojte kameru znovu nebo změňte výběr.`;
        }
    }

    const isAudioRequired = configuration.kind === 'microphone' ||
        (configuration.kind === 'camera' && configuration.isAudioEnabled);
    if (isAudioRequired) {
        const audioTrack = source.stream.getAudioTracks()[0];
        if (audioTrack?.readyState === 'live' && audioTrack.muted) return getMutedAudioReadinessMessage(source, configuration);
        if (!audioTrack || audioTrack.readyState === 'ended') {
            return `Mikrofon „${source.microphoneLabel || source.label}“ skončil. Připojte zdroj znovu nebo vyberte jiný mikrofon.`;
        }
    }

    return `Zdroj „${source.label}“ není připraven. Připojte jej znovu nebo změňte výběr.`;
}

export function useRecordingStudio() {
    const alertChannel = useRecordingStudioAlerts();
    const [sources, setSources] = useState<RecordingSource[]>([]);
    const [sourceConfigurations, setSourceConfigurations] = useState<RecordingSourceConfiguration[]>([]);
    const [sourceErrors, setSourceErrors] = useState<Record<string, string>>({});
    const [sourceReadiness, setSourceReadiness] = useState<Record<string, RecordingSourceReadiness>>({});
    const [recordings, setRecordings] = useState<StudioRecording[]>([]);
    const [activeRecording, setActiveRecording] = useState<StudioRecording | null>(null);
    const [storage, setStorage] = useState(UNKNOWN_RECORDING_STORAGE);
    const [persistence, setPersistence] = useState<RecordingPersistence>('not-granted');
    const [directory, setDirectory] = useState<FileSystemDirectoryHandle | null>(null);
    const [isChoosingDirectory, setIsChoosingDirectory] = useState(false);
    const directoryReference = useRef<FileSystemDirectoryHandle | null>(null);
    const directoryOperation = useRef(false);
    const storageRequest = useRef<Promise<void> | null>(null);
    const bitrateMeter = useRef(new RecordingBitrateMeter());
    const [measuredBytesPerSecond, setMeasuredBytesPerSecond] = useState<number | null>(null);
    const [pendingBytes, setPendingBytes] = useState(0);
    const [phase, setPhase] = useState<'loading' | 'idle' | 'starting' | 'recording' | 'pausing' | 'paused' | 'resuming' | 'stopping' | 'unavailable'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const runtime = useRef({ isDisposed: false, isAddingSource: false, isStartPending: false, capture: null as RecordingStudioCapture | null, sources: [] as RecordingSource[], sourceConfigurations: [] as RecordingSourceConfiguration[] });

    /**
     * Puts one announced failure where the administrator is already looking
     *
     * Note: A failure of one source reuses the very card and readiness state a disconnected source has when the studio
     *       is idle, so a take which went on recording without that source still says so in one place only.
     */
    const showAnnouncedAlert = useCallback((alert: RecordingAlert) => {
        setErrorMessage(alert.message);
        const failedSourceId = alert.sourceId;
        if (failedSourceId === null) return;
        setSourceErrors((previous) => ({ ...previous, [failedSourceId]: alert.message }));
        setSourceReadiness((previous) => ({ ...previous, [failedSourceId]: 'disconnected' }));
    }, []);

    const refreshStorage = useCallback((): Promise<void> => {
        // A deletion/finalization may occur while a poll is in flight. Sample again after that older request.
        if (storageRequest.current) return storageRequest.current.then(() => refreshStorage());
        storageRequest.current = (async () => {
            const estimate = await estimateRecordingStorage();
            if (runtime.current.isDisposed) return;
            setStorage(estimate);
            if (!directoryReference.current && isRecordingOriginStorageLow(estimate)) {
                void runtime.current.capture?.stop('Prohlížeč hlásí málo prostoru pro web. Všechny stopy byly zastaveny; uložené části zůstávají dostupné.');
            }
        })().finally(() => { storageRequest.current = null; });
        return storageRequest.current;
    }, []);

    useEffect(() => {
        const current = { isDisposed: false, isAddingSource: false, isStartPending: false, capture: null as RecordingStudioCapture | null, sources: [] as RecordingSource[], sourceConfigurations: [] as RecordingSourceConfiguration[] };
        runtime.current = current;
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined' || !window.indexedDB || !navigator.locks) {
            setErrorMessage('Studio potřebuje HTTPS (nebo localhost), snímání médií, MediaRecorder, IndexedDB a zámky prohlížeče. Otevřete ho v podporovaném aktuálním prohlížeči.');
            setPhase('unavailable');
            return;
        }
        let releaseLock: (() => void) | undefined;
        const released = new Promise<void>((resolve) => { releaseLock = resolve; });
        // One owner also prevents another tab from deleting or recovering an active take.
        void runWithRecordingStudioLock(async (lock) => {
            if (current.isDisposed) return;
            if (!lock) {
                setErrorMessage('Studio už je otevřené v jiné kartě. Zavřete ji a obnovte tuto stránku.');
                setPhase('unavailable');
                return;
            }
            try {
                resetRecordingDirectoryCache();
                current.sourceConfigurations = loadRecordingSourceConfigurations();
                setSourceConfigurations(current.sourceConfigurations);
                setSourceReadiness(Object.fromEntries(current.sourceConfigurations.map(({ id }) => [id, 'needs-permission' as const])));
                const recovered = await recoverStudioRecordings();
                const { clearRecordingExportTemporaryFiles } = await import('@/lib/recording-studio/recordingStudioTrim');
                await clearRecordingExportTemporaryFiles().catch(() => undefined);
                if (!current.isDisposed) {
                    setRecordings(recovered);
                    setPhase('idle');
                    await refreshStorage();
                    const result = await readRecordingPersistence();
                    if (!current.isDisposed) setPersistence(result);
                }
            } catch (error) {
                if (!current.isDisposed) { setErrorMessage(getRecordingErrorMessage(error)); setPhase('unavailable'); }
            }
            await released;
            await current.capture?.stop('Stránka studia byla zavřena.');
            current.sources.forEach(releaseRecordingSource);
            current.sources = [];
            // History navigation can unmount the page before an editor save or cancelled export settles.
            await flushAdminSaves();
        }).catch((error: unknown) => {
            if (!current.isDisposed) { setErrorMessage(getRecordingErrorMessage(error)); setPhase('unavailable'); }
        });
        const storageTimer = setInterval(() => { void refreshStorage(); }, RECORDING_STORAGE_REFRESH_MILLISECONDS);
        return () => {
            current.isDisposed = true;
            clearInterval(storageTimer);
            void current.capture?.stop('Stránka studia byla zavřena.').finally(() => {
                current.sources.forEach(releaseRecordingSource);
                current.sources = [];
            });
            if (!current.capture) {
                current.sources.forEach(releaseRecordingSource);
                current.sources = [];
            }
            releaseLock?.();
        };
    }, [refreshStorage]);

    useEffect(() => {
        if (phase !== 'recording' && phase !== 'paused' && phase !== 'pausing') return;
        const update = () => {
            setElapsedSeconds(runtime.current.capture?.elapsedRecordingSeconds ?? 0);
            setMeasuredBytesPerSecond(bitrateMeter.current.read());
        };
        update();
        const timer = setInterval(update, 250);
        return () => clearInterval(timer);
    }, [phase]);

    const chooseDirectory = async (isImport: boolean) => {
        if (phase !== 'idle' || runtime.current.capture || directoryOperation.current) return;
        directoryOperation.current = true; setIsChoosingDirectory(true); setErrorMessage(null);
        // Invoke immediately while the native picker still has the click gesture.
        const selection = chooseRecordingDirectory(isImport);
        try {
            const selected = await selection;
            if (isImport) {
                const recording = await protectAdminMutation(() => importStudioRecordingDirectory(selected));
                setRecordings((previous) => [recording, ...previous.filter((item) => item.id !== recording.id)]);
            } else { directoryReference.current = selected; setDirectory(selected); }
            await refreshStorage();
        } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError')) setErrorMessage(error instanceof DOMException ? getRecordingStorageErrorMessage(error, false) : getRecordingErrorMessage(error));
        } finally { directoryOperation.current = false; setIsChoosingDirectory(false); }
    };

    const persistSourceConfigurations = (configurations: readonly RecordingSourceConfiguration[]) => {
        const nextConfigurations = [...configurations];
        runtime.current.sourceConfigurations = nextConfigurations;
        setSourceConfigurations(nextConfigurations);
        setSourceReadiness((previous) => Object.fromEntries(nextConfigurations.map(({ id }) => [id, previous[id] ?? 'needs-permission'])));
        try {
            saveRecordingSourceConfigurations(nextConfigurations);
        } catch (error) {
            setErrorMessage(getRecordingErrorMessage(error));
        }
    };

    const releaseSources = () => {
        const current = runtime.current;
        current.sources.forEach(releaseRecordingSource);
        current.sources = [];
        setSources([]);
        setSourceErrors({});
        setSourceReadiness(Object.fromEntries(current.sourceConfigurations.map(({ id }) => [id, 'needs-permission' as const])));
    };

    const removeSource = (sourceId: string) => {
        if (runtime.current.capture) return;
        const current = runtime.current;
        const source = current.sources.find((candidate) => candidate.id === sourceId);
        if (source) releaseRecordingSource(source);
        current.sources = current.sources.filter((candidate) => candidate.id !== sourceId);
        setSources([...current.sources]);
        setSourceErrors((previous) => { const next = { ...previous }; delete next[sourceId]; return next; });
        persistSourceConfigurations(current.sourceConfigurations.filter((configuration) => configuration.id !== sourceId));
    };

    const resetSourceConfigurations = () => {
        if (runtime.current.capture || phase !== 'idle') return;
        releaseSources();
        runtime.current.sourceConfigurations = [];
        setSourceConfigurations([]);
        setSourceReadiness({});
        clearRecordingSourceConfigurations();
    };

    const moveSource = (sourceId: string, offset: -1 | 1) => {
        const current = runtime.current;
        if (current.capture || phase !== 'idle') return;
        const sourceIndex = current.sourceConfigurations.findIndex(({ id }) => id === sourceId);
        const destinationIndex = sourceIndex + offset;
        if (sourceIndex < 0 || destinationIndex < 0 || destinationIndex >= current.sourceConfigurations.length) return;
        const nextConfigurations = [...current.sourceConfigurations];
        [nextConfigurations[sourceIndex], nextConfigurations[destinationIndex]] = [nextConfigurations[destinationIndex], nextConfigurations[sourceIndex]];
        persistSourceConfigurations(nextConfigurations);
    };

    const setSourceCaptureEnabled = (sourceId: string, isCaptureEnabled: boolean) => {
        const current = runtime.current;
        if (current.capture || phase !== 'idle') return;
        const nextConfigurations = current.sourceConfigurations.map((configuration) =>
            configuration.id === sourceId ? { ...configuration, isCaptureEnabled } : configuration,
        );
        persistSourceConfigurations(nextConfigurations);
        const source = current.sources.find((candidate) => candidate.id === sourceId);
        if (!isCaptureEnabled && source) {
            releaseRecordingSource(source);
            current.sources = current.sources.filter((candidate) => candidate.id !== sourceId);
            setSources([...current.sources]);
            setSourceReadiness((previous) => ({ ...previous, [sourceId]: 'needs-permission' }));
        }
    };

    const addSource = async (configuration: RecordingSourceConfiguration) => {
        const current = runtime.current;
        if (current.capture || current.isAddingSource || phase !== 'idle') return;
        current.isAddingSource = true;
        setErrorMessage(null);
        setSourceErrors((previous) => { const next = { ...previous }; delete next[configuration.id]; return next; });
        try {
            const previousConfiguration = current.sourceConfigurations.find((candidate) => candidate.id === configuration.id);
            const previousSource = current.sources.find((candidate) => candidate.id === configuration.id);
            const isSameCaptureConfiguration = previousConfiguration &&
                previousConfiguration.kind === configuration.kind &&
                previousConfiguration.cameraDeviceId === configuration.cameraDeviceId &&
                previousConfiguration.microphoneDeviceId === configuration.microphoneDeviceId &&
                previousConfiguration.displaySurface === configuration.displaySurface &&
                previousConfiguration.isCaptureEnabled === configuration.isCaptureEnabled &&
                previousConfiguration.isAudioEnabled === configuration.isAudioEnabled;
            const nextConfigurations = current.sourceConfigurations.some((candidate) => candidate.id === configuration.id)
                ? current.sourceConfigurations.map((candidate) => candidate.id === configuration.id ? configuration : candidate)
                : [...current.sourceConfigurations, configuration];
            persistSourceConfigurations(nextConfigurations);
            if (!configuration.isCaptureEnabled) {
                if (previousSource) releaseRecordingSource(previousSource);
                current.sources = current.sources.filter((candidate) => candidate.id !== configuration.id);
                setSources([...current.sources]);
                setSourceReadiness((previous) => ({ ...previous, [configuration.id]: 'needs-permission' }));
                return;
            }
            if (previousSource && isSameCaptureConfiguration && matchesRecordingSourceConfiguration(previousSource, configuration) && isRecordingSourceReady(previousSource)) {
                const updatedSource = { ...previousSource, ...configuration, stream: previousSource.stream, microphoneLabel: previousSource.microphoneLabel };
                current.sources = current.sources.map((candidate) => candidate.id === configuration.id ? updatedSource : candidate);
                setSources([...current.sources]);
                setSourceReadiness((previous) => ({ ...previous, [configuration.id]: 'ready' }));
                return;
            }
            if (previousSource) {
                releaseRecordingSource(previousSource);
                current.sources = current.sources.filter((candidate) => candidate.id !== configuration.id);
                setSources([...current.sources]);
            }
            setSourceReadiness((previous) => ({ ...previous, [configuration.id]: 'needs-permission' }));
            // Keep the saved intent before requesting permission. A failed or cancelled dialog can be retried or
            // changed to a different microphone/video-only without losing the requested source card.
            const source = await acquireRecordingSource(configuration, current.sources);
            if (current.isDisposed) { releaseRecordingSource(source); return; }
            current.sources.push(source);
            const savedConfiguration = toRecordingSourceConfiguration(source);
            const updatedConfigurations = current.sourceConfigurations.map((candidate) => candidate.id === source.id ? savedConfiguration : candidate);
            persistSourceConfigurations(updatedConfigurations);
            const isSourceReady = isRecordingSourceReady(source);
            const isTemporarilyUnavailable = isRecordingSourceTemporarilyUnavailable(source);
            setSourceReadiness((previous) => ({
                ...previous,
                [source.id]: isSourceReady ? 'ready' : isTemporarilyUnavailable ? 'temporarily-unavailable' : 'unavailable',
            }));
            if (!isSourceReady) {
                setSourceErrors((previous) => ({ ...previous, [source.id]: getRecordingSourceReadinessMessage(source, configuration) }));
            }
            source.stream.getTracks().forEach((track) => {
                track.addEventListener('ended', () => {
                    if (current.isDisposed || current.capture) return;
                    releaseRecordingSource(source);
                    current.sources = current.sources.filter((candidate) => candidate.id !== source.id);
                    setSources([...current.sources]);
                    const message = configuration.kind === 'screen'
                        ? `Sdílené okno, karta nebo obrazovka „${source.label}“ skončila nebo byla odpojena. Připojte zdroj znovu a vyberte jej v dialogu prohlížeče.`
                        : `Zařízení „${source.label}“ bylo odpojeno. Připojte jej znovu nebo změňte výběr.`;
                    // A source lost while preparing is announced too: nobody watches this tab while setting a room up.
                    showAnnouncedAlert(alertChannel.announceFailure({ impact: 'no-recording', message, sourceId: source.id, sourceLabel: source.label }));
                }, { once: true });

                const isRequiredAudioTrack = track.kind === 'audio' &&
                    (configuration.kind === 'microphone' || (configuration.kind === 'camera' && configuration.isAudioEnabled));
                const isRequiredVideoTrack = track.kind === 'video' && configuration.kind !== 'microphone';
                if (isRequiredAudioTrack || isRequiredVideoTrack) {
                    const updateTrackReadiness = () => {
                        if (current.isDisposed || source.stream.getTracks().some((sourceTrack) => sourceTrack.readyState === 'ended')) return;
                        const isSourceReady = isRecordingSourceReady(source);
                        const isTemporarilyUnavailable = track.muted;
                        const nextReadiness = isSourceReady ? 'ready' : isTemporarilyUnavailable ? 'temporarily-unavailable' : 'unavailable';
                        setSourceReadiness((previous) => ({ ...previous, [source.id]: nextReadiness }));
                        setSourceErrors((previous) => {
                            const next = { ...previous };
                            if (isSourceReady) delete next[source.id];
                            else next[source.id] = isRequiredVideoTrack ? getMutedVideoReadinessMessage(source) : getMutedAudioReadinessMessage(source, configuration);
                            return next;
                        });
                    };
                    track.addEventListener('mute', updateTrackReadiness);
                    track.addEventListener('unmute', updateTrackReadiness);
                }
            });
            setSources([...current.sources]);
        } catch (error) {
            const message = getRecordingErrorMessage(error, configuration);
            setSourceErrors((previous) => ({ ...previous, [configuration.id]: message }));
            setSourceReadiness((previous) => ({ ...previous, [configuration.id]: getRecordingSourceReadiness(error) }));
            setErrorMessage(message);
            throw error;
        } finally {
            current.isAddingSource = false;
        }
    };

    const connectSource = async (sourceId: string) => {
        const configuration = runtime.current.sourceConfigurations.find((candidate) => candidate.id === sourceId);
        if (!configuration) return;
        if (configuration.cameraDeviceId === UNKNOWN_LEGACY_DEVICE_ID || configuration.microphoneDeviceId === UNKNOWN_LEGACY_DEVICE_ID) {
            const message = 'Starší záznam neuložil výběr této kamery nebo mikrofonu. Otevřete Nastavení, vyberte dostupné zařízení nebo výchozí zařízení systému a potom jej připojte.';
            setSourceErrors((previous) => ({ ...previous, [sourceId]: message }));
            setSourceReadiness((previous) => ({ ...previous, [sourceId]: 'unavailable' }));
            setErrorMessage(message);
            return;
        }
        await addSource(configuration);
    };

    const restoreSourceConfiguration = (restore: RecordingSourceConfigurationRestore) => {
        const current = runtime.current;
        if (phase !== 'idle' || current.capture || current.isAddingSource || directoryOperation.current) {
            throw new Error('Nejprve dokončete právě probíhající operaci studia.');
        }

        const restoredConfigurations = restore.configurations.map((configuration) => ({ ...configuration }));
        const reconciliation = reconcileRecordingSourcesForConfiguration(restoredConfigurations, current.sources);
        reconciliation.releasedSources.forEach(releaseRecordingSource);
        current.sources = [...reconciliation.retainedSources];
        setSources([...current.sources]);
        setSourceErrors({});
        persistSourceConfigurations(restoredConfigurations);
        setSourceReadiness(Object.fromEntries(restoredConfigurations.map(({ id }) => [
            id,
            current.sources.some((source) => source.id === id) ? 'ready' as const : 'needs-permission' as const,
        ])));
        setErrorMessage(null);

        return {
            readySourceCount: current.sources.length,
            sourcesNeedingConnection: restoredConfigurations.filter(({ isCaptureEnabled, id }) => isCaptureEnabled && !current.sources.some((source) => source.id === id)).length,
            isLegacyIncomplete: restore.isLegacyIncomplete,
        };
    };

    const startRecording = (appendTo?: StudioRecording, isSourceSetChangeAllowed = false) => {
        const current = runtime.current;
        const enabledConfigurations = current.sourceConfigurations.filter(({ isCaptureEnabled }) => isCaptureEnabled);
        const recordingSources = enabledConfigurations.map((configuration) => current.sources.find((source) =>
            matchesRecordingSourceConfiguration(source, configuration) && isRecordingSourceReady(source),
        )).filter((source): source is RecordingSource => source !== undefined);
        if (phase !== 'idle' || current.capture || current.isStartPending || current.isAddingSource || directoryOperation.current ||
            enabledConfigurations.length === 0 || recordingSources.length !== enabledConfigurations.length) return;
        const latestTake = appendTo?.takes?.[appendTo.takes.length - 1];
        const previousSourceIds = latestTake?.sourceIds ?? appendTo?.tracks.map((track) => track.id) ?? [];
        if (appendTo && (appendTo.status !== 'complete' || (!isSourceSetChangeAllowed &&
            JSON.stringify([...previousSourceIds].sort()) !== JSON.stringify([...recordingSources.map((source) => source.id)].sort())))) {
            setErrorMessage('Donahrání vyžaduje připravenou původní sadu zdrojů. Změnu sady potvrďte výslovně.');
            return;
        }
        current.isStartPending = true;
        setErrorMessage(null);
        setElapsedSeconds(appendTo ? getRecordingSessionDuration(appendTo) : 0);
        setActiveRecording(null);
        bitrateMeter.current = new RecordingBitrateMeter(); setMeasuredBytesPerSecond(null); setPendingBytes(0);
        setPhase('starting');
        // Reuse admin navigation, sign-out and beforeunload protection for the entire recording lifetime.
        void protectAdminMutation(async () => {
            try {
                const estimate = await estimateRecordingStorage();
                setStorage(estimate);
                if (!(appendTo?.storageDestination || directoryReference.current) && isRecordingOriginStorageLow(estimate)) throw new Error('Prohlížeč hlásí málo prostoru pro web. Zvolte dostupnou složku nebo uvolněte prostor po záloze záznamů.');
                if (current.isDisposed) return;
                const savedProject = appendTo ? await readStudioRecording(appendTo.id) : undefined;
                if (appendTo && !savedProject) throw new Error('Místní projekt není dostupný pro donahrání.');
                const capture = new RecordingStudioCapture({
                    directory: appendTo ? null : directoryReference.current,
                    existingRecording: savedProject,
                    isSourceSetChangeAllowed,
                    onProgress: (recording) => {
                        if (!current.isDisposed) { setActiveRecording(recording); setMeasuredBytesPerSecond(bitrateMeter.current.update(recording)); }
                    },
                    onPendingBytes: (bytes) => { if (!current.isDisposed) setPendingBytes(bytes); },
                    onStopping: () => { if (!current.isDisposed) setPhase('stopping'); },
                    onPhaseChange: (nextPhase) => { if (!current.isDisposed) setPhase(nextPhase); },
                    // A studio page which is being closed reports its own shutdown; that is not a failure to announce.
                    onFailure: (failure) => { if (!current.isDisposed) showAnnouncedAlert(alertChannel.announceFailure(failure)); },
                });
                current.capture = capture;
                await capture.start(recordingSources);
                if (!current.isDisposed) setPhase(capture.currentPhase);
                const recording = await capture.finished;
                if (recording && !current.isDisposed) {
                    setRecordings((previous) => [recording, ...previous.filter((item) => item.id !== recording.id)]);
                    setErrorMessage(recording.errorMessage);
                } else if (!recording && !current.isDisposed) {
                    setErrorMessage(capture.failureMessage ?? 'Záznam se nepodařilo zahájit. Zkontrolujte zdroje a dostupnost úložiště.');
                }
            } catch (error) {
                if (!current.isDisposed) setErrorMessage(getRecordingErrorMessage(error));
            } finally {
                current.isStartPending = false;
                current.capture = null;
                if (!current.isDisposed) {
                    setSources([...current.sources]);
                    setSourceReadiness((previous) => Object.fromEntries(current.sourceConfigurations.map((configuration) => {
                        const source = current.sources.find((candidate) => candidate.id === configuration.id);
                        if (!configuration.isCaptureEnabled) return [configuration.id, 'needs-permission'];
                        if (source && matchesRecordingSourceConfiguration(source, configuration) && isRecordingSourceReady(source)) {
                            return [configuration.id, 'ready'];
                        }
                        if (source && source.stream.getTracks().some((track) => track.readyState === 'ended')) {
                            return [configuration.id, 'disconnected'];
                        }
                        if (source && isRecordingSourceTemporarilyUnavailable(source)) {
                            return [configuration.id, 'temporarily-unavailable'];
                        }
                        return [configuration.id, previous[configuration.id] === 'disconnected' ? 'disconnected' : 'unavailable'];
                    })));
                    setActiveRecording(null); setPhase('idle'); setPendingBytes(0); setMeasuredBytesPerSecond(null);
                    await refreshStorage();
                }
            }
        });
    };

    return {
        sources, sourceConfigurations, sourceErrors, sourceReadiness, recordings, activeRecording, storage, phase, errorMessage, elapsedSeconds,
        directory, isChoosingDirectory, pendingBytes, measuredBytesPerSecond, persistence,
        alerts: alertChannel.alerts, alertPreferences: alertChannel.alertPreferences, notificationPermission: alertChannel.notificationPermission,
        isAlertSoundSupported: alertChannel.isAlertSoundSupported, announceTestAlert: alertChannel.announceTestAlert,
        changeAlertPreferences: alertChannel.changeAlertPreferences, dismissAlert: alertChannel.dismissAlert, dismissAllAlerts: alertChannel.dismissAllAlerts,
        requestNotificationPermission: alertChannel.requestNotificationPermission,
        chooseDirectory,
        useBrowserStorage: () => {
            if (phase !== 'idle' || directoryOperation.current) return;
            directoryReference.current = null; setDirectory(null); void refreshStorage();
        },
        requestPersistence: async () => { setPersistence(await requestRecordingPersistence()); await refreshStorage(); },
        addSource, connectSource, removeSource, moveSource, setSourceCaptureEnabled, resetSourceConfigurations, releaseSources, restoreSourceConfiguration, startRecording,
        stopRecording: () => { void runtime.current.capture?.stop(); },
        pauseRecording: () => { void runtime.current.capture?.pause(); },
        resumeRecording: () => { runtime.current.capture?.resume(); },
        setErrorMessage, refreshStorage,
        updateRecording: (recording: StudioRecording) => setRecordings((previous) => previous.map((item) => item.id === recording.id ? recording : item)),
        removeRecording: (recordingId: string) => setRecordings((previous) => previous.filter((item) => item.id !== recordingId)),
    };
}
