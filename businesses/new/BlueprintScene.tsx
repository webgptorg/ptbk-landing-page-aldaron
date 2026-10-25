'use client';

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { useSiteLocale } from './LocaleProvider';
import s from './blueprint-scene.module.css';

export type BlueprintKind = 'podcast' | 'relationships' | 'development' | 'engine';
type Props = { kind: BlueprintKind; step: number; visibleStage?: number; progress?: number[]; appPlace?: number; enginePlace?: number; asleep?: boolean };
const titles = {
    cs: { podcast: 'Od nového dílu k publikovaným příspěvkům', relationships: 'Od nové příležitosti k osobnímu oslovení', development: 'Od večerního hašení k rannímu řešení', engine: 'Vaše aplikace a váš engine' },
    en: { podcast: 'From a new episode to published posts', relationships: 'From a new opportunity to a personal email', development: 'From an evening report to a morning fix', engine: 'Your app and your engine' },
} as const;

function Copy({ x = 0, y = 0, lines, variant = 'body', gap = 23 }: { x?: number; y?: number; lines: string[]; variant?: 'body' | 'small' | 'title' | 'label' | 'mono' | 'accentText'; gap?: number }) {
    return <text x={x} y={y} className={s[variant]}>{lines.map((line, i) => <tspan key={i} x={x} dy={i ? gap : 0}>{line}</tspan>)}</text>;
}

/** Actual text content grows; no opacity mask can reveal an already written sentence. */
function TypingCopy({ x = 0, y = 0, lines, progress, variant = 'body', gap = 23 }: { x?: number; y?: number; lines: string[]; progress: number; variant?: 'body' | 'small' | 'title' | 'label' | 'mono'; gap?: number }) {
    const length = lines.reduce((sum, line) => sum + line.length, 0);
    const count = Math.floor(Math.max(0, Math.min(1, progress)) * length);
    let offset = 0;
    const cursorLine = lines.findIndex((line, index) => count < lines.slice(0, index + 1).reduce((sum, value) => sum + value.length, 0) || index === lines.length - 1);
    return <text x={x} y={y} className={s[variant]} xmlSpace="preserve" data-typing="true">{lines.map((line, index) => {
        const text = line.slice(0, Math.max(0, count - offset));
        offset += line.length;
        return <tspan key={index} x={x} dy={index ? gap : 0} className={variant === 'mono' ? (line.startsWith('+') ? s.codeAdded : line.startsWith('−') ? s.codeRemoved : undefined) : undefined}>{text}{progress > 0 && progress < 1 && index === cursorLine && <tspan className={s.cursor}>▎</tspan>}</tspan>;
    })}</text>;
}
const part = (progress: number, start: number, end: number) => Math.max(0, Math.min(1, (progress - start) / (end - start)));

