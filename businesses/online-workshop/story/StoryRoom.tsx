'use client';

import type { ArticleWordTimings } from '@/businesses/articles/articleTiming';
import { ArticleTracking } from '@/businesses/articles/ArticleTracking';
import { WorkshopConnectionForm } from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
import { connectToWorkshop, disconnectFromWorkshop } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';
import { useAudioPlayerControls } from '@/components/audio-player/AudioPlayerProvider';
import { PromptbookQrCode } from '@/components/promptbook-qr-code';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PROMPTBOOK_BRAND, PROMPTBOOK_BRAND_STYLE } from '@/lib/promptbook-brand';
import { createStoryRoomApiPath, STORY_ROOM_PATH } from '@/lib/workshops/storyRoomPaths';
import type { StoryCharacter, StoryRoomCommand, StoryRoomState, StoryLine, StoryTurn, WorkshopStory } from '@/lib/workshops/storyRoomTypes';
import { STORY_ROOM_MAX_LINES } from '@/lib/workshops/storyRoomTypes';
import { createWorkshopSelectionPath, type WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import {
    Anchor, Bird, BookOpen, Cat, Cookie, Download, Headphones, House, ImagePlus, Minus,
    PawPrint, Pencil, Plus, QrCode, Rabbit, Search, ShoppingBasket, Sparkles, TreeDeciduous, Wind,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { StoryBookEditorDialog } from './StoryBookEditorDialog';
import { prepareStoryNarration, type StoryNarrationClipCache } from './storyNarrationPlayer';
import s from './storyRoom.module.css';

type StoryEvent = {
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly startsAt: string | null;
    readonly endsAt: string | null;
};
type Editor =
    | { type: 'story'; id: string; title: string; premise: string }
    | { type: 'description'; id: string; description: string };
type Narration = { readonly storyId: string; readonly trackId: string; readonly timings?: ArticleWordTimings };
type StoryRequest = StoryRoomCommand | { readonly action: 'share' };

function characterStyle(color: string | undefined): CSSProperties | undefined {
    return color ? { '--character-color': color } as CSSProperties : undefined;
}

const CHARACTER_ICONS = {
    rabbit: Rabbit, search: Search, tree: TreeDeciduous, cat: Cat, basket: ShoppingBasket, wind: Wind,
    paw: PawPrint, cookie: Cookie, anchor: Anchor, bird: Bird, house: House, sparkles: Sparkles,
};

function CharacterBadge({ character }: { readonly character: StoryCharacter }) {
    const [failedImage, setFailedImage] = useState<string>();
    const initials = character.name.split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join('').toLocaleUpperCase('cs');
    const Icon = character.avatar ? CHARACTER_ICONS[character.avatar] : undefined;
    const image = character.image;
    return (
        <span className={s.avatar} aria-hidden="true" data-portrait-pending={character.portraitStatus === 'pending' || undefined}>
            {Icon ? <Icon size={17} /> : initials || <Sparkles size={17} />}
            {image && failedImage !== image && (
                <Image src={image} alt="" width={64} height={64} unoptimized referrerPolicy="no-referrer"
                    onError={() => setFailedImage(image)} />
            )}
        </span>
    );
}

function StoryWords({ id, text, startAt = 0 }: { readonly id: string; readonly text: string; readonly startAt?: number }) {
    let word = startAt;
    return text.split(/(\s+)/).map((part, index) => /\S/.test(part)
        ? <span key={index} data-article-word={`${id}:w${word++}`}>{part}</span>
        : part);
}

function showError(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

function formatDate(value: string | null) {
    if (!value) return 'Termín najdeš u organizátora.';
    return new Intl.DateTimeFormat('cs-CZ', {
        timeZone: 'Europe/Prague', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit',
    }).format(new Date(value));
}

export function StoryRoom({ event, initialIdentity, initialStoryId }: {
    readonly event: StoryEvent;
    readonly initialIdentity: WorkshopParticipantIdentity;
    readonly initialStoryId: string | null;
}) {
    const apiPath = createStoryRoomApiPath(event.slug);
    const [state, setState] = useState<StoryRoomState | null>(null);
    const [selectedId, setSelectedId] = useState(initialStoryId);
    const [revision, setRevision] = useState(0);
    const [readError, setReadError] = useState('');
    const [notice, setNotice] = useState('');
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [editor, setEditor] = useState<Editor | null>(null);
    const [bookEditor, setBookEditor] = useState<StoryCharacter & { book: string }>();
    const [pending, setPending] = useState('');
    const [pendingTurn, setPendingTurn] = useState<StoryTurn | null>(null);
    const [shareOpen, setShareOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [shareError, setShareError] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isPreparingAudio, setIsPreparingAudio] = useState(false);
    const [narration, setNarration] = useState<Narration | null>(null);
    const pendingRequest = useRef(false);
    const uncertainTurn = useRef<StoryTurn | null>(null);
    const shareRequest = useRef<Promise<string> | null>(null);
    const audioRequest = useRef<AbortController | null>(null);
    const transcript = useRef<HTMLOListElement>(null);
    const clips = useRef<StoryNarrationClipCache>(new Map());
    const player = useAudioPlayerControls();
    const story = state?.story && (!selectedId || state.story.id === selectedId) ? state.story : null;
    const storyId = story?.id;
    const canWrite = state?.canWrite === true;

    useEffect(() => { setSelectedId(initialStoryId); }, [initialStoryId]);

    function selectStory(id: string) {
        setSelectedId(id);
        const url = new URL(window.location.href);
        url.searchParams.set('story', id);
        window.history.replaceState(null, '', url);
    }

    useEffect(() => {
        let controller: AbortController | null = null;
        async function refresh() {
            if (document.hidden || controller) return;
            const request = new AbortController();
            controller = request;
            try {
                const response = await fetch(`${apiPath}${selectedId ? `?story=${selectedId}` : ''}`, {
                    cache: 'no-store', signal: request.signal,
                });
                const data = await response.json() as StoryRoomState & { error?: string };
                if (request.signal.aborted) return;
                if (!response.ok) {
                    if (response.status === 404) setState(null);
                    throw new Error(data.error ?? 'Dílnu se nepodařilo otevřít.');
                }
                const previousTurn = uncertainTurn.current;
                if (previousTurn && data.story?.lines.some(({ id }) => id === previousTurn.requestId)) uncertainTurn.current = null;
                setState(data);
                if (selectedId && data.story?.id !== selectedId) setSelectedId(data.story?.id ?? null);
                setReadError('');
            } catch (error) {
                if (!request.signal.aborted) setReadError(showError(error, 'Spojení s dílnou se přerušilo.'));
            } finally {
                if (controller === request) controller = null;
            }
        }
        void refresh();
        const timer = window.setInterval(refresh, 4_500);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            controller?.abort();
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, [apiPath, selectedId, revision]);

    useEffect(() => () => {
        audioRequest.current?.abort();
        clips.current.clear();
    }, [storyId]);

    async function requestRoom(command: StoryRequest) {
        const response = await fetch(apiPath, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(command),
        });
        const data = await response.json() as { storyId?: string; characterId?: string; bookRevision?: string; line?: StoryLine; url?: string; error?: string };
        if (command.action === 'turn' && response.status !== 409 && response.status < 500) uncertainTurn.current = null;
        if (!response.ok) {
            const message = data.error ?? 'Požadavek se nepodařilo dokončit.';
            if (command.action === 'character' && [400, 403, 409, 422].includes(response.status)) {
                throw new AdminSaveValidationError(message);
            }
            throw new Error(message);
        }
        return data;
    }

    async function mutate(command: StoryRoomCommand, label: string) {
        if (!canWrite || pendingRequest.current) return false;
        pendingRequest.current = true;
        setPending(label);
        setNotice('');
        try {
            const data = await requestRoom(command);
            const line = data.line;
            if (command.action === 'turn' && line?.id === command.requestId) {
                setState((current) => {
                    const updated = current?.story;
                    if (!current || !updated || updated.id !== command.storyId || updated.lines.some(({ id }) => id === line.id)) return current;
                    return { ...current, story: { ...updated, isBusy: false, lines: [...updated.lines, line] } };
                });
            }
            if (data.storyId) selectStory(data.storyId);
            return true;
        } catch (error) {
            setNotice(showError(error, 'Změnu se nepodařilo uložit.'));
            return false;
        } finally {
            pendingRequest.current = false;
            setPending('');
            setRevision((current) => current + 1);
        }
    }

    function play(currentStory: WorkshopStory, character?: StoryCharacter) {
        if (!canWrite || pendingRequest.current) return;
        const previous = uncertainTurn.current;
        const command: StoryTurn = previous?.storyId === currentStory.id && previous.characterId === character?.id
            ? previous
            : { action: 'turn', storyId: currentStory.id, characterId: character?.id, requestId: window.crypto.randomUUID() };
        uncertainTurn.current = command;
        setPendingTurn(command);
        void mutate(command, 'Připravuji další tah…').finally(() => setPendingTurn(null));
    }

    function changeCast(storyId: string, characterId: string, include: boolean) {
        void mutate({ action: 'cast', storyId, characterId, include }, 'Měním obsazení…');
    }

    async function submitEditor(submit: FormEvent<HTMLFormElement>) {
        submit.preventDefault();
        if (!editor) return;
        const command: StoryRoomCommand = editor.type === 'story'
            ? { action: 'create', id: editor.id, title: editor.title, premise: editor.premise }
            : { action: 'generate-character', id: editor.id, description: editor.description };
        if (await mutate(command, editor.type === 'description' ? 'Vymýšlím postavu…' : 'Ukládám…')) setEditor(null);
    }

    async function saveBook(id: string, book: string, baseRevision: string | undefined) {
        const { bookRevision } = await requestRoom({ action: 'character', id, book, baseRevision });
        setState((current) => current && ({
            ...current,
            characters: current.characters.map((character) => character.id === id ? { ...character, book, bookRevision } : character),
        }));
        setRevision((current) => current + 1);
        return bookRevision;
    }

    async function connect(values: WorkshopParticipantIdentity) {
        setConnectionError(null);
        try {
            await connectToWorkshop(event.slug, values);
            setIsJoinOpen(false);
            setRevision((current) => current + 1);
            return true;
        } catch (error) {
            setConnectionError(showError(error, 'Připojení se nepodařilo. Zkus to znovu.'));
            return false;
        }
    }

    async function disconnect() {
        try {
            await disconnectFromWorkshop(event.slug);
            setEditor(null);
            setRevision((current) => current + 1);
        } catch (error) {
            setNotice(showError(error, 'Odhlášení se nepodařilo.'));
        }
    }

    function getShareUrl(): Promise<string> {
        if (shareUrl) return Promise.resolve(shareUrl);
        if (shareRequest.current) return shareRequest.current;
        const request = requestRoom({ action: 'share' }).then(({ url }) => {
            if (!url) throw new Error('Krátký odkaz se nepodařilo vytvořit.');
            setShareUrl(url);
            return url;
        }).finally(() => { shareRequest.current = null; });
        shareRequest.current = request;
        return request;
    }

    function showShare() {
        setShareOpen(true);
        setIsCopied(false);
        setShareError('');
        void getShareUrl().catch((error) => setShareError(showError(error, 'Odkaz se nepodařilo načíst.')));
    }

    async function copyShare() {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
        } catch {
            setShareError('Odkaz můžeš označit a zkopírovat ručně.');
        }
    }

    async function exportPdf(currentStory: WorkshopStory) {
        setIsExporting(true);
        setNotice('');
        try {
            const [url, { downloadStoryPdf }] = await Promise.all([getShareUrl(), import('./storyRoomPdf')]);
            await downloadStoryPdf(currentStory, { title: event.title, url });
        } catch (error) {
            setNotice(showError(error, 'PDF se nepodařilo vytvořit. Zkus to znovu.'));
        } finally {
            setIsExporting(false);
        }
    }

    async function readAloud(currentStory: WorkshopStory) {
        if (audioRequest.current) return;
        const trackId = `story:${currentStory.id}:${currentStory.lines.at(-1)?.id ?? 'start'}`;
        if (player.track?.id === trackId) {
            player.setIsPlaying(!player.isPlaying);
            return;
        }
        const request = new AbortController();
        audioRequest.current = request;
        setIsPreparingAudio(true);
        setNotice('');
        try {
            const audio = await prepareStoryNarration(apiPath, currentStory, request.signal, clips.current);
            request.signal.throwIfAborted();
            setNarration({ timings: audio.timings, storyId: currentStory.id, trackId });
            const href = createWorkshopSelectionPath(STORY_ROOM_PATH, event.slug, new URLSearchParams({ story: currentStory.id }));
            player.playTrack({
                id: trackId, src: URL.createObjectURL(audio.blob), href, kind: 'story', language: 'cs',
                title: currentStory.title, author: 'Pavol Hejný', appearance: 'promptbook',
                durationInSeconds: audio.duration, trackingAvailable: Boolean(audio.timings),
            });
        } catch (error) {
            if (!request.signal.aborted) setNotice(showError(error, 'Předčítání se nepodařilo připravit.'));
        } finally {
            audioRequest.current = null;
            setIsPreparingAudio(false);
        }
    }

    const characters = state?.characters ?? [];
    const cast = (story?.cast ?? []).flatMap((id) => characters.find((character) => character.id === id) ?? []);
    const canChangeCast = canWrite && !pending && !story?.isBusy;
    const canTakeTurn = canChangeCast && state?.canGenerate && story && story.lines.length < STORY_ROOM_MAX_LINES;
    const localTurn = story && pendingTurn?.storyId === story.id && !story.lines.some(({ id }) => id === pendingTurn.requestId)
        ? pendingTurn : null;
    const isWritingTurn = Boolean(localTurn || story?.isBusy);
    const writingCharacter = localTurn?.characterId
        ? characters.find(({ id }) => id === localTurn.characterId)
        : cast.length === 1 ? cast[0] : undefined;
    const currentNarration = narration?.storyId === storyId ? narration : null;
    const isPlayingStory = player.track?.id === currentNarration?.trackId && player.isPlaying;
    const isCurrentRecording = currentNarration?.trackId === `story:${storyId}:${story?.lines.at(-1)?.id ?? 'start'}`;

    useEffect(() => {
        if (transcript.current && !isPlayingStory) transcript.current.scrollTop = transcript.current.scrollHeight;
    }, [storyId, story?.lines.length, isPlayingStory, isWritingTurn]);

    return (
        <div className={s.room} style={PROMPTBOOK_BRAND_STYLE}>
            <header className={s.header}>
                <div className={s.headerInner}>
                    <Link href="/cs" aria-label="Promptbook, úvod">
                        <Image src={PROMPTBOOK_BRAND.assets.lockupLight} width={172} height={37} alt="Promptbook" priority />
                    </Link>
                    <button className={s.secondary} type="button" onClick={showShare} disabled={!state}>
                        <QrCode size={18} aria-hidden="true" /> Sdílet dílnu
                    </button>
                </div>
            </header>
            <main className={s.main}>
                <section className={s.hero}>
                    <div className={s.eyebrow}><BookOpen size={17} aria-hidden="true" /> {event.title}</div>
                    <h1>Příběh píšeme spolu</h1>
                    <p>Nech promluvit postavu, nebo dej příběhu další tah a sleduj, kdo se ozve.</p>
                </section>

                {readError && <p className={s.error} role="status">{readError}</p>}
                {!state && !readError && <p className={s.status} role="status">Otevírám dílnu…</p>}
                {state && (
                    <>
                        <section className={s.access} aria-label="Vstup do dílny">
                            {!state.isWritingOpen ? <p>Dílna je otevřená pro čtení a stažení příběhů.</p>
                                : state.participant ? (
                                    <>
                                        <p><strong>{state.participant.fullname}</strong>{canWrite ? ' · Můžeš hrát' : state.participant.isInteractionBanned ? ' · Můžeš si číst' : ' · Čekáš na schválení od organizátora'}</p>
                                        <button className={s.textButton} type="button" onClick={() => void disconnect()}>Odhlásit se</button>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Chceš se zapojit?</strong> Zadej jméno a e-mail. Hraní ti povolí organizátor.</p>
                                        <button type="button" className={s.primary} aria-expanded={isJoinOpen} onClick={() => setIsJoinOpen(!isJoinOpen)}>
                                            {isJoinOpen ? 'Skrýt přihlášení' : 'Zapojit se'}
                                        </button>
                                    </>
                                )}
                        </section>
                        {isJoinOpen && state.isWritingOpen && !state.participant && (
                            <div className={s.join}>
                                <WorkshopConnectionForm
                                    isEmbedded
                                    connectionDetails={{
                                        title: event.title, description: event.description,
                                        dateLabel: formatDate(event.startsAt), durationLabel: formatDate(event.endsAt),
                                        connectionHeading: 'Připojit se do dílny',
                                        connectionDescription: 'Jméno a e-mail uvidí organizátor, který tě schválí.',
                                        submitLabel: 'Požádat o schválení',
                                    }}
                                    initialEmail={initialIdentity.email}
                                    initialFullname={initialIdentity.fullname}
                                    errorMessage={connectionError}
                                    onConnect={connect}
                                />
                            </div>
                        )}

                        <div className={s.toolbar}>
                            {state.stories.length > 0 && (
                                <label className={s.selection}>Příběh
                                    <select value={storyId ?? selectedId ?? ''} onChange={(change) => selectStory(change.target.value)}>
                                        {state.stories.map(({ id, title }) => <option value={id} key={id}>{title}</option>)}
                                    </select>
                                </label>
                            )}
                            {canWrite && <button className={s.secondary} type="button" disabled={Boolean(pending)} onClick={() =>
                                setEditor({ type: 'story', id: crypto.randomUUID(), title: '', premise: '' })
                            }><Plus size={17} aria-hidden="true" /> Nový příběh</button>}
                        </div>

                        {!story && (pending || notice) && <p className={s.status} role="status">{pending || notice}</p>}
                        <div className={s.layout}>
                            <section className={s.paper} aria-label="Rozehraný příběh">
                                {story ? (
                                    <>
                                        <div className={s.paperActions}>
                                            <button type="button" className={s.secondary} onClick={() => void readAloud(story)} disabled={isPreparingAudio}>
                                                <Headphones size={17} aria-hidden="true" />
                                                {isPreparingAudio ? 'Připravuji hlas…' : isCurrentRecording && isPlayingStory ? 'Pozastavit čtení' : currentNarration && !isCurrentRecording ? 'Přečíst novou verzi' : 'Přečíst příběh'}
                                            </button>
                                            <button type="button" className={s.secondary} onClick={() => void exportPdf(story)} disabled={isExporting}>
                                                <Download size={17} aria-hidden="true" /> {isExporting ? 'Připravuji PDF…' : 'Stáhnout PDF'}
                                            </button>
                                        </div>
                                        <ArticleTracking articleId={currentNarration?.trackId ?? `story:${story.id}`} wordTimings={currentNarration?.timings}>
                                            <h2><StoryWords id="title" text={story.title} /></h2>
                                            <p className={s.premise}><StoryWords id="premise" text={story.premise} /></p>
                                            <ol className={s.lines} ref={transcript} aria-live="polite" aria-label="Repliky a akce">
                                                {story.lines.map((line) => {
                                                    const actor = characters.find(({ id, name }) => line.characterId ? id === line.characterId : name === line.characterName);
                                                    const isSpeech = line.kind === 'speech';
                                                    return (
                                                        <li key={line.id} style={characterStyle(actor?.color)} className={isSpeech ? s.speechLine : s.actionLine}>
                                                            <CharacterBadge character={actor ?? { id: line.id, name: line.characterName }} />
                                                            <div className={s.message}>
                                                                <small className={s.actorLabel}>{isSpeech
                                                                    ? <StoryWords id={line.id} text={`${line.characterName}:`} />
                                                                    : `${line.characterName} · akce`}</small>
                                                                <p className={s.bubble}><StoryWords id={line.id} text={line.text}
                                                                    startAt={isSpeech ? line.characterName.split(/\s+/).length : 0} /></p>
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                                {isWritingTurn && (
                                                    <li className={s.pendingLine} style={characterStyle(writingCharacter?.color)}>
                                                        {writingCharacter
                                                            ? <CharacterBadge character={writingCharacter} />
                                                            : <span className={s.avatar} aria-hidden="true">?</span>}
                                                        <div className={s.message}>
                                                            <small className={s.actorLabel}>{writingCharacter?.name ?? 'Další tah'}</small>
                                                            <p className={s.bubble}>
                                                                {writingCharacter ? 'Píše…' : 'Jedna z postav píše…'}
                                                                <span className={s.typingDots} aria-hidden="true"><i /><i /><i /></span>
                                                            </p>
                                                        </div>
                                                    </li>
                                                )}
                                            </ol>
                                            {story.lines.length === 0 && !isWritingTurn && <p className={s.quiet}>Zatím nikdo nepromluvil. První věta je na scéně!</p>}
                                        </ArticleTracking>
                                        <section className={s.stage} aria-labelledby="story-stage-title">
                                            <h3 id="story-stage-title">Kdo bude na tahu?</h3>
                                            <p className={s.quiet}>{canWrite ? 'Klikni na portrét a postava dostane slovo.' : 'Postavy na scéně.'}</p>
                                            {cast.length === 0 ? <p className={s.quiet}>Přidej na scénu postavu ze seznamu.</p> : (
                                                <ul className={s.cast}>
                                                    {canWrite && (
                                                        <li className={s.castCharacter}>
                                                            <button type="button" className={s.turn} disabled={!canTakeTurn}
                                                                aria-label="Pokračovat v příběhu" title="Pokračovat v příběhu"
                                                                onClick={() => play(story)}>
                                                                <span className={`${s.avatar} ${s.autoAvatar}`} aria-hidden="true">?</span>
                                                                <span className={s.turnName}>Automaticky</span>
                                                            </button>
                                                        </li>
                                                    )}
                                                    {cast.map((character) => (
                                                        <li key={character.id} className={s.castCharacter} style={characterStyle(character.color)}>
                                                            <button type="button" className={s.turn} disabled={!canTakeTurn}
                                                                aria-label={canWrite ? `Nechat promluvit · ${character.name}` : `${character.name} · na scéně`}
                                                                onClick={() => play(story, character)}>
                                                                <CharacterBadge character={character} />
                                                                <span className={s.turnName}>{character.name}</span>
                                                            </button>
                                                            {canWrite && <button type="button" className={s.removeTurn} disabled={!canChangeCast}
                                                                title="Odebrat ze scény" aria-label={`Odebrat z tahu · ${character.name}`}
                                                                onClick={() => changeCast(story.id, character.id, false)}>
                                                                <Minus size={13} aria-hidden="true" />
                                                            </button>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {(notice || (pending && !localTurn)) && (
                                                <p className={s.stageStatus} role="status">{notice || pending}</p>
                                            )}
                                            {canWrite && !state.canGenerate && <p className={s.quiet}>AI tahy teď nejsou dostupné.</p>}
                                        </section>
                                    </>
                                ) : <p className={s.quiet}>Tady se objeví první příběh, až ho někdo rozehraje.</p>}
                            </section>

                            <aside className={s.sidebar} aria-label="Postavy v dílně">
                                <section className={s.roster}>
                                    <h2>Postavy v dílně</h2>
                                    {canWrite && <button type="button" className={s.secondary} disabled={Boolean(pending) || !state.canGenerate} onClick={() =>
                                        setEditor({ type: 'description', id: crypto.randomUUID(), description: '' })
                                    }><Sparkles size={16} aria-hidden="true" /> Vymyslet postavu</button>}
                                    <ul>
                                        {characters.map((character) => {
                                            const onStage = story?.cast.includes(character.id) ?? false;
                                            return (
                                                <li key={character.id} style={characterStyle(character.color)}>
                                                    <CharacterBadge character={character} />
                                                    <span className={s.characterName}>{character.name}
                                                        {character.portraitStatus === 'pending' && <small className={s.portraitStatus}>Portrét se kreslí…</small>}
                                                    </span>
                                                    {canWrite && character.portraitStatus === 'unavailable' && <button type="button" className={s.iconButton}
                                                        title="Vytvořit portrét" aria-label={`Vytvořit portrét · ${character.name}`}
                                                        disabled={Boolean(pending) || !state.canGenerate}
                                                        onClick={() => void mutate({ action: 'portrait', id: character.id }, 'Zadávám kreslení portrétu…')}>
                                                        <ImagePlus size={15} aria-hidden="true" />
                                                    </button>}
                                                    {canWrite && story && <button type="button" className={s.iconButton} title={onStage ? 'Odebrat ze scény' : 'Přidat na scénu'}
                                                        aria-label={`${onStage ? 'Odebrat ze scény' : 'Přidat na scénu'} · ${character.name}`}
                                                        disabled={!canChangeCast} onClick={() => changeCast(story.id, character.id, !onStage)}>{onStage ? '−' : '+'}</button>}
                                                    {canWrite && character.book !== undefined && <button type="button" className={s.iconButton} title="Upravit Book"
                                                        aria-label={`Upravit Book · ${character.name}`}
                                                        disabled={Boolean(pending)} onClick={() => setBookEditor({ ...character, book: character.book! })}><Pencil size={15} aria-hidden="true" /></button>}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            </aside>
                        </div>
                    </>
                )}

            </main>

            <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                <DialogContent closeLabel="Zavřít" className={s.dialog} style={PROMPTBOOK_BRAND_STYLE}>
                    <DialogTitle>Pozvi ostatní do dílny</DialogTitle>
                    <DialogDescription>Pošli odkaz nebo nech ostatní naskenovat QR kód.</DialogDescription>
                    {shareUrl ? (
                        <div className={s.share}>
                            <PromptbookQrCode value={shareUrl} size={176} />
                            <a href={shareUrl}>{shareUrl}</a>
                            <button type="button" className={s.primary} onClick={() => void copyShare()}>
                                {isCopied ? 'Odkaz zkopírován' : 'Zkopírovat odkaz'}
                            </button>
                        </div>
                    ) : !shareError && <p role="status">Připravuji krátký odkaz…</p>}
                    {shareError && <p className={s.error} role="status">{shareError}</p>}
                    {shareError && !shareUrl && <button type="button" className={s.secondary} onClick={showShare}>Zkusit znovu</button>}
                </DialogContent>
            </Dialog>

            {bookEditor && (
                <StoryBookEditorDialog key={bookEditor.id} name={bookEditor.name} book={bookEditor.book} bookRevision={bookEditor.bookRevision}
                    onSave={(book, revision) => saveBook(bookEditor.id, book, revision)} onClose={() => setBookEditor(undefined)} />
            )}

            <Dialog open={Boolean(editor) && canWrite} onOpenChange={(open) => { if (!open && !pendingRequest.current) setEditor(null); }}>
                {editor && (
                    <DialogContent closeLabel="Zavřít" className={s.dialog} style={PROMPTBOOK_BRAND_STYLE}>
                        <DialogTitle>{editor.type === 'story' ? 'Nový příběh' : 'Vymysli postavu'}</DialogTitle>
                        <DialogDescription>{editor.type === 'story'
                            ? 'Napiš, kde se první scéna odehrává a co se v ní právě stalo.'
                            : 'Stačí napsat, kdo to je a co by mohl v příběhu dělat. Dílna z popisu připraví jeho Book.'}</DialogDescription>
                        <form onSubmit={(submit) => void submitEditor(submit)} className={s.editor}>
                            {editor.type === 'story' ? (
                                <>
                                    <label>Název<input value={editor.title} minLength={2} maxLength={80} required onChange={(change) => setEditor({ ...editor, title: change.target.value })} /></label>
                                    <label>Začátek příběhu<textarea value={editor.premise} minLength={5} maxLength={550} required rows={4} onChange={(change) => setEditor({ ...editor, premise: change.target.value })} /></label>
                                </>
                            ) : (
                                <label>Popis postavy<textarea value={editor.description} minLength={5} maxLength={900} required rows={5}
                                    placeholder="Třeba malý drak, který se bojí tmy a nosí s sebou lucernu." onChange={(change) => setEditor({ ...editor, description: change.target.value })} /></label>
                            )}
                            <button type="submit" className={s.primary} disabled={Boolean(pending)}>
                                {pending || (editor.type === 'description' ? 'Vytvořit postavu' : 'Otevřít příběh')}
                            </button>
                            {notice && <p className={s.error} role="status">{notice}</p>}
                        </form>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}
