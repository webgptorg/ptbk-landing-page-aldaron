import type { RecordingSource, RecordingSourceConfiguration, RecordingSourceReadiness } from './recordingStudioTypes';

const VIDEO_CAPTURE_CONSTRAINTS: MediaTrackConstraints = { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } };

export function releaseRecordingSource(source: RecordingSource): void {
    source.stream.getTracks().forEach((track) => track.stop());
}

export function isRecordingSourceReady(source: RecordingSource): boolean {
    const isVideoRequired = source.kind !== 'microphone';
    const isAudioRequired = source.kind === 'microphone' || (source.kind === 'camera' && source.isAudioEnabled);
    const isVideoReady = !isVideoRequired || source.stream.getVideoTracks().some((track) => track.readyState === 'live' && !track.muted);
    const audioTrack = source.stream.getAudioTracks().find((track) => track.readyState === 'live');
    const isAudioReady = !isAudioRequired || Boolean(audioTrack && !audioTrack.muted);
    return isVideoReady && isAudioReady;
}

export function isRecordingSourceTemporarilyUnavailable(source: RecordingSource): boolean {
    const isVideoRequired = source.kind !== 'microphone';
    const isAudioRequired = source.kind === 'microphone' || (source.kind === 'camera' && source.isAudioEnabled);
    return source.stream.getTracks().some((track) => track.readyState === 'live' && track.muted &&
        ((track.kind === 'video' && isVideoRequired) || (track.kind === 'audio' && isAudioRequired)));
}

export function matchesRecordingSourceConfiguration(source: RecordingSource, configuration: RecordingSourceConfiguration): boolean {
    return source.id === configuration.id && source.kind === configuration.kind &&
        source.cameraDeviceId === configuration.cameraDeviceId && source.microphoneDeviceId === configuration.microphoneDeviceId &&
        source.displaySurface === configuration.displaySurface && source.isCaptureEnabled === configuration.isCaptureEnabled &&
        source.isAudioEnabled === configuration.isAudioEnabled;
}

/** A stream is reusable only for the same logical source while all required tracks remain live. */
export function canReuseRecordingSourceForConfiguration(source: RecordingSource, configuration: RecordingSourceConfiguration): boolean {
    return matchesRecordingSourceConfiguration(source, configuration) &&
        (configuration.kind !== 'screen' || source.displaySourceLabel === configuration.displaySourceLabel) &&
        isRecordingSourceReady(source);
}

export function reconcileRecordingSourcesForConfiguration(
    configurations: readonly RecordingSourceConfiguration[],
    sources: readonly RecordingSource[],
): { readonly retainedSources: readonly RecordingSource[]; readonly releasedSources: readonly RecordingSource[] } {
    const retainedSourceIds = new Set<string>();
    const retainedSources = configurations.flatMap((configuration) => {
        const source = sources.find((candidate) => candidate.id === configuration.id &&
            !retainedSourceIds.has(candidate.id) && canReuseRecordingSourceForConfiguration(candidate, configuration));
        if (!source) return [];
        retainedSourceIds.add(source.id);
        return [{ ...source, ...configuration, stream: source.stream, microphoneLabel: source.microphoneLabel }];
    });
    return {
        retainedSources,
        releasedSources: sources.filter((source) => !retainedSourceIds.has(source.id)),
    };
}

export function getRecordingSourceReadiness(error: unknown): RecordingSourceReadiness {
    if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'AbortError' || error.name === 'InvalidStateError')) {
        return 'needs-permission';
    }
    return 'unavailable';
}

function selectedDeviceConstraints(deviceId: string): MediaTrackConstraints {
    return deviceId ? { deviceId: { exact: deviceId } } : {};
}

