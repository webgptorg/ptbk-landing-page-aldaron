'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Check, CheckCheck, Circle, Coffee, FileText, Folder, GitCommitHorizontal, KeyRound, Laptop, LockKeyhole, Moon, Server, ShieldCheck, Smartphone, Sparkles, Sun, TrainFront, Trees, Wifi } from 'lucide-react';
import { useSiteLocale } from './LocaleProvider';
import s from './ownership-scene.module.css';

/** Authored labels for the interactive product architecture, independent of live account data. */
const COPY = {
    cs: {
        eyebrow: 'VAŠE AI. OPRAVDU VAŠE.', title: 'Odkudkoli ji řídíte.', titleSoft: 'U vás pracuje.',
        intro: 'Aplikace je s vámi. Engine běží na stroji, který máte pod kontrolou. Oba konce jsou vaše — mezi nimi putuje šifrovaný obsah.',
        app: 'Vaše aplikace', engine: 'Váš engine', appPlaces: ['U kávy', 'Venku', 'Ve vlaku'], enginePlaces: ['V kuchyni', 'Na poličce', 'Na VPS'],
        appDescriptions: ['Notebook v kanceláři', 'Telefon na cestě ven', 'Telefon ve vlaku'], engineDescriptions: ['Notebook na kuchyňské lince', 'Vlastní počítač na poličce', 'Pronajatý server pod vaší kontrolou'],
        appChoices: 'Odkud ovládáte aplikaci', engineChoices: 'Kde provozujete engine', appKey: 'Klíč u vás', engineKey: 'Klíč u vás',
        relay: 'Relay', ciphertext: 'Jen šifrovaný obsah', relayNote: 'Přenosová služba obsah nerozšifruje.', connection: 'END-TO-END ŠIFROVÁNÍ',
        workspace: 'Moje agenda', allGood: 'Všechno běží.', answer: 'Příspěvky jsou venku. Další díl sleduji.', next: 'Další kontrola v 10:00', agenda: 'Obsah & komunikace',
        sleep: 'Zavřít aplikaci', wake: 'Otevřít aplikaci', sleeping: 'Aplikace je zavřená.', sleepingHint: 'Vy máte volno.', awakeHint: 'Váš přehled. Vaše rozhodnutí.',
        running: 'Engine pracuje dál', engineTask: 'Připravuji další podklady', engineIdle: 'Čekám na další práci', engineHint: 'Stroj s enginem zůstává zapnutý.',
        illustration: 'Interaktivní schéma architektury aplikace', files: 'Čitelné soubory', filesText: 'Agenti, úkoly a kontext v běžné složce. Otevřete je, upravíte nebo přenesete jinam.',
        history: 'Dohledatelná práce', historyText: 'Git zachovává změny souborů. Vidíte, co se změnilo, a můžete se vrátit k předchozí podobě.',
        models: 'Váš výběr AI', modelsText: 'Měňte podporovaný model nebo poskytovatele. Role, pravidla a projekt zůstávají vaše.',
        commit1: 'Upravená pravidla komunikace', commit2: 'Připravené příspěvky', modelCloud: 'Externí model', modelLocal: 'Lokální model',
        boundary: 'Zvolený externí model a připojené nástroje dostávají vstupy potřebné k práci. E2E šifrování chrání spojení aplikace s enginem.',
        architectureNote: 'Architektura připravované aplikace.', details: 'Jak funguje kontrola nad daty',
    },
    en: {
        eyebrow: 'YOUR AI. TRULY YOURS.', title: 'Control it from anywhere.', titleSoft: 'It works on your machine.',
        intro: 'The app comes with you. The engine runs on a machine you control. Both ends are yours — the content travelling between them is encrypted.',
        app: 'Your app', engine: 'Your engine', appPlaces: ['At your desk', 'Outside', 'On a train'], enginePlaces: ['In the kitchen', 'On a shelf', 'On a VPS'],
        appDescriptions: ['Your laptop at the office', 'Your phone out in the open', 'Your phone on a train'], engineDescriptions: ['A laptop on the kitchen counter', 'Your own computer on a shelf', 'A rented server under your control'],
        appChoices: 'Where you use the app', engineChoices: 'Where you run the engine', appKey: 'Your key', engineKey: 'Your key',
        relay: 'Relay', ciphertext: 'Encrypted content only', relayNote: 'The relay cannot decrypt the content.', connection: 'END-TO-END ENCRYPTED',
        workspace: 'My agenda', allGood: 'All running smoothly.', answer: 'The posts are live. Watching for the next episode.', next: 'Next check at 10:00', agenda: 'Content & communication',
        sleep: 'Close the app', wake: 'Open the app', sleeping: 'The app is closed.', sleepingHint: 'Time for yourself.', awakeHint: 'Your overview. Your decisions.',
        running: 'The engine keeps working', engineTask: 'Preparing the next materials', engineIdle: 'Waiting for the next task', engineHint: 'The engine’s machine stays on.',
        illustration: 'Interactive app architecture illustration', files: 'Readable files', filesText: 'Agents, tasks and context in an ordinary folder. Open, edit or move them elsewhere.',
        history: 'Visible changes', historyText: 'Git keeps the history of file changes. See what changed and return to an earlier version.',
        models: 'Your choice of AI', modelsText: 'Switch supported models or providers. Your roles, rules and project stay yours.',
        commit1: 'Updated communication rules', commit2: 'Prepared social posts', modelCloud: 'External model', modelLocal: 'Local model',
        boundary: 'Your chosen external model and connected tools receive the inputs they need. E2E encryption protects the connection between the app and engine.',
        architectureNote: 'Architecture of the forthcoming app.', details: 'How you stay in control of your data',
    },
} as const;

