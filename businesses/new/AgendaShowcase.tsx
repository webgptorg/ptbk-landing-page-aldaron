'use client';

import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { ArrowRight, Check, Code2, FileText, Mail, Pause, Play, RefreshCw, Send, Share2, ShieldCheck, Video } from 'lucide-react';
import Link from 'next/link';
import { SCENARIOS, type ScenarioId } from './economics';
import { sitePath } from './siteConfig';
import s from './site.module.css';

const tabs = [
    { id: 'email', label: 'E-maily', icon: Mail, title: 'Schránka, ve které se věci posouvají.', steps: ['Nový dotaz', 'Firemní kontext', 'Návrh odpovědi', 'Vyřízeno podle pravidel'] },
    { id: 'documents', label: 'Účetní podklady', icon: FileText, title: 'Z dokladů jsou připravené podklady.', steps: ['Příchozí doklad', 'Vytěžení údajů', 'Příprava podkladů', 'Předáno účetní'] },
    { id: 'social', label: 'Sociální sítě', icon: Share2, title: 'Jedno téma. Obsah pro všechny vaše sítě.', steps: ['Obsahový plán', 'Texty a vizuály', 'Schválení', 'Naplánováno'] },
    { id: 'video', label: 'Video → obsah', icon: Video, title: 'Natočte jednou. Publikujte vícekrát.', steps: ['Zdrojové video', 'Přepis', 'Článek a příspěvky', 'Připraveno k publikaci'] },
    { id: 'coding', label: 'Údržba webu', icon: Code2, title: 'Web, o který je postaráno i mezi zakázkami.', steps: ['Údržbový úkol', 'Úprava kódu', 'Automatické testy', 'Změna připravena'] },
] as const;