function Check({ x, y, active = true }: { x: number; y: number; active?: boolean }) {
    return <g transform={'translate('+x+' '+y+')'} className={s.working} data-active={active}><circle r="11" className={s.fill}/><path d="m-5 0 3.5 4 7-8" className={s.strong}/></g>;
}
function Route({ d, active = true }: { d: string; active?: boolean }) {
    return <g><path d={d} className={s.route}/>{active && <path d={d} className={s.signal} pathLength="100"/>}</g>;
}
function Panel({ label, children, height = 260 }: { label: string; children: ReactNode; height?: number }) {
    return <g className={s.window}><path d={'M0 0 12-9H282V'+(height-9)+'l-12 9'} className={s.dim}/><rect width="270" height={height} rx="6" className={s.fill}/><path d="M0 36H270" className={s.dim}/><circle cx="16" cy="18" r="2"/><circle cx="25" cy="18" r="2"/><circle cx="34" cy="18" r="2"/><Copy x={48} y={23} lines={[label]} variant="small"/>{children}</g>;
}
function Microphone() {
    return <g transform="translate(211 103)"><rect x="-17" y="-35" width="34" height="65" rx="17" className={s.panel}/><path d="M-25 8v8a25 25 0 0 0 50 0V8M0 42v21m-19 0h38" className={s.strong}/>{[-17,-7,3,13].map(y => <path key={y} d={'M-9 '+y+'H9'} className={s.dim}/>)}</g>;
}
function Waveform({ y = 205 }: { y?: number }) {
    const peaks = [9,15,7,28,41,24,12,35,51,32,16,8,22,46,57,38,19,30,48,25,11,18,43,33,56,40,21,10,29,47,35,14,23,52,37,17,8,31,20,11];
    return <g>{peaks.map((height, index) => <rect key={index} x={21 + index * 5.8} y={y - height / 2} width="3.2" height={height} rx="1.6" className={s.wave} style={{ '--i': index, '--a': .2 + (index * 13 % 31) / 40, '--b': .25 + (index * 19 % 29) / 40, '--c': .15 + (index * 7 % 37) / 45 } as CSSProperties}/>)}</g>;
}
function Podcast({ step, progress, mobile, en }: { step: number; progress: number[]; mobile: boolean; en: boolean }) {
    return <>
        <g data-bp-stage="0" transform={mobile ? 'translate(27 28)' : 'translate(40 150)'}>
            <Panel label={en ? 'New episode' : 'Nový díl'}>
                <Copy x={20} y={68} lines={['AI ta Krajta']} variant="label"/>
                <Copy x={20} y={110} lines={en ? ['What can AI','do for you?'] : ['Co už AI','umí za vás?']} variant="title" gap={29}/>
                <Microphone/>
                <Waveform/>
            </Panel>
        </g>
        <g data-bp-stage="1" transform={mobile ? 'translate(27 358)' : 'translate(365 80)'} data-active={step >= 1}>
            <Panel label={en ? 'Listening in context' : 'Poslouchá v kontextu'}>
                <Copy x={20} y={77} lines={en ? ['Ideas worth','sharing'] : ['Myšlenky, které','stojí za sdílení']} variant="title" gap={28}/>
                <path d="M20 127H250" className={s.dim}/>
                <Copy x={20} y={153} lines={['08:24']} variant="accentText"/>
                <TypingCopy x={20} y={178} progress={progress[1]} lines={en ? ['An agent needs','a lasting goal.'] : ['Agent potřebuje','dlouhodobý cíl.']}/>
                <Copy x={20} y={235} lines={['17:06  '+(en ? 'Your own context' : 'Vlastní kontext')]} variant="small"/>
            </Panel>
        </g>
        <g data-bp-stage="2" transform={mobile ? 'translate(27 688)' : 'translate(690 155)'} data-active={step >= 2}>
            <Panel label={step === 3 ? (en ? 'Published' : 'Publikováno') : (en ? 'Posts' : 'Příspěvky')} height={300}>
                <circle cx="34" cy="66" r="16" className={s.panel}/><Copy x={24} y={71} lines={['PH']} variant="small"/>
                <Copy x={59} y={63} lines={['Pavol Hejný']} variant="label"/><Copy x={59} y={83} lines={['LinkedIn']} variant="small"/><Copy x={231} y={71} lines={['in']} variant="title"/>
                <TypingCopy x={20} y={117} progress={part(progress[2], 0, .7)} lines={en ? ['What changes when AI','takes on a whole agenda?','A conversation with','Petr and Šimon.'] : ['Co se změní, když AI','svěříte celou agendu?','Nový díl s Petrem','a Šimonem.']} gap={22}/>
                <path d="M20 204H250" className={s.dim}/>
                <Copy x={20} y={231} lines={['YouTube  ·  '+(en ? 'Groups' : 'Skupiny')]} variant="label"/>
                <TypingCopy x={20} y={255} progress={part(progress[2], .7, 1)} lines={en ? ['08:24 — what would you','hand over to an agent?'] : ['08:24 — co byste','svěřili agentovi vy?']} variant="small" gap={19}/>
                <Check x={240} y={282} active={step === 3}/>
            </Panel>
        </g>
    </>;
}
function CRM({ step, progress, mobile, en }: { step: number; progress: number[]; mobile: boolean; en: boolean }) {
    return <>
        <g data-bp-stage="0" transform={mobile ? 'translate(27 28)' : 'translate(40 150)'}>
            <Panel label={en ? 'Your contacts' : 'Vaše kontakty'}>
                <circle cx="40" cy="79" r="20" className={s.panel}/><Copy x={29} y={84} lines={['JN']} variant="label"/>
                <Copy x={76} y={75} lines={['Jana Nováková']} variant="label"/><Copy x={76} y={96} lines={['Studio North']} variant="small"/>
                <path d="M20 120H250M20 139H186M20 155H220" className={s.dim}/>
                <rect x="16" y="178" width="238" height="65" rx="3" className={s.panel}/>
                <circle cx="31" cy="199" r="3" className={s.accent}/>
                <Copy x={45} y={204} lines={en ? ['A new branch in Brno'] : ['Nová pobočka v Brně']} variant="label"/>
                <Copy x={27} y={227} lines={en ? ['Studio North is growing.'] : ['Studio North rozšiřuje tým.']} variant="small"/>
            </Panel>
            <path d="M-14 45v225h270M-7 45v217h270" className={s.dim}/>
        </g>
        <g data-bp-stage="1" transform={mobile ? 'translate(27 358)' : 'translate(365 80)'} data-active={step >= 1}>
            <Panel label={en ? 'Earlier conversation · 14 Sep' : 'Předchozí rozhovor · 14. 9.'}>
                <Copy x={20} y={84} lines={en ? ['“Let’s revisit this','when we grow.”'] : ['„Vraťme se k tomu,','až budeme růst.“']} variant="title" gap={30}/>
                <TypingCopy x={20} y={157} progress={progress[1]} lines={en ? ['Route enquiries from','the new branch to','the right person.'] : ['Dotazy z nové pobočky','směrovat ke správnému','člověku.']}/>
                <Check x={29} y={235} active={progress[1] >= 1}/><Copy x={50} y={240} lines={progress[1] >= 1 ? [en ? 'Relevant context found' : 'Souvislost nalezena'] : []} variant="small"/>
            </Panel>
        </g>
        <g data-bp-stage="2" transform={mobile ? 'translate(27 688)' : 'translate(690 155)'} data-active={step >= 2}>
            <Panel label={step === 3 ? (en ? 'Sent within your rules' : 'Odesláno podle pravidel') : (en ? 'Personal email' : 'Osobní e-mail')} height={300}>
                <Copy x={20} y={65} lines={[(en ? 'To: ' : 'Komu: ')+'Jana Nováková']} variant="label"/>
                <path d="M16 82H254" className={s.dim}/>
                <Copy x={20} y={110} lines={en ? ['Congratulations on Brno'] : ['Gratulace k pobočce v Brně']} variant="label"/>
                <TypingCopy x={20} y={148} progress={progress[2]} lines={en ? ['Hello Jana,','congratulations on opening','in Brno. In September,','we discussed routing','customer enquiries.','Shall we revisit that?'] : ['Dobrý den, Jano,','gratuluji k otevření v Brně.','V září jsme spolu řešili','směrování dotazů','zákazníků. Dávalo by smysl','se k tomu teď vrátit?']} gap={21}/>
                <Check x={28} y={282} active={step === 3}/><Copy x={48} y={287} lines={step === 3 ? [en ? 'Follow-up saved in CRM' : 'Další krok uložen v CRM'] : []} variant="small"/>
            </Panel>
        </g>
    </>;
}
function Development({ step, progress, mobile, en }: { step: number; progress: number[]; mobile: boolean; en: boolean }) {
    return <>
        <g data-bp-stage="0" transform={mobile ? 'translate(27 28)' : 'translate(40 150)'}>
            <Panel label="22:14">
                <Copy x={20} y={86} lines={en ? ['The contact form','returns an error.'] : ['Kontaktní formulář','vrací chybu.']} variant="title" gap={29}/>
                <Copy x={20} y={151} lines={en ? ['Customers cannot send','an enquiry. The campaign','starts tomorrow morning.'] : ['Zákazníci nemohou odeslat','poptávku. Ráno spouštíme','kampaň.']}/>
                <rect x="20" y="218" width="230" height="26" rx="3" className={s.panel}/><Copy x={29} y={236} lines={['!  '+(en ? 'Validation error' : 'Chyba validace')]} variant="small"/>
            </Panel>
        </g>
        <g data-bp-stage="1" transform={mobile ? 'translate(27 358)' : 'translate(365 80)'} data-active={step >= 1}>
            <Panel label="contact-form.ts">
                <TypingCopy x={18} y={74} progress={progress[1]} lines={['const email =', '  input.email.trim();', '', '− validate(input.email);', '+ validate(email);', '', 'return { success: true };']} variant="mono" gap={24}/>
                <path d="M16 224H254" className={s.dim}/>
                <Copy x={18} y={245} lines={['Git  ·  +1 −1']} variant="small"/>
            </Panel>
        </g>
        <g data-bp-stage="2" transform={mobile ? 'translate(27 688)' : 'translate(690 155)'} data-active={step >= 2}>
            <Panel label={step === 3 ? '07:30' : '22:26'} height={300}>
                <TypingCopy x={20} y={77} progress={part(progress[2], 0, .2)} lines={en ? ['The form works','again.'] : ['Formulář už','funguje.']} variant="title" gap={29}/>
                <rect x="20" y="125" width="230" height="34" rx="4" className={s.panel}/>
                <TypingCopy x={30} y={147} progress={part(progress[2], .2, .45)} lines={['jana@example.cz']} variant="small"/>
                <rect x="20" y="169" width="230" height="51" rx="4" className={s.panel}/>
                <TypingCopy x={30} y={193} progress={part(progress[2], .45, .75)} lines={en ? ['I would like to know more.'] : ['Ráda se dozvím víc.']} variant="small"/>
                <Check x={30} y={244} active={progress[2] >= .9}/>
                <TypingCopy x={50} y={249} progress={part(progress[2], .8, 1)} lines={en ? ['Enquiry sent'] : ['Poptávka odeslána']} variant="label"/>
                <path d="M18 267H252" className={s.dim}/>
                <Copy x={20} y={287} lines={step === 3 ? [en ? 'Tests passed · change in Git' : 'Testy prošly · změna v Gitu'] : []} variant="small"/>
            </Panel>
        </g>
    </>;
}
function Laptop({ asleep, en, engine = false }: { asleep: boolean; en: boolean; engine?: boolean }) {
    return <g><path d="M0 0h260v170H0Z" className={s.fill}/><path d="M-11 0v179H260l12-9M0 170l-40 45h291l9-45M-40 215v8h291v-8M82 195h79l10 11H71Z" className={s.dim}/><rect x="13" y="13" width="234" height="143" rx="2" className={s.panel}/>
        {asleep ? <g><path d="M128 57a28 28 0 1 0 29 37 31 31 0 0 1-29-37Z" className={s.strong}/><Copy x={92} y={137} lines={['22:41']} variant="small"/></g> : <>
            <Copy x={27} y={39} lines={[engine ? '$ ptbk start' : 'promptbook']} variant="label"/>
            <path d="M25 51H234" className={s.dim}/>
            <Copy x={27} y={78} lines={engine ? ['agents/   tasks/','my-project/'] : (en ? ['My agenda','The posts are live.'] : ['Moje agenda','Příspěvky jsou venku.'])} variant="body" gap={27}/>
            <circle cx="31" cy="135" r="3" className={s.pulse}/><Copy x={43} y={139} lines={engine ? (en ? ['Engine keeps working'] : ['Engine pracuje dál']) : (en ? ['All running smoothly'] : ['Všechno běží'])} variant="small"/>
        </>}
    </g>;
}
function Phone({ asleep, en }: { asleep: boolean; en: boolean }) {
    return <g transform="translate(62 -20)"><rect x="-8" y="5" width="157" height="270" rx="19" className={s.dim}/><rect width="157" height="270" rx="18" className={s.fill}/><rect x="11" y="30" width="135" height="209" rx="5" className={s.panel}/><path d="M59 15H98M60 253H98"/>
        {asleep ? <><path d="M80 98a29 29 0 1 0 29 37 31 31 0 0 1-29-37Z"/><Copy x={52} y={182} lines={['22:41']} variant="small"/></> : <>
            <Copy x={23} y={60} lines={['promptbook']} variant="label"/>
            <Copy x={23} y={100} lines={en ? ['My agenda'] : ['Moje agenda']} variant="small"/>
            <Copy x={23} y={135} lines={en ? ['The posts','are live.'] : ['Příspěvky','jsou venku.']} variant="body"/>
            <Check x={31} y={205}/><path d="M52 203H124M52 213H108" className={s.dim}/>
        </>}
    </g>;
}
function Engine({ mobile, en, appPlace, enginePlace, asleep }: { mobile: boolean; en: boolean; appPlace: number; enginePlace: number; asleep: boolean }) {
    return <>
        <g transform={mobile ? 'translate(60 65)' : 'translate(95 170)'}>
            <Copy x={8} y={-57} lines={en ? ['Your app'] : ['Vaše aplikace']} variant="title"/>
            {appPlace === 0 ? <>
                <path d="M-45 233H307v14H-45Zm17 14v103m308-103v103" className={s.strong}/>
                <Laptop asleep={asleep} en={en}/>
            </> : <>
                <path d={appPlace === 1 ? 'M-44 254Q50 195 122 250T309 245M-18 275l5-20 4 20m271-4 5-24 6 24M-10 140v-65m-32 25 32-55 32 55Z' : 'M-39-19V-60H306v210M-39 115H306M-39 95H306M-18 281H279M-5 281v50m269-50v50'} className={s.dim}/>
                <Phone asleep={asleep} en={en}/>
            </>}
        </g>
        <g transform={mobile ? 'translate(55 507)' : 'translate(635 130)'}>
            <Copy x={-4} y={-17} lines={en ? ['Your engine'] : ['Váš engine']} variant="title"/>
            {enginePlace < 2 ? <>
                <path d="M-40 300V20H298v280M-40 20l23-18h332v280l-17 18M298 20l17-18M-40 300H298M-40 228H298M-40 278H298" className={s.dim}/>
                <g transform="translate(15 67) scale(.88)"><Laptop asleep={false} en={en} engine/></g>
                <path d={enginePlace === 0 ? 'M-40 228l-18 28H280l18-28M-58 256v26H280v-26M87 271h57' : 'M-25 258H18v-25h-43Zm57 0h40v-25H32Zm53 0h29v-25H85Z'} className={s.strong}/>
                <circle cx="258" cy="280" r="3" className={s.pulse}/>
            </> : <>
                <path d="M0 40 57 10 286 10 230 40ZM0 40v285h230V40m0 285 56-30V10M0 325l57-30h229" className={s.fill}/>
                {[0,1,2,3].map(i => <g key={i}><rect x="16" y={60+i*58} width="198" height="43" rx="3" className={s.panel}/><path d={'M31 '+(74+i*58)+'h111m-111 13h111'} className={s.dim}/><circle cx="191" cy={81+i*58} r="3" className={s.pulse}/></g>)}
                <Copy x={23} y={309} lines={['VPS · ptbk engine']} variant="label"/>
                <g className={s.rotor}><circle cx="258" cy="165" r="17"/><path d="M258 148v34m-17-17h34m-29-12 24 24m-24 0 24-24" className={s.dim}/></g>
            </>}
            <Copy x={3} y={enginePlace === 2 ? 354 : 331} lines={en ? ['Engine keeps working'] : ['Engine pracuje dál']} variant="small"/>
        </g>
        <g transform={mobile ? 'translate(192 420)' : 'translate(500 302)'}>
            <circle r="30" className={s.fill}/><rect x="-10" y="-7" width="20" height="18" rx="3"/><path d="M-6-7v-6a6 6 0 0 1 12 0v6M0 0v4"/>
            <Copy x={-14} y={51} lines={['E2E']} variant="small"/>
        </g>
        <Route d={mobile ? 'M190 345V373Q190 388 192 390M192 450V480Q192 495 190 507' : 'M355 302H470M530 302H635'} active={!asleep}/>
        <Route d={mobile ? 'M85 824H310' : 'M666 510H869'}/>
    </>;
}