/** The component's local text has the same semantic shape in both languages. */
type SceneCopy = (typeof COPY)[keyof typeof COPY];

/** Clamped passive scroll movement updates only a CSS variable, never page scrolling. */
function useSceneParallax() {
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0;
        let visible = true;
        const update = () => {
            frame = 0;
            if (!visible || motion.matches) return;
            const bounds = element.getBoundingClientRect();
            const progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - (bounds.top + bounds.height / 2)) / window.innerHeight));
            element.style.setProperty('--ownership-parallax', `${progress * 18}px`);
        };
        const schedule = () => {
            if (!frame && visible && !motion.matches) frame = window.requestAnimationFrame(update);
        };
        const changeMotion = () => {
            if (motion.matches) element.style.setProperty('--ownership-parallax', '0px');
            else schedule();
        };
        const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) schedule();
        }, { rootMargin: '100px' });
        observer?.observe(element);
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });
        motion.addEventListener('change', changeMotion);
        schedule();
        return () => {
            observer?.disconnect();
            window.cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            motion.removeEventListener('change', changeMotion);
        };
    }, []);
    return ref;
}

/** A small, recognizable app display. This is an illustration, never account telemetry. */
function AppDisplay({ copy, asleep }: { copy: SceneCopy; asleep: boolean }) {
    return <div className={`${s.appDisplay} ${asleep ? s.asleep : ''}`}>
        {asleep ? <div className={s.sleepDisplay}><Moon size={28} strokeWidth={1.3} /><span>22:41</span></div> : <>
            <div className={s.appTop}><span className={s.appMark}>p.</span><span>promptbook.</span><span className={s.tinyAvatar}>J</span></div>
            <div className={s.appGreeting}><small>{copy.workspace}</small><strong>{copy.allGood}</strong></div>
            <div className={s.appAgenda}><span className={s.appAgendaIcon}><Sparkles size={17} /></span><div><b>{copy.agenda}</b><span><i />{copy.engineIdle}</span></div></div>
            <div className={s.appMessage}><CheckCheck size={16} /><p>{copy.answer}</p></div>
            <div className={s.appNext}><Circle size={8} />{copy.next}</div>
            <div className={s.appComposer}><span>+</span><span>···</span><ArrowUpRight size={15} /></div>
        </>}
    </div>;
}

/** Code-native office, countryside and train environments share the same physical device language. */
function AppEnvironment({ place, asleep, copy }: { place: number; asleep: boolean; copy: SceneCopy }) {
    return <div className={`${s.environment} ${s.appEnvironment}`} data-place={place}>
        {place === 0 ? <>
            <div className={s.officeArt} aria-hidden="true"><span /><span /><span /></div>
            <div className={s.desk} aria-hidden="true" />
            <div className={s.chair} aria-hidden="true" />
            <div className={s.plant} aria-hidden="true"><i /><i /><i /><b /></div>
            <div className={s.coffeeCup} aria-hidden="true"><i /><span /></div>
        </> : <>
            <div className={place === 2 ? s.trainWindow : s.openLandscape} aria-hidden="true"><div className={s.sun} /><div className={s.hillBack} /><div className={s.hillFront} /><div className={s.landLine} /></div>
            {place === 2 ? <><div className={s.trainSeat} aria-hidden="true" /><div className={s.trainTable} aria-hidden="true" /></> : <div className={s.grasses} aria-hidden="true"><i /><i /><i /><i /><i /></div>}
            <div className={s.hand} aria-hidden="true" />
        </>}
        <div className={place === 0 ? s.laptop : s.phone}>
            <AppDisplay copy={copy} asleep={asleep} />
            {place === 0 ? <div className={s.laptopBase} aria-hidden="true"><span /></div> : <div className={s.phoneCamera} aria-hidden="true" />}
        </div>
        <div className={`${s.endpointKey} ${s.appEndpoint}`}><KeyRound size={13} />{copy.appKey}</div>
    </div>;
}