function findReusableMicrophone(configuration: RecordingSourceConfiguration, existingSources: readonly RecordingSource[]): MediaStreamTrack | null {
    if (!configuration.isAudioEnabled && configuration.kind === 'camera') return null;
    for (const source of existingSources) {
        if (source.kind === 'screen') continue;
        const microphoneTrack = source.stream.getAudioTracks().find((track) => track.readyState === 'live');
        if (!microphoneTrack) continue;
        const configuredDeviceId = source.kind === 'camera' || source.kind === 'microphone'
            ? source.microphoneDeviceId
            : '';
        const actualDeviceId = microphoneTrack.getSettings().deviceId;
        const isSameConfiguredDefault = !configuration.microphoneDeviceId && !configuredDeviceId;
        const isSameSelectedDevice = configuration.microphoneDeviceId &&
            (configuration.microphoneDeviceId === configuredDeviceId || configuration.microphoneDeviceId === actualDeviceId);
        if (isSameConfiguredDefault || isSameSelectedDevice) return microphoneTrack;
    }
    return null;
}

function stopTracks(stream: MediaStream | null, track: MediaStreamTrack | null = null): void {
    stream?.getTracks().forEach((streamTrack) => streamTrack.stop());
    track?.stop();
}

/** Invoke from an explicit Add/Connect action. Camera audio is part of the camera MediaStream and its file. */
export async function acquireRecordingSource(
    configuration: RecordingSourceConfiguration,
    existingSources: readonly RecordingSource[] = [],
): Promise<RecordingSource> {
    let acquiredStream: MediaStream | null = null;
    let clonedAudioTrack: MediaStreamTrack | null = null;
    let stream: MediaStream;
    let microphoneLabel: string | null = null;

    try {
        if (configuration.kind === 'screen') {
            const isDisplaySurfaceHintSupported = navigator.mediaDevices.getSupportedConstraints?.().displaySurface === true;
            const videoConstraints = {
                ...VIDEO_CAPTURE_CONSTRAINTS,
                ...(configuration.displaySurface && isDisplaySurfaceHintSupported ? { displaySurface: configuration.displaySurface } : {}),
            } as MediaTrackConstraints;
            stream = await navigator.mediaDevices.getDisplayMedia({ video: videoConstraints, audio: configuration.isAudioEnabled });
            acquiredStream = stream;
        } else if (configuration.kind === 'microphone') {
            const reusableTrack = findReusableMicrophone(configuration, existingSources);
            if (reusableTrack) {
                clonedAudioTrack = reusableTrack.clone();
                stream = new MediaStream([clonedAudioTrack]);
                microphoneLabel = reusableTrack.label || configuration.microphoneDeviceLabel;
            } else {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: false,
                    audio: selectedDeviceConstraints(configuration.microphoneDeviceId),
                });
                acquiredStream = stream;
                microphoneLabel = stream.getAudioTracks()[0]?.label || configuration.microphoneDeviceLabel;
            }
        } else {
            const reusableTrack = configuration.isAudioEnabled ? findReusableMicrophone(configuration, existingSources) : null;
            if (reusableTrack) {
                const cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { ...VIDEO_CAPTURE_CONSTRAINTS, ...selectedDeviceConstraints(configuration.cameraDeviceId) },
                    audio: false,
                });
                acquiredStream = cameraStream;
                clonedAudioTrack = reusableTrack.clone();
                stream = new MediaStream([...cameraStream.getVideoTracks(), clonedAudioTrack]);
                microphoneLabel = reusableTrack.label || configuration.microphoneDeviceLabel;
            } else {
                // Asking for both tracks together gives the browser one capture request and one timestamp domain.
                // A selected/default microphone can be entirely separate from the physical webcam.
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { ...VIDEO_CAPTURE_CONSTRAINTS, ...selectedDeviceConstraints(configuration.cameraDeviceId) },
                    audio: configuration.isAudioEnabled
                        ? selectedDeviceConstraints(configuration.microphoneDeviceId)
                        : false,
                });
                acquiredStream = stream;
                microphoneLabel = stream.getAudioTracks()[0]?.label || configuration.microphoneDeviceLabel;
            }
        }

        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        const isVideoRequired = configuration.kind !== 'microphone';
        const isAudioRequired = configuration.kind === 'microphone' ||
            (configuration.kind === 'camera' && configuration.isAudioEnabled);
        if ((isVideoRequired && !videoTrack) || (isAudioRequired && !audioTrack)) {
            stopTracks(stream, clonedAudioTrack);
            throw new Error(isAudioRequired
                ? 'Vybrané zařízení neposkytlo požadovaný obraz i zvuk. Zkontrolujte oprávnění zařízení nebo zvolte jiný mikrofon či video bez zvuku.'
                : 'Vybraná kamera neposkytla obraz. Zkontrolujte její připojení a oprávnění.');
        }

        const actualConfiguration: RecordingSourceConfiguration = {
            ...configuration,
            cameraDeviceLabel: configuration.kind === 'camera' ? videoTrack?.label || configuration.cameraDeviceLabel : configuration.cameraDeviceLabel,
            microphoneDeviceLabel: audioTrack?.label || microphoneLabel || configuration.microphoneDeviceLabel,
            displaySourceLabel: configuration.kind === 'screen' ? videoTrack?.label || configuration.displaySourceLabel : configuration.displaySourceLabel,
        };
        return { ...actualConfiguration, stream, microphoneLabel: audioTrack ? microphoneLabel || audioTrack.label || 'Výchozí mikrofon' : null };
    } catch (error) {
        stopTracks(acquiredStream, clonedAudioTrack);
        throw error;
    }
}

