'use client';

import { flushAdminSaves } from '@/lib/admin/adminPendingSaves';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { RecordingStudioCapture } from '@/lib/recording-studio/RecordingStudioCapture';
import { acquireRecordingSource, getRecordingErrorMessage, releaseRecordingSource } from '@/lib/recording-studio/recordingStudioDevices';
import { runWithRecordingStudioLock } from '@/lib/recording-studio/recordingStudioLock';
import { estimateRecordingStorage, getRecordingStorageErrorMessage, isRecordingOriginStorageLow, readRecordingPersistence, RECORDING_STORAGE_REFRESH_MILLISECONDS, requestRecordingPersistence, UNKNOWN_RECORDING_STORAGE } from '@/lib/recording-studio/recordingStudioCapacity';
import { chooseRecordingDirectory } from '@/lib/recording-studio/recordingStudioDirectory';
import { importStudioRecordingDirectory, recoverStudioRecordings, resetRecordingDirectoryCache } from '@/lib/recording-studio/recordingStudioStorage';
import { RecordingBitrateMeter } from '@/lib/recording-studio/recordingStudioTiming';
import {
    type RecordingPersistence, type RecordingSource, type RecordingSourceKind, type StudioRecording,
} from '@/lib/recording-studio/recordingStudioTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useRecordingStudio() {
    const [sources, setSources] = useState<RecordingSource[]>([]);
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
    const [phase, setPhase] = useState<'loading' | 'idle' | 'starting' | 'recording' | 'stopping' | 'unavailable'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const runtime = useRef({ isDisposed: false, isAddingSource: false, capture: null as RecordingStudioCapture | null, sources: [] as RecordingSource[] });

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
        const current = { isDisposed: false, isAddingSource: false, capture: null as RecordingStudioCapture | null, sources: [] as RecordingSource[] };
        runtime.current = current;
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined' || !window.indexedDB || !navigator.locks) {
            setErrorMessage('Studio potřebuje HTTPS (nebo localhost), záznam médií a místní úložiště. Otevřete ho v aktuálním Chrome nebo Edge na počítači.');
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
            // History navigation can unmount the page before an editor save or cancelled export settles.
            await flushAdminSaves();
        }).catch((error: unknown) => {
            if (!current.isDisposed) { setErrorMessage(getRecordingErrorMessage(error)); setPhase('unavailable'); }
        });
        const storageTimer = setInterval(() => { void refreshStorage(); }, RECORDING_STORAGE_REFRESH_MILLISECONDS);
        return () => {
            current.isDisposed = true;
            clearInterval(storageTimer);
            void current.capture?.stop('Stránka studia byla zavřena.').finally(() => current.sources.forEach(releaseRecordingSource));
            if (!current.capture) current.sources.forEach(releaseRecordingSource);
            releaseLock?.();
        };
    }, [refreshStorage]);

    useEffect(() => {
        if (phase !== 'recording') return;
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

    const removeSource = (sourceId: string) => {
        if (runtime.current.capture) return;
        const source = runtime.current.sources.find((candidate) => candidate.id === sourceId);
        if (source) releaseRecordingSource(source);
        runtime.current.sources = runtime.current.sources.filter((candidate) => candidate.id !== sourceId);
        setSources([...runtime.current.sources]);
    };

    const addSource = async (kind: RecordingSourceKind, deviceId: string) => {
        const current = runtime.current;
        if (current.capture || current.isAddingSource || phase !== 'idle') return;
        current.isAddingSource = true;
        setErrorMessage(null);
        try {
            // Start capture before awaiting any storage operation, retaining the screen-picker gesture.
            const source = await acquireRecordingSource(kind, deviceId);
            if (current.isDisposed) { releaseRecordingSource(source); return; }
            current.sources.push(source);
            source.stream.getTracks().forEach((track) => track.addEventListener('ended', () => {
                if (current.isDisposed || current.capture) return;
                removeSource(source.id);
                setErrorMessage(`Zdroj „${source.label}“ byl odpojen. Přidejte ho znovu.`);
            }, { once: true }));
            setSources([...current.sources]);
        } finally {
            current.isAddingSource = false;
        }
    };

    const startRecording = () => {
        const current = runtime.current;
        if (phase !== 'idle' || current.capture || current.isAddingSource || directoryOperation.current || current.sources.length === 0) return;
        setErrorMessage(null);
        setElapsedSeconds(0);
        setActiveRecording(null);
        bitrateMeter.current = new RecordingBitrateMeter(); setMeasuredBytesPerSecond(null); setPendingBytes(0);
        setPhase('starting');
        // Reuse admin navigation, sign-out and beforeunload protection for the entire recording lifetime.
        void protectAdminMutation(async () => {
            try {
                const estimate = await estimateRecordingStorage();
                setStorage(estimate);
                if (!directoryReference.current && isRecordingOriginStorageLow(estimate)) throw new Error('Prohlížeč hlásí málo prostoru pro web. Zvolte dostupnou složku nebo uvolněte prostor po záloze záznamů.');
                if (current.isDisposed) return;
                const capture = new RecordingStudioCapture({
                    directory: directoryReference.current,
                    onProgress: (recording) => {
                        if (!current.isDisposed) { setActiveRecording(recording); setMeasuredBytesPerSecond(bitrateMeter.current.update(recording)); }
                    },
                    onPendingBytes: (bytes) => { if (!current.isDisposed) setPendingBytes(bytes); },
                    onStopping: () => { if (!current.isDisposed) setPhase('stopping'); },
                });
                current.capture = capture;
                await capture.start(current.sources);
                if (!current.isDisposed) setPhase((previous) => previous === 'starting' ? 'recording' : previous);
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
                current.capture = null;
                current.sources.forEach(releaseRecordingSource);
                current.sources = [];
                if (!current.isDisposed) {
                    setSources([]); setActiveRecording(null); setPhase('idle'); setPendingBytes(0); setMeasuredBytesPerSecond(null);
                    await refreshStorage();
                }
            }
        });
    };

    return {
        sources, recordings, activeRecording, storage, phase, errorMessage, elapsedSeconds,
        directory, isChoosingDirectory, pendingBytes, measuredBytesPerSecond, persistence,
        chooseDirectory,
        useBrowserStorage: () => {
            if (phase !== 'idle' || directoryOperation.current) return;
            directoryReference.current = null; setDirectory(null); void refreshStorage();
        },
        requestPersistence: async () => { setPersistence(await requestRecordingPersistence()); await refreshStorage(); },
        addSource, removeSource, startRecording, stopRecording: () => { void runtime.current.capture?.stop(); },
        setErrorMessage, refreshStorage,
        updateRecording: (recording: StudioRecording) => setRecordings((previous) => previous.map((item) => item.id === recording.id ? recording : item)),
        removeRecording: (recordingId: string) => setRecordings((previous) => previous.filter((item) => item.id !== recordingId)),
    };
}
