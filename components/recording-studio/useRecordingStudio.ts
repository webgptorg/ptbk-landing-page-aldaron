'use client';

import { flushAdminSaves } from '@/lib/admin/adminPendingSaves';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { RecordingStudioCapture } from '@/lib/recording-studio/RecordingStudioCapture';
import { acquireRecordingSource, getRecordingErrorMessage, releaseRecordingSource } from '@/lib/recording-studio/recordingStudioDevices';
import { runWithRecordingStudioLock } from '@/lib/recording-studio/recordingStudioLock';
import { estimateRecordingStorage, recoverStudioRecordings } from '@/lib/recording-studio/recordingStudioStorage';
import {
    RECORDING_STORAGE_RESERVE_BYTES,
    type RecordingSource, type RecordingSourceKind, type RecordingStorageEstimate, type StudioRecording,
} from '@/lib/recording-studio/recordingStudioTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_REFRESH_MILLISECONDS = 5_000;
const INITIAL_STORAGE_ESTIMATE: RecordingStorageEstimate = { availableBytes: null, quotaBytes: null, isPersistent: false };

export function useRecordingStudio() {
    const [sources, setSources] = useState<RecordingSource[]>([]);
    const [recordings, setRecordings] = useState<StudioRecording[]>([]);
    const [activeRecording, setActiveRecording] = useState<StudioRecording | null>(null);
    const [storage, setStorage] = useState(INITIAL_STORAGE_ESTIMATE);
    const [phase, setPhase] = useState<'loading' | 'idle' | 'starting' | 'recording' | 'stopping' | 'unavailable'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const runtime = useRef({ isDisposed: false, isAddingSource: false, capture: null as RecordingStudioCapture | null, sources: [] as RecordingSource[] });

    const refreshStorage = useCallback(async () => {
        const estimate = await estimateRecordingStorage();
        if (runtime.current.isDisposed) return;
        setStorage(estimate);
        if (estimate.availableBytes !== null && estimate.availableBytes < RECORDING_STORAGE_RESERVE_BYTES) {
            void runtime.current.capture?.stop('Úložiště se blíží svému limitu. Všechny stopy byly zastaveny a uložené části zůstávají dostupné.');
        }
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
                const recovered = await recoverStudioRecordings();
                const { clearRecordingExportTemporaryFiles } = await import('@/lib/recording-studio/recordingStudioTrim');
                await clearRecordingExportTemporaryFiles();
                if (!current.isDisposed) {
                    setRecordings(recovered);
                    setPhase('idle');
                    await refreshStorage();
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
        const storageTimer = setInterval(() => { void refreshStorage(); }, STORAGE_REFRESH_MILLISECONDS);
        return () => {
            current.isDisposed = true;
            clearInterval(storageTimer);
            void current.capture?.stop('Stránka studia byla zavřena.').finally(() => current.sources.forEach(releaseRecordingSource));
            if (!current.capture) current.sources.forEach(releaseRecordingSource);
            releaseLock?.();
        };
    }, [refreshStorage]);

    const activeCreatedAt = activeRecording?.createdAt;
    useEffect(() => {
        if (phase !== 'recording' || !activeCreatedAt) return;
        const createdAt = new Date(activeCreatedAt).getTime();
        const update = () => setElapsedSeconds(Math.max(0, (Date.now() - createdAt) / 1000));
        update();
        const timer = setInterval(update, 250);
        return () => clearInterval(timer);
    }, [phase, activeCreatedAt]); // A persisted chunk must not reset the elapsed-time clock.

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
        if (phase !== 'idle' || current.capture || current.isAddingSource || current.sources.length === 0) return;
        setErrorMessage(null);
        setElapsedSeconds(0);
        setActiveRecording(null);
        setPhase('starting');
        // Reuse admin navigation, sign-out and beforeunload protection for the entire recording lifetime.
        void protectAdminMutation(async () => {
            try {
                const estimate = await estimateRecordingStorage();
                if (estimate.availableBytes !== null && estimate.availableBytes < RECORDING_STORAGE_RESERVE_BYTES) throw new Error('Pro další záznam chybí místo. Nejdřív stáhněte a smažte starší záznamy.');
                if (current.isDisposed) return;
                void navigator.storage?.persist?.().then(() => refreshStorage()).catch(() => undefined);
                const capture = new RecordingStudioCapture({
                    onProgress: (recording) => { if (!current.isDisposed) setActiveRecording(recording); },
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
                    setErrorMessage('Záznam se nepodařilo zahájit. Zkontrolujte zdroje a dostupnost úložiště.');
                }
            } catch (error) {
                if (!current.isDisposed) setErrorMessage(getRecordingErrorMessage(error));
            } finally {
                current.capture = null;
                current.sources.forEach(releaseRecordingSource);
                current.sources = [];
                if (!current.isDisposed) {
                    setSources([]); setActiveRecording(null); setPhase('idle');
                    await refreshStorage();
                }
            }
        });
    };

    return {
        sources, recordings, activeRecording, storage, phase, errorMessage, elapsedSeconds,
        addSource, removeSource, startRecording, stopRecording: () => { void runtime.current.capture?.stop(); },
        setErrorMessage, refreshStorage,
        updateRecording: (recording: StudioRecording) => setRecordings((previous) => previous.map((item) => item.id === recording.id ? recording : item)),
        removeRecording: (recordingId: string) => setRecordings((previous) => previous.filter((item) => item.id !== recordingId)),
    };
}