/** Native vector artwork derived from the approved light blueprint, with actual website story content. */
export function BlueprintScene({ kind, step, visibleStage, progress = [1, 1, 1], appPlace = 0, enginePlace = 0, asleep = false }: Props) {
    const { locale } = useSiteLocale(); const en = locale === 'en';
    const prefix = 'blueprint-'+useId().replace(/:/g,'');
    const [mobile,setMobile] = useState(false);
    useEffect(() => {
        const media = window.matchMedia('(max-width: 600px)'); const update = () => setMobile(media.matches);
        update(); media.addEventListener('change',update); return () => media.removeEventListener('change',update);
    },[]);
    const height = mobile ? (kind === 'engine' ? 890 : 1030) : 600;
    const width = mobile ? (kind === 'engine' ? 380 : 340) : 1000;
    return <svg className={s.canvas} viewBox={'0 0 '+width+' '+height} role="img" aria-labelledby={prefix+'-title '+prefix+'-description'} data-blueprint={kind} data-visible-stage={visibleStage} data-bp-variant="light" data-app-place={appPlace} data-engine-place={enginePlace} data-asleep={asleep}>
        <title id={prefix+'-title'}>{titles[locale][kind]}</title>
        <desc id={prefix+'-description'}>{en ? 'Illustrative scenario with configured access and rules. ' : 'Modelová ukázka s nastavenými přístupy a pravidly. '}{kind === 'engine' ? (en ? 'The app and engine are separate devices. The engine continues when the app is closed. E2E protects their connection, not data provided to external AI or tools. Architecture of the forthcoming app.' : 'Aplikace a engine jsou oddělená zařízení. Engine pokračuje i po zavření aplikace. E2E chrání jejich spojení, nikoli data předávaná externí AI a nástrojům. Architektura připravované aplikace.') : titles[locale][kind]}</desc>
        <defs><pattern id={prefix+'-grid'} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" stroke="#c8d8ea" strokeWidth=".65"/></pattern><radialGradient id={prefix+'-fade'}><stop offset=".5" stopColor="white"/><stop offset="1" stopColor="black"/></radialGradient><mask id={prefix+'-mask'}><rect width="100%" height="100%" fill={'url(#'+prefix+'-fade)'}/></mask></defs>
        <rect width="100%" height="100%" fill="#f1f6fc" stroke="none" rx="16"/>
        <rect x="12" y="12" width={width-24} height={height-24} fill={'url(#'+prefix+'-grid)'} stroke="none" opacity=".7" mask={'url(#'+prefix+'-mask)'}/>
        {!mobile && <g className={s.ground}><path d="M65 474 500 260 935 474 500 580ZM160 520 595 307M255 567 690 354M840 520 405 307M745 567 310 354"/><path d="M50 474h25m-12-12v24m860-12h25m-12-12v24"/></g>}
        {kind !== 'engine' && <>
            <Route d={mobile ? 'M162 288V358' : 'M310 272H335Q350 272 350 248V223H365'} active={step >= 1}/>
            <Route d={mobile ? 'M162 618V688' : 'M635 220H650Q670 220 670 242V280H690'} active={step >= 2}/>
        </>}
        {kind === 'podcast' ? <Podcast step={step} progress={progress} mobile={mobile} en={en}/> : kind === 'relationships' ? <CRM step={step} progress={progress} mobile={mobile} en={en}/> : kind === 'development' ? <Development step={step} progress={progress} mobile={mobile} en={en}/> : <Engine mobile={mobile} en={en} appPlace={appPlace} enginePlace={enginePlace} asleep={asleep}/>}
    </svg>;
}