function EmailPreview() {
    return <div className={s.mailPreview}><div className={s.inbox}>
        <strong>Doručené</strong>{['Dotaz na dodání', 'Podklady k nabídce', 'Změna termínu'].map((text, index) => <div key={text} className={index === 0 ? s.selectedMail : ''}><span className={s.avatar}>{['K', 'M', 'P'][index]}</span><span><b>{text}</b><small>{['Klient · před chvílí', 'Dodavatel · dnes', 'Tým · dnes'][index]}</small></span>{index > 0 && <Check size={15} />}</div>)}
    </div><div className={s.emailBody}><div className={s.windowLabel}><Mail size={16} /> Dotaz na dodání</div><p>Dobrý den, kdy můžeme očekávat naši objednávku?</p><div className={s.draft}><span className={s.demoStatus}>Připravená odpověď</span><p>Dobrý den, objednávka je připravená k expedici. Doručení očekáváme ve čtvrtek. Jakmile bude na cestě, pošleme vám sledovací odkaz.</p><small>Podklad: objednávka a firemní pravidla komunikace</small></div><div className={s.previewAction}><ShieldCheck size={16} /> Odeslání podle vašich pravidel <Send size={17} /></div></div></div>;
}
function DocumentsPreview() {
    return <div className={s.documentPreview}><div className={s.paper}><FileText size={32} /><strong>FAKTURA</strong><span>FV-2026-0142</span><div className={s.paperLines} /><div className={s.paperTotal}>12 480 Kč</div><small>Ukázkový doklad</small></div><div className={s.extracted}><span className={s.demoStatus}>Připraveno pro účetní</span><h3>Doklad převedený na data</h3><dl>{[['Číslo dokladu', 'FV-2026-0142'], ['Celkem', '12 480 Kč'], ['Datum vystavení', '15. 10. 2026'], ['Příloha', 'faktura.pdf']].map(([a,b]) => <div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl><p><Check size={17} /> Údaje a originál na jednom místě</p><small>Výjimky a odborné posouzení zůstávají účetní.</small></div></div>;
}
function SocialPreview() {
    return <div className={s.socialPreview}>{['Facebook', 'Instagram', 'LinkedIn'].map((network, index) => <article className={s.socialPost} key={network}><header><span className={s.networkMark}>{['f', '◎', 'in'][index]}</span><strong>{network}</strong><Check size={15} /></header><div className={`${s.postArtwork} ${index === 1 ? s.postArtworkSecond : ''}`}><span>Malé změny.<br /><b>Velký rozdíl.</b></span><div className={s.artworkShape} /></div><p>{['Pět drobností, které vám usnadní pracovní den. Kterou vyzkoušíte jako první?', 'Více prostoru pro to důležité. Začněte jedním malým krokem. ✨', 'Rutina nemusí zabrat celý den. Jak dát svému týmu více času na skutečnou práci.'][index]}</p><footer>Naplánováno · {['9:00','12:00','15:00'][index]}</footer></article>)}</div>;
}
function VideoPreview() {
    return <div className={s.videoPreview}><div><div className={s.videoArtwork}><Video size={35} /><strong>Jak si vrátit čas<br />na důležitou práci</strong><span>Zdrojové video · 18:42</span></div><div className={s.waveform}>{Array.from({length: 31}, (_,i) => <i key={i} style={{height: `${12 + (i * 13 % 33)}px`}} />)}</div></div><div className={s.videoOutputs}><div className={s.outputDocument}><span>ČLÁNEK NA WEB</span><h3>Pět způsobů, jak omezit rutinu ve firmě</h3><div className={s.paperLines} /></div><div className={s.outputChips}><span><Check size={15} /> Přepis</span><span><Check size={15} /> Popis videa</span><span><Check size={15} /> Příspěvky</span></div></div></div>;
}
function CodingPreview() {
    return <div className={s.codingPreview}><div className={s.codeWindow}><div>Údržba / oprava kontaktního formuláře</div><pre><span>  function submitForm() {'{'}</span>{'\n'}<del>−   send(form.email);</del>{'\n'}<ins>+   validate(form);</ins>{'\n'}<ins>+   await send(form.email);</ins>{'\n'}<ins>+   showConfirmation();</ins>{'\n'}<span>  {'}'}</span></pre><p><Check size={16} /> Testy formuláře prošly</p></div><div className={s.sitePreview}><div className={s.browserDots}>● ● ● <span>váš-web.cz</span></div><div className={s.previewSiteContent}><span className={s.miniLogo}>VAŠE FIRMA</span><h3>Jsme tu pro vás.</h3><div className={s.fakeInput}>jmeno@firma.cz</div><div className={s.sentNotice}><Check size={20} /> Zpráva byla přijata</div></div><small>Změna připravena k nasazení</small></div></div>;
}

/** Demonstration only. One bounded playback per selection, pause/replay and reduced-motion support. */
export function AgendaShowcase({ initialScenario = 'email' }: { initialScenario?: ScenarioId }) {
    const [active, setActive] = useState<ScenarioId>(initialScenario);
    const [stage, setStage] = useState(0);
    const [paused, setPaused] = useState(false);
    const [reduced, setReduced] = useState(true);
    const id = useId();
    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(media.matches); update();
        media.addEventListener('change', update); return () => media.removeEventListener('change', update);
    }, []);
    useEffect(() => {
        if (paused || reduced || stage >= 3) return;
        const timer = window.setTimeout(() => setStage(stage + 1), 1500);
        return () => window.clearTimeout(timer);
    }, [paused, reduced, stage, active]);
    const tab = tabs.find(item => item.id === active)!;
    function select(value: ScenarioId) { setActive(value); setStage(0); setPaused(false); }
    function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        select(tabs[next].id); document.getElementById(`${id}-${tabs[next].id}`)?.focus();
    }
    return <section className={s.showcase} aria-label="Ukázky agend" id="agendy">
        <div role="tablist" aria-label="Vyberte ukázku agendy" className={s.agendaTabs}>{tabs.map((item,index) => <button type="button" role="tab" key={item.id} id={`${id}-${item.id}`} aria-selected={item.id === active} aria-controls={`${id}-panel`} tabIndex={item.id === active ? 0 : -1} onClick={() => select(item.id)} onKeyDown={(event) => navigate(event,index)}><item.icon size={21} /><span>{item.label}</span></button>)}</div>
        <div className={s.showcasePanel} role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${active}`}>
            <div className={s.showcaseHeading}><h2>{tab.title}</h2><span>Ukázka</span></div>
            <div className={s.showcaseCanvas} key={active}>{active === 'email' ? <EmailPreview /> : active === 'documents' ? <DocumentsPreview /> : active === 'social' ? <SocialPreview /> : active === 'video' ? <VideoPreview /> : <CodingPreview />}</div>
            <div className={s.playback}><div className={s.demoSteps}>{tab.steps.map((step,index) => <span className={index <= (reduced ? 3 : stage) ? s.stepComplete : ''} key={step}><i>{index < (reduced ? 3 : stage) ? <Check size={12} /> : index + 1}</i>{step}</span>)}</div><button type="button" aria-label={stage >= 3 ? 'Přehrát ukázku znovu' : paused ? 'Pokračovat v ukázce' : 'Pozastavit ukázku'} onClick={() => { if (stage >= 3) {setStage(0);setPaused(false);} else setPaused(!paused); }} disabled={reduced}>{stage >= 3 ? <RefreshCw size={18} /> : paused ? <Play size={18} /> : <Pause size={18} />}</button></div>
        </div><div className={s.showcaseCaption}><p>{SCENARIOS[active].description}</p><Link href={sitePath(`agendy/${active}`)}>Jak funguje tato agenda <ArrowRight size={17} /></Link></div>
    </section>;
}