/** Persistent work on the user's machine is distinct from whether their app is open. */
function EngineEnvironment({ place, copy }: { place: number; copy: SceneCopy }) {
    return <div className={`${s.environment} ${s.engineEnvironment}`} data-place={place}>
        {place === 0 ? <>
            <div className={s.kitchenTiles} aria-hidden="true" />
            <div className={s.counter} aria-hidden="true"><span /><span /></div>
            <div className={s.kitchenJar} aria-hidden="true" /><div className={s.kitchenPlant} aria-hidden="true"><span /><span /><i /></div>
            <div className={s.engineLaptop}><div className={s.engineTerminal}><span>ptbk start</span><b><i />{copy.engineIdle}</b><div /><div /><div /></div><span className={s.engineLaptopBase} /></div>
        </> : place === 1 ? <>
            <div className={s.wallPrint} aria-hidden="true"><span /></div><div className={s.shelf} aria-hidden="true" />
            <div className={s.books} aria-hidden="true"><span /><span /><span /></div>
            <div className={s.miniComputer}><span className={s.computerLight} /><span className={s.vents} /><b>ptbk</b></div>
            <div className={s.shelfRouter} aria-hidden="true"><span /><span /><i /></div>
        </> : <>
            <div className={s.cloudFloor} aria-hidden="true" />
            <div className={`${s.serverRack} ${s.backRack}`} aria-hidden="true"><span /><span /><span /><span /></div>
            <div className={s.serverRack}><div className={s.serverLabel}>VPS <ShieldCheck size={13} /></div>{[0, 1, 2, 3].map(row => <div className={s.serverUnit} key={row}><span /><span /><i /><i /></div>)}<b>ptbk engine</b></div>
        </>}
        <div className={s.workWindow}>
            <div className={s.workHeader}><Folder size={13} /><span>my-project</span><span className={s.runningDot} /></div>
            <div className={s.workFile}><FileText size={12} /><span>agents/</span><span>3</span></div>
            <div className={s.workFile}><FileText size={12} /><span>tasks/</span><Check size={12} /></div>
            <div className={s.workStatus}><span className={s.workPulse} />{copy.engineTask}</div>
        </div>
        <div className={`${s.endpointKey} ${s.engineEndpoint}`}><KeyRound size={13} />{copy.engineKey}</div>
    </div>;
}

/** Independent scene choices use ordinary buttons and preserve native keyboard navigation. */
function PlaceChoices({ label, choices, active, onChange, icons }: { label: string; choices: readonly string[]; active: number; onChange: (index: number) => void; icons: readonly typeof Laptop[] }) {
    return <div className={s.placeChoices} role="group" aria-label={label}>
        {choices.map((choice, index) => {
            const Icon = icons[index];
            return <button type="button" key={choice} aria-pressed={active === index} onClick={() => onChange(index)}><Icon size={15} strokeWidth={1.5} /><span>{choice}</span></button>;
        })}
    </div>;
}

