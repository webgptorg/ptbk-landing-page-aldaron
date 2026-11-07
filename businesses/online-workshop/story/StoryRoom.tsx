'use client';

import { BookOpen, Check, Copy, Download, LoaderCircle, Pencil, Plus, Sparkles, Square, Volume2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { STORY_ROOM_API_PATH, STORY_ROOM_PATH } from '@/lib/workshops/storyRoomPaths';
import {
    normalizeStoryInvite, STORY_ID, STORY_INVITE, STORY_ROOM_MAX_LINES, type StoryCharacter, type StoryRoomCommand,
    type StoryRoomState, type StoryTurn, type WorkshopStory,
} from '@/lib/workshops/storyRoomTypes';
import styles from './storyRoom.module.css';

type Access = { code: string; browser: string };
type Editor =
    | { type: 'story'; id: string; title: string; premise: string }
    | { type: 'book'; id: string; book: string; editing: boolean };

const INVITE_STORAGE_KEY = 'promptbook.story-room.invite';
const BROWSER_STORAGE_KEY = 'promptbook.story-room.browser';
const STARTER_BOOK = 'Drak Bublina\nPERSONA Jsem zvědavý drak, který místo ohně vyfukuje bubliny.\nKNOWLEDGE Jednou jsem v bublině našel klíč.\nRULE Když mám strach, začnu si broukat.';
const STARTERS = [
    { title: 'Nádraží pro pohádky', premise: 'Na opuštěném nádraží zastavil poslední vlak. Na jeho dveřích bylo napsáno: Vystupuje se do příběhů.' },
    { title: 'Tajemství prázdné vitríny', premise: 'V muzeu zůstala jedna vitrína prázdná. Přesto se z ní každou celou hodinu ozvalo tiché: Už je čas?' },
];

function getRoomHeaders(access: Access) {
    return { 'x-story-invite': access.code, 'x-story-browser': access.browser };
}

export function StoryRoom() {
    const [access, setAccess] = useState<Access | null>(null);
    const [codeInput, setCodeInput] = useState('');
    const [state, setState] = useState<StoryRoomState | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const [readError, setReadError] = useState('');
    const [notice, setNotice] = useState('');
    const [editor, setEditor] = useState<Editor | null>(null);
    const [pending, setPending] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const browserId = useRef('');
    const pendingRequest = useRef(false);
    const uncertainTurn = useRef<StoryTurn | null>(null);
    const transcript = useRef<HTMLOListElement>(null);
    const speechSession = useRef(0);

    const join = useCallback((value: string) => {
        const code = normalizeStoryInvite(value);
        if (!STORY_INVITE.safeParse(code).success) {
            setReadError('Zadej kód z pozvánky do dílny.');
            return;
        }
        if (!browserId.current) {
            browserId.current = window.crypto.randomUUID();
            try {
                const previous = window.localStorage.getItem(BROWSER_STORAGE_KEY);
                if (previous && STORY_ID.safeParse(previous).success) browserId.current = previous;
                window.localStorage.setItem(BROWSER_STORAGE_KEY, browserId.current);
            } catch { /* The room still works with storage disabled. */ }
        }
        try { window.sessionStorage.setItem(INVITE_STORAGE_KEY, code); } catch { /* Keep the code in memory. */ }
        setAccess({ code, browser: browserId.current });
        setReadError('');
    }, []);

    useEffect(() => {
        let code = window.location.hash.slice(1);
        if (!code) {
            try { code = window.sessionStorage.getItem(INVITE_STORAGE_KEY) ?? ''; } catch { /* Manual entry remains available. */ }
        }
        if (code) { setCodeInput(code); join(code); }
    }, [join]);

    useEffect(() => {
        if (!access) return;
        let controller: AbortController | null = null;
        async function refresh() {
            if (document.hidden || !access || controller) return;
            const request = new AbortController();
            controller = request;
            try {
                const query = selectedId ? `?story=${selectedId}` : '';
                const response = await fetch(`${STORY_ROOM_API_PATH}${query}`, {
                    cache: 'no-store', headers: getRoomHeaders(access), signal: request.signal,
                });
                const data = await response.json() as StoryRoomState & { error?: string };
                if (request.signal.aborted) return;
                if (response.status === 404) { setAccess(null); setState(null); }
                if (!response.ok) throw new Error(data.error ?? 'Dílnu se nepodařilo otevřít.');
                const room: StoryRoomState = data;
                const previousTurn = uncertainTurn.current;
                if (previousTurn && room.story?.lines.some(({ id }) => id === previousTurn.requestId)) uncertainTurn.current = null;
                setState(room);
                if (selectedId && room.story?.id !== selectedId) setSelectedId(room.story?.id ?? null);
                setReadError('');
            } catch (error) {
                if (!request.signal.aborted) setReadError(error instanceof Error ? error.message : 'Spojení s dílnou se přerušilo.');
            } finally {
                if (controller === request) controller = null;
            }
        }
        void refresh();
        const timer = window.setInterval(refresh, 4500);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            controller?.abort();
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, [access, selectedId, revision]);

    const story = state?.story && (!selectedId || state.story.id === selectedId) ? state.story : null;
    const lineCount = story?.lines.length ?? 0;
    useEffect(() => {
        if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
    }, [story?.id, lineCount]);
    useEffect(() => () => {
        if (speechSession.current && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    }, []);

    async function mutate(command: StoryRoomCommand, label: string): Promise<boolean> {
        if (!access || pendingRequest.current) return false;
        pendingRequest.current = true;
        setPending(label);
        setNotice('');
        try {
            const response = await fetch(STORY_ROOM_API_PATH, {
                method: 'POST', headers: { ...getRoomHeaders(access), 'Content-Type': 'application/json' },
                body: JSON.stringify(command),
            });
            const data = await response.json() as { storyId?: string; error?: string };
            if (command.action === 'turn' && response.status !== 409 && response.status < 500) uncertainTurn.current = null;
            if (!response.ok) throw new Error(data.error ?? 'Změnu se nepodařilo uložit.');
            if (data.storyId) setSelectedId(data.storyId);
            return true;
        } catch (error) {
            setNotice(error instanceof Error ? error.message : 'Změnu se nepodařilo uložit.');
            return false;
        } finally {
            pendingRequest.current = false;
            setPending('');
            setRevision((current) => current + 1);
        }
    }

    function play(character: StoryCharacter, currentStory: WorkshopStory) {
        if (pendingRequest.current) return;
        const previous = uncertainTurn.current;
        const command: StoryTurn = previous?.storyId === currentStory.id && previous.characterId === character.id
            ? previous
            : { action: 'turn', storyId: currentStory.id, characterId: character.id, requestId: window.crypto.randomUUID() };
        uncertainTurn.current = command;
        void mutate(command, `${character.name} je na tahu…`);
    }

    async function submitEditor(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editor) return;
        const command: StoryRoomCommand = editor.type === 'story'
            ? { action: 'create', id: editor.id, title: editor.title, premise: editor.premise }
            : { action: 'character', id: editor.id, book: editor.book };
        if (await mutate(command, 'Ukládám…')) {
            setEditor(null);
            if (command.action === 'character') setNotice('Postava je v dílně. Přidej ji na scénu.');
        }
    }

    async function copyInvite() {
        if (!access) return;
        const url = `${window.location.origin}${STORY_ROOM_PATH}#${access.code}`;
        try {
            await navigator.clipboard.writeText(url);
            setNotice('Odkaz je zkopírovaný.');
        } catch {
            setNotice(`Kód dílny je ${access.code.match(/.{5}/g)?.join(' ')}.`);
        }
    }

    async function exportPdf(currentStory: WorkshopStory) {
        setIsExporting(true);
        try {
            const { downloadStoryPdf } = await import('./storyRoomPdf');
            await downloadStoryPdf(currentStory);
        } catch {
            setNotice('PDF se nepodařilo vytvořit. Zkus to prosím znovu.');
        } finally {
            setIsExporting(false);
        }
    }

    function toggleReading(currentStory: WorkshopStory) {
        if (!('speechSynthesis' in window)) {
            setNotice('Tento prohlížeč nemá předčítání. Příběh si můžeš stáhnout do PDF.');
            return;
        }
        const reader = window.speechSynthesis;
        const session = ++speechSession.current;
        reader.cancel();
        if (isSpeaking) { setIsSpeaking(false); return; }
        const paragraphs = [currentStory.title, currentStory.premise,
            ...currentStory.lines.map((line) => line.kind === 'action' ? line.text : `${line.characterName}: ${line.text}`)];
        const voice = reader.getVoices().find(({ lang }) => lang.toLowerCase().startsWith('cs'));
        const read = (index: number) => {
            if (speechSession.current !== session) return;
            const text = paragraphs[index];
            if (!text) { setIsSpeaking(false); return; }
            const line = new SpeechSynthesisUtterance(text);
            line.lang = 'cs-CZ';
            if (voice) line.voice = voice;
            line.onend = () => read(index + 1);
            line.onerror = () => {
                if (speechSession.current === session) { setIsSpeaking(false); setNotice('Předčítání se nepodařilo spustit.'); }
            };
            reader.speak(line);
        };
        setIsSpeaking(true);
        read(0);
    }

    const isBusy = Boolean(pending) || Boolean(story?.isBusy);
    const canPlay = state?.canWrite && state.canGenerate && !isBusy && lineCount < STORY_ROOM_MAX_LINES;
    const turnCount = `${lineCount} ${lineCount === 1 ? 'tah' : lineCount <= 4 ? 'tahy' : 'tahů'}`;
    const cast = story?.cast.flatMap((id) => state?.characters.find((character) => character.id === id) ?? []) ?? [];

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div className={styles.brand}><BookOpen aria-hidden="true" size={18} /> Promptbook <span>Dny AI · Městská knihovna</span></div>
                {state && <button className={styles.share} type="button" onClick={() => void copyInvite()}><Copy size={17} /> Zkopírovat odkaz</button>}
            </header>
            <section className={styles.hero} aria-labelledby="room-title">
                <div>
                    <p className={styles.eyebrow}><Sparkles size={15} aria-hidden="true" /> PŘÍBĚHOVÁ DÍLNA</p>
                    <h1 id="room-title">Příběh se píše sám<span>.</span></h1>
                    <p>Ty vybíráš, kdo je na tahu. Postava přidá jednu větu nebo akci.</p>
                </div>
                <span className={styles.heroMark} aria-hidden="true">✦</span>
            </section>
            {readError && <p className={styles.notice} role="alert">{readError}</p>}
            {notice && <p className={styles.notice} role="status">{notice}</p>}
            {!access && <form className={styles.entry} onSubmit={(event) => {
                event.preventDefault();
                join(codeInput);
            }}>
                <h2>Vstup do dílny</h2>
                <label htmlFor="room-code">Kód z pozvánky</label>
                <div className={styles.row}>
                    <input id="room-code" autoComplete="off" autoCapitalize="characters" value={codeInput}
                        onChange={(event) => setCodeInput(event.target.value)} maxLength={25} placeholder="XXXXX XXXXX XXXXX" />
                    <button className={styles.primary} type="submit">Vstoupit</button>
                </div>
            </form>}
            {access && !state && !readError && <p className={styles.notice} role="status"><LoaderCircle size={16} className={styles.spin} /> Otevírám dílnu…</p>}
            {state && <>
                <nav className={styles.toolbar} aria-label="Příběhy v dílně">
                    <label htmlFor="current-story">Příběh</label>
                    <select id="current-story" value={selectedId ?? state.story?.id ?? ''} disabled={Boolean(pending)}
                        onChange={(event) => {
                            setSelectedId(event.target.value);
                            setNotice('');
                            if (isSpeaking && story) toggleReading(story);
                        }}>
                        {!state.stories.length && <option value="">Zatím tu není žádný příběh</option>}
                        {state.stories.map(({ id, title }) => <option key={id} value={id}>{title}</option>)}
                    </select>
                    {state.canWrite && <button className={styles.subtle} type="button" disabled={Boolean(pending)} onClick={() =>
                        setEditor({ type: 'story', id: window.crypto.randomUUID(), title: '', premise: '' })}><Plus size={18} /> Nový příběh</button>}
                </nav>
                {!state.canWrite && <p className={styles.notice}>Dílna je otevřená pro čtení a stažení příběhů.</p>}
                {state.canWrite && !state.canGenerate && <p className={styles.notice}>Postavy teď nemohou hrát. Napsané příběhy si můžeš přečíst nebo stáhnout.</p>}
                <div className={styles.grid}>
                    <section className={styles.stage} aria-label="Scéna">
                        {story ? <>
                            <div className={styles.stageHeader}>
                                <p className={styles.eyebrow}>NA SCÉNĚ</p>
                                <h2>{story.title}</h2>
                                <p className={styles.premise}>{story.premise}</p>
                            </div>
                            <ol className={styles.transcript} ref={transcript} aria-label="Repliky příběhu">
                                {story.lines.map((line) => <li key={line.id}>
                                    <strong>{line.characterName}</strong>
                                    {line.kind === 'action' ? <em>{line.text}</em> : <span>{line.text}</span>}
                                </li>)}
                            </ol>
                            <div className={styles.cast}>
                                <h3>Kdo bude na tahu?</h3>
                                {!cast.length && <p>Přidej někoho z postav v dílně.</p>}
                                <div className={styles.actions}>
                                    {cast.map((character) => <button className={styles.primary} key={character.id} type="button"
                                        disabled={!canPlay} onClick={() => play(character, story)}>
                                        <Sparkles aria-hidden="true" size={16} /> {character.name}
                                    </button>)}
                                </div>
                                <p className={styles.activity} role="status">
                                    {isBusy && <LoaderCircle className={styles.spin} size={16} aria-hidden="true" />}
                                    {pending || (story.isBusy ? 'Postava právě hraje…' : lineCount >= STORY_ROOM_MAX_LINES ? 'Příběh je plný.' :
                                        lineCount ? turnCount : 'Vyber postavu a rozehraj první tah.')}
                                </p>
                            </div>
                            <footer className={styles.exports}>
                                <button className={styles.subtle} type="button" disabled={isExporting} onClick={() => void exportPdf(story)}>
                                    <Download size={17} /> {isExporting ? 'Připravuji PDF…' : 'Stáhnout PDF'}
                                </button>
                                <button className={styles.subtle} type="button" onClick={() => toggleReading(story)}>
                                    {isSpeaking ? <Square size={16} /> : <Volume2 size={18} />} {isSpeaking ? 'Zastavit čtení' : 'Přečíst nahlas'}
                                </button>
                            </footer>
                        </> : <p className={styles.empty}>{selectedId ? 'Načítám scénu…' : 'Začni tlačítkem Nový příběh.'}</p>}
                    </section>
                    <aside className={styles.roster}>
                        <h2>Postavy v dílně</h2>
                        <p>Přidej na scénu, koho chceš rozehrát.</p>
                        <ul>
                            {state.characters.map((character) => {
                                const onStage = Boolean(story?.cast.includes(character.id));
                                return <li key={character.id}>
                                    <span className={styles.initial} aria-hidden="true">{character.name.slice(0, 1).toUpperCase()}</span>
                                    <span className={styles.character}>{character.name}
                                        <small>{character.isWorkshopAgent ? 'Připravená postava' : character.book ? 'Tvoje postava' : 'Z dílny'}</small>
                                    </span>
                                    {character.book && state.canWrite && <button className={styles.icon} type="button" disabled={Boolean(pending)}
                                        aria-label={`Upravit Book postavy ${character.name}`} onClick={() =>
                                            setEditor({ type: 'book', id: character.id, book: character.book!, editing: true })}><Pencil size={16} /></button>}
                                    {state.canWrite && story && <button className={styles.icon} type="button" aria-pressed={onStage}
                                        aria-label={`${onStage ? 'Odebrat ze scény' : 'Přidat na scénu'}: ${character.name}`} disabled={isBusy}
                                        onClick={() => void mutate({ action: 'cast', storyId: story.id, characterId: character.id, include: !onStage }, 'Měním obsazení…')}>
                                        {onStage ? <Check size={19} /> : <Plus size={19} />}
                                    </button>}
                                </li>;
                            })}
                        </ul>
                        {state.canWrite && <button className={styles.subtle} type="button" disabled={Boolean(pending)} onClick={() =>
                            setEditor({ type: 'book', id: window.crypto.randomUUID(), book: STARTER_BOOK, editing: false })}><Plus size={18} /> Vytvořit postavu</button>}
                    </aside>
                </div>
                {editor && state.canWrite && <dialog className={styles.dialog} ref={(dialog) => {
                    if (dialog && !dialog.open) dialog.showModal();
                }} onCancel={(event) => {
                    if (pending) event.preventDefault();
                    else setEditor(null);
                }} aria-labelledby="story-editor-title">
                    <form onSubmit={(event) => void submitEditor(event)}>
                        <button type="button" className={styles.close} disabled={Boolean(pending)} onClick={() => setEditor(null)} aria-label="Zavřít">
                            <X size={23} />
                        </button>
                        {editor.type === 'story' ? <>
                            <h2 id="story-editor-title">Nový příběh</h2>
                            <p>Co se stalo těsně před tím, než postavy přišly na scénu? Všechno si klidně vymysli.</p>
                            <div className={styles.actions}>
                                {STARTERS.map((starter) => <button className={styles.subtle} type="button" key={starter.title}
                                    onClick={() => setEditor({ ...editor, ...starter })}>{starter.title}</button>)}
                            </div>
                            <label htmlFor="story-title">Název</label>
                            <input id="story-title" required minLength={2} maxLength={80} value={editor.title}
                                onChange={(event) => setEditor({ ...editor, title: event.target.value })} />
                            <label htmlFor="story-premise">Začátek příběhu</label>
                            <textarea id="story-premise" required minLength={5} maxLength={550} rows={4} value={editor.premise}
                                onChange={(event) => setEditor({ ...editor, premise: event.target.value })} />
                        </> : <>
                            <h2 id="story-editor-title">{editor.editing ? 'Upravit postavu' : 'Vytvořit postavu'}</h2>
                            <p>První řádek je jméno. Pod něj napiš, jaká postava je a co si pamatuje. Používej vymyšlené údaje.</p>
                            <label htmlFor="character-book">Book postavy</label>
                            <textarea id="character-book" className={styles.book} required minLength={15} maxLength={8000} rows={8}
                                value={editor.book} onChange={(event) => setEditor({ ...editor, book: event.target.value })} />
                        </>}
                        {notice && <p className={styles.notice} role="alert">{notice}</p>}
                        <button type="submit" className={styles.primary} disabled={Boolean(pending)}>
                            {pending || (editor.type === 'story' ? 'Otevřít příběh' : 'Uložit postavu')}
                        </button>
                    </form>
                </dialog>}
            </>}
        </main>
    );
}