export function getRecordingErrorMessage(error: unknown, configuration?: RecordingSourceConfiguration): string {
    if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
            if (configuration?.kind === 'screen') return 'Sdílení obrazovky nebylo povoleno nebo byl výběr zrušen. Nastavení i původní název zůstaly uložené; vyberte sdílenou plochu znovu.';
            return configuration?.kind === 'camera' && configuration.isAudioEnabled
                ? 'Prohlížeč nebo systém zamítl přístup ke kameře či mikrofonu. Povolte oba zdroje v nastavení webu/systému a zkuste to znovu; zvuk lze také výslovně vypnout.'
                : 'Prohlížeč nebo systém zamítl přístup k zařízení. Povolte jej v nastavení webu a zkuste to znovu.';
        }
        if (error.name === 'NotFoundError') {
            if (configuration?.kind === 'camera' && configuration.isAudioEnabled) {
                return 'Kamera nebo mikrofon nejsou dostupné. Připojte zařízení, zvolte jiný mikrofon nebo výslovně vypněte Nahrávat zvuk.';
            }
            if (configuration?.kind === 'microphone') return 'Není dostupný žádný mikrofon. Připojte jej nebo zkontrolujte oprávnění a nastavení vstupu v systému.';
            if (configuration?.kind === 'camera') return 'Není dostupná kamera. Připojte ji nebo vyberte jiné zařízení.';
            return 'Vybrané zařízení není dostupné. Zkontrolujte připojení a zkuste jiné.';
        }
        if (error.name === 'NotReadableError') return 'Zařízení se nepodařilo otevřít. Může ho právě používat jiná aplikace; zavřete ji a zkuste zdroj znovu.';
        if (error.name === 'OverconstrainedError') {
            const constraint = 'constraint' in error ? (error as DOMException & { constraint?: string }).constraint : undefined;
            return constraint === 'deviceId' && configuration?.kind === 'camera'
                ? 'Vybraná kamera nebo mikrofon už nejsou dostupné. Obnovte seznam zařízení, vyberte jiné a zkuste to znovu.'
                : 'Prohlížeč nepodporuje požadované nastavení zařízení. Vyberte jiné zařízení nebo upravte nastavení.';
        }
        if (error.name === 'AbortError') return configuration?.kind === 'screen'
            ? 'Výběr sdílené plochy byl zrušen. Nastavení zůstalo uložené a můžete jej vybrat znovu.'
            : 'Zahájení snímání bylo přerušeno. Připojte zařízení znovu a zkuste to znovu.';
        if (error.name === 'SecurityError') return 'Prohlížeč z bezpečnostních důvodů zablokoval snímání. Otevřete studio přes HTTPS a zkontrolujte oprávnění webu.';
        if (error.name === 'QuotaExceededError') return 'Úložiště prohlížeče je plné. Uložené části záznamu zůstávají dostupné.';
    }
    if (error instanceof TypeError) return 'Prohlížeč nepodporuje požadovaná omezení snímání. Zvolte jiné zařízení nebo video bez zvuku.';
    return error instanceof Error ? error.message : 'Operace se nezdařila. Zkuste ji znovu.';
}