/** Demonstrates control over both endpoints without performing network or account operations. */
export function OwnershipScene() {
    const { locale, path } = useSiteLocale();
    const copy = COPY[locale];
    const [appPlace, setAppPlace] = useState(0);
    const [enginePlace, setEnginePlace] = useState(0);
    const [asleep, setAsleep] = useState(false);
    const [localModel, setLocalModel] = useState(false);
    const sectionRef = useSceneParallax();
    const titleId = useId();
    return <section className={s.section} id="your-ai" ref={sectionRef} aria-labelledby={titleId}>
        <div className={s.heading}>
            <p className={s.eyebrow}>{copy.eyebrow}</p>
            <h2 id={titleId}>{copy.title}<br /><span>{copy.titleSoft}</span></h2>
            <p className={s.intro}>{copy.intro}</p>
            <p className={s.architectureNote}>{copy.architectureNote}</p>
        </div>
        <div className={s.architecture} aria-label={copy.illustration}>
            <div className={s.side}>
                <div className={s.sideTitle}><span className={s.sideNumber}>01</span><h3>{copy.app}</h3><Smartphone size={19} strokeWidth={1.4} /></div>
                <PlaceChoices label={copy.appChoices} choices={copy.appPlaces} active={appPlace} onChange={setAppPlace} icons={[Coffee, Trees, TrainFront]} />
                <AppEnvironment place={appPlace} asleep={asleep} copy={copy} />
                <p className={s.locationCaption}>{copy.appDescriptions[appPlace]}</p>
                <div className={s.appControl}>
                    <button type="button" onClick={() => setAsleep(value => !value)} aria-pressed={asleep}>{asleep ? <Sun size={16} /> : <Moon size={16} />}{asleep ? copy.wake : copy.sleep}</button>
                    <span role="status">{asleep ? copy.sleepingHint : copy.awakeHint}</span>
                </div>
            </div>
            <div className={`${s.bridge} ${asleep ? s.bridgeSleeping : ''}`}>
                <span className={s.connectionLabel}>{copy.connection}</span>
                <div className={s.connectionTrack} aria-hidden="true"><span /><span /><span /></div>
                <div className={s.relay}><LockKeyhole size={24} strokeWidth={1.25} /><b>{copy.relay}</b><span>•••</span></div>
                <div className={s.cipher} aria-hidden="true">a7 f2 9c<br />04 b8 e1</div>
                <span className={s.encrypted}>{copy.ciphertext}</span>
                <p>{copy.relayNote}</p>
            </div>
            <div className={s.side}>
                <div className={s.sideTitle}><span className={s.sideNumber}>02</span><h3>{copy.engine}</h3><Server size={19} strokeWidth={1.4} /></div>
                <PlaceChoices label={copy.engineChoices} choices={copy.enginePlaces} active={enginePlace} onChange={setEnginePlace} icons={[Laptop, Server, ShieldCheck]} />
                <EngineEnvironment place={enginePlace} copy={copy} />
                <p className={s.locationCaption}>{copy.engineDescriptions[enginePlace]}</p>
                <div className={s.engineControl}><span className={s.engineRunning}><i />{copy.running}</span><span>{copy.engineHint}</span></div>
            </div>
        </div>
        <div className={s.evidence}>
            <article>
                <div className={s.evidenceIcon}><Folder size={21} strokeWidth={1.4} /></div><h3>{copy.files}</h3><p>{copy.filesText}</p>
                <div className={s.fileTree}><div><Folder size={12} />my-project/</div><span><Folder size={11} />agents/</span><span><Folder size={11} />tasks/</span><span><Folder size={11} />chats/</span><span><FileText size={11} />ptbk.json</span></div>
            </article>
            <article>
                <div className={s.evidenceIcon}><GitCommitHorizontal size={22} strokeWidth={1.4} /></div><h3>{copy.history}</h3><p>{copy.historyText}</p>
                <div className={s.gitHistory}><div><GitCommitHorizontal size={17} /><span>{copy.commit1}</span><code>+3 −1</code></div><div><GitCommitHorizontal size={17} /><span>{copy.commit2}</span><code>+24</code></div></div>
            </article>
            <article>
                <div className={s.evidenceIcon}><Sparkles size={21} strokeWidth={1.4} /></div><h3>{copy.models}</h3><p>{copy.modelsText}</p>
                <div className={s.modelChoices} role="group" aria-label={copy.models}><button type="button" aria-pressed={!localModel} onClick={() => setLocalModel(false)}><Wifi size={14} />{copy.modelCloud}</button><button type="button" aria-pressed={localModel} onClick={() => setLocalModel(true)}><Laptop size={14} />{copy.modelLocal}</button></div>
                <div className={s.modelRoute} aria-hidden="true"><span>engine</span><i />{localModel ? <Laptop size={16} /> : <Sparkles size={16} />}<span>{localModel ? 'localhost' : 'AI provider'}</span></div>
            </article>
        </div>
        <div className={s.boundary}><ShieldCheck size={18} strokeWidth={1.4} /><p>{copy.boundary}</p><Link href={path('bezpecnost')}>{copy.details}<ArrowUpRight size={15} /></Link></div>
    </section>;
}
