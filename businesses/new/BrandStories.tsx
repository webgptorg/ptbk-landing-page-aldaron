'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, AudioLines, Check, CheckCheck, ChevronRight, CircleCheck, Code2, GitCommitHorizontal, Headphones, Mail, MessageCircle, Moon, Play, Search, Send, ShieldCheck, Sparkles, Sun, Users, Youtube } from 'lucide-react';
import { useSiteLocale } from './LocaleProvider';
import s from './brand-stories.module.css';

/** Author-owned, fictional narratives illustrating work within configured permissions. */
const stories = {
    cs: [
        { id: 'podcast', number: '01', eyebrow: 'Obsah, který nezůstane v šuplíku', title: 'Díl je venku.\nA příběh pokračuje.', description: 'Vydáte AI ta Krajta. Vaše agenda si díl poslechne, najde to podstatné a postará se, aby se dostal k lidem.', steps: ['Nový díl', 'Porozumění', 'Vlastní texty', 'Publikováno'], captions: ['Nový díl odstartuje práci. Bez dalšího zadání.', 'Agent zpracuje obsah, souvislosti i zmíněné lidi.', 'Každý kanál dostane svůj text a správný kontext.', 'YouTube, osobní sítě i skupiny. Podle vašich pravidel.'], outcome: 'Vy tvoříte. Propagace má svou agendu.' },
        { id: 'relationships', number: '02', eyebrow: 'Správný důvod ozvat se', title: 'Vztah pokračuje.\nI mezi schůzkami.', description: 'Nová pobočka, minulý rozhovor a dobrá příležitost navázat. Vaše agenda spojí souvislosti a napíše osobně.', steps: ['Příležitost', 'Souvislosti', 'Osobní zpráva', 'Další krok'], captions: ['V CRM je kontakt. Nová událost mu dá aktuální význam.', 'Agenda se vrátí k tomu, co jste spolu skutečně řešili.', 'Konkrétní e-mail naváže na rozhovor, ne na šablonu.', 'Odeslání i následná péče se řídí vaším mandátem.'], outcome: 'Méně zapomenutých kontaktů. Více návaznosti.' },
        { id: 'development', number: '03', eyebrow: 'Klidnější ráno vývojáře', title: 'Večer přišel problém.\nRáno už řešení.', description: 'Hlášení dorazí, když máte jiný program. Agent najde příčinu, opraví kód, ověří změnu a podle pravidel ji nasadí.', steps: ['Hlášení', 'Oprava', 'Ověření', 'Dobré ráno'], captions: ['22:14. Přichází zpráva o nefunkčním formuláři.', 'Agent dohledá příčinu a připraví konkrétní změnu.', 'Testy ověří opravu. Historie zachová její kontext.', '07:30. Otevřete zprávu: opraveno, ověřeno, nasazeno.'], outcome: 'Práce pokračovala. Vy jste mohli vypnout.' },
    ],
    en: [
        { id: 'podcast', number: '01', eyebrow: 'Content that reaches people', title: 'The episode is out.\nThe story keeps going.', description: 'You publish AI ta Krajta. Your agenda listens, finds what matters and helps the episode reach its audience.', steps: ['New episode', 'Understanding', 'Original posts', 'Published'], captions: ['A new episode sets work in motion. No new assignment needed.', 'The agent processes the ideas, context and people mentioned.', 'Each channel gets its own message and the right context.', 'YouTube, personal networks and groups. Following your rules.'], outcome: 'You create. Promotion has an agenda of its own.' },
        { id: 'relationships', number: '02', eyebrow: 'A good reason to reconnect', title: 'Relationships grow.\nBetween meetings, too.', description: 'A new branch, an earlier conversation and a reason to reconnect. Your agenda joins the dots and writes personally.', steps: ['Opportunity', 'Context', 'Personal email', 'Next step'], captions: ['A contact is in your CRM. A new event makes it relevant today.', 'The agenda revisits what you actually discussed together.', 'A specific email continues a conversation, not a template.', 'Sending and follow-up stay within the authority you set.'], outcome: 'Fewer forgotten contacts. More follow-through.' },
        { id: 'development', number: '03', eyebrow: 'A calmer morning for developers', title: 'An issue at night.\nA solution by morning.', description: 'A report arrives while you are away. An agent finds the cause, fixes the code, checks the change and deploys within your rules.', steps: ['Issue report', 'Fix', 'Verification', 'Good morning'], captions: ['22:14. An email reports a broken contact form.', 'The agent traces the cause and prepares a precise change.', 'Tests verify the fix. History preserves its context.', '07:30. Your inbox says: fixed, checked, deployed.'], outcome: 'The work continued. You could switch off.' },
    ],
} as const;

/** A single localized narrative, kept independent of its animation state. */
type Story = (typeof stories)['cs'][number] | (typeof stories)['en'][number];

/** Four manual steps remain available when motion or viewport constraints disable scroll effects. */
function StoryFrame({ story, children }: { story: Story; children: (step: number) => ReactNode }) {
    const { locale } = useSiteLocale();
    const english = locale === 'en';
    const id = useId();
    const root = useRef<HTMLElement>(null);
    const [step, setStep] = useState(3);
    const [scrolling, setScrolling] = useState(false);
    const [manual, setManual] = useState(false);

    useEffect(() => {
        const allowed = window.matchMedia('(min-width: 1000px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)');
        const update = () => { setScrolling(allowed.matches); if (!allowed.matches) setStep(3); };
        update();
        allowed.addEventListener('change', update);
        return () => allowed.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        if (!scrolling || manual) return;
        let frame = 0;
        const measure = () => {
            frame = 0;
            const element = root.current;
            if (!element) return;
            const rect = element.getBoundingClientRect();
            const travel = Math.max(1, rect.height - Math.min(window.innerHeight - 96, 720));
            const progress = Math.min(1, Math.max(0, (104 - rect.top) / travel));
            element.style.setProperty('--story-progress', String(progress));
            setStep(Math.min(3, Math.floor(progress * 4)));
        };
        const request = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
        measure();
        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', request);
        return () => { window.removeEventListener('scroll', request); window.removeEventListener('resize', request); window.cancelAnimationFrame(frame); };
    }, [manual, scrolling]);

    /** Native tab keyboard behavior; deliberate inspection stops scroll from changing the chosen step. */
    function selectStep(index: number, keyboard?: KeyboardEvent<HTMLButtonElement>) {
        setManual(true);
        setStep(index);
        if (keyboard) root.current?.querySelector<HTMLButtonElement>(`[data-story-step="${index}"]`)?.focus();
    }

    /** Arrow keys move between steps without moving the page. */
    function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        const next = event.key === 'ArrowRight' ? (index + 1) % 4 : event.key === 'ArrowLeft' ? (index + 3) % 4 : event.key === 'Home' ? 0 : event.key === 'End' ? 3 : null;
        if (next !== null) { event.preventDefault(); selectStep(next, event); }
    }

    return <article ref={root} className={s.story} data-scroll={scrolling} data-story={story.id} data-step={step} id={`story-${story.id}`}>
        <div className={s.sticky}>
            <div className={s.storyCopy}>
                <span className={s.eyebrow}><span>{story.number}</span>{story.eyebrow}</span>
                <h3>{story.title.split('\n').map((line, index) => <span key={line} className={index ? s.softLine : undefined}>{line}</span>)}</h3>
                <p>{story.description}</p>
                <div className={s.caption} aria-live={manual ? 'polite' : 'off'}><span className={s.captionMark} /><p key={step}>{story.captions[step]}</p></div>
                <p className={s.outcome}>{story.outcome}</p>
            </div>
            <div className={s.storyWork}>
                <div className={s.steps} role="tablist" aria-label={`${english ? 'Steps' : 'Kroky'}: ${story.title.replace('\n', ' ')}`}>
                    {story.steps.map((label, index) => <button type="button" role="tab" id={`${id}-step-${index}`} aria-controls={`${id}-scene`} aria-selected={step === index} tabIndex={step === index ? 0 : -1} data-story-step={index} key={label} onClick={() => selectStep(index)} onKeyDown={event => navigate(event, index)}><span>{label}</span></button>)}
                </div>
                <div id={`${id}-scene`} className={s.scene} role="tabpanel" aria-labelledby={`${id}-step-${step}`} tabIndex={0}>{children(step)}</div>
                <div className={s.sceneFooter}><span>{english ? 'Illustrative scenario · configured access and rules' : 'Modelová ukázka · nastavené přístupy a pravidla'}</span>{scrolling ? manual ? <button type="button" onClick={() => setManual(false)}>{english ? 'Follow scroll' : 'Pokračovat scrollováním'}<ArrowDown size={13}/></button> : <span className={s.scrollHint}><ArrowDown size={13}/>{english ? 'Scroll to continue' : 'Pokračujte scrollováním'}</span> : <span>{english ? 'Explore the steps above' : 'Projděte si kroky nahoře'}</span>}</div>
            </div>
        </div>
    </article>;
}

/** Quiet window chrome makes the illustrations recognizable as work surfaces. */
function WindowBar({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
    return <div className={s.windowBar}><span className={s.windowDots}><i/><i/><i/></span><span>{icon}{children}</span><span className={s.windowCorner}/></div>;
}

/** An autonomous processing card connects the input with its result. */
function Processing({ label, complete = false, children }: { label: string; complete?: boolean; children: ReactNode }) {
    return <div className={s.processing} data-complete={complete}><span className={s.agentMark}>{complete ? <Check size={19}/> : <Sparkles size={19}/>}</span><div><strong>{label}</strong><span>{children}</span></div><div className={s.processingDots} aria-hidden="true"><i/><i/><i/></div></div>;
}

/** Podcast material unfolds into channel-specific text and published distribution. */
function PodcastScene({ step }: { step: number }) {
    const { locale } = useSiteLocale();
    const en = locale === 'en';
    return <div className={`${s.stage} ${s.podcastStage}`} data-phase={step}>
        <div className={`${s.surface} ${s.episode}`}>
            <WindowBar icon={<Headphones size={13}/>}>{en ? 'New episode' : 'Nový díl'}</WindowBar>
            <div className={s.podcastCover}><span className={s.podcastLabel}>AI ta Krajta</span><AudioLines size={70} strokeWidth={1}/><h4>{en ? 'What can AI\ntake off your plate?' : 'Co už AI\nzvládne za vás?'}</h4><div className={s.coverPeople}><span>PH</span><span>PG</span><span>ŠP</span><small>{en ? 'Ideas worth sharing' : 'Myšlenky, které stojí za sdílení'}</small></div></div>
            <div className={s.player}><span><Play size={15} fill="currentColor"/></span><div className={s.waveform} aria-hidden="true">{[12,20,30,16,25,38,24,14,30,40,23,32,17,28,39,20,12,26,35,19,28,14,24,33,20,30,16,23].map((height,index)=><i key={index} style={{height}}/>)}</div><small>{en ? 'Published' : 'Zveřejněno'}</small></div>
        </div>
        <div className={`${s.surface} ${s.transcript}`} data-visible={step === 1} aria-hidden={step !== 1}>
            <div className={s.documentEyebrow}><AudioLines size={15}/>{en ? 'Listening in context' : 'Poslouchá v kontextu'}</div>
            <h4>{en ? 'From one conversation,\nseveral good ideas.' : 'Z jednoho rozhovoru\nněkolik dobrých myšlenek.'}</h4>
            <p><span>08:24</span>{en ? '“An agent needs a lasting goal…”' : '„Agent potřebuje dlouhodobý cíl…“'}</p>
            <p><span>17:06</span>{en ? '“Keep the context in your own hands.”' : '„Kontext si nechte ve vlastních rukou.“'}</p>
            <div className={s.tags}><span>{en ? 'Autonomous work' : 'Samostatná práce'}</span><span>{en ? 'Your data' : 'Vlastní data'}</span></div>
        </div>
        <div className={`${s.surface} ${s.socialPost}`} data-visible={step >= 2} aria-hidden={step < 2}>
            <div className={s.socialAuthor}><span className={s.avatar}>PH</span><div><strong>Pavol Hejný</strong><small>{en ? 'Personal network' : 'Osobní síť'} · {step === 3 ? (en ? 'Published' : 'Publikováno') : (en ? 'Draft' : 'Návrh')}</small></div><span className={s.networkMark}>in</span></div>
            <p>{en ? 'What changes when you give AI responsibility for ongoing work? We explored it with ' : 'Co se změní, když AI svěříte celou agendu? V novém dílu jsme to probrali s '}<b>{en ? 'Petr Glaser and Šimon Podhajský.' : 'Petrem Glaserem a Šimonem Podhajským.'}</b></p>
            <p>{en ? 'One idea stayed with me: your context should outlive the model you use.' : 'Jedna myšlenka mi utkvěla: váš kontext má přežít model, který právě používáte.'}</p>
            <div className={s.postLink}><AudioLines size={22}/><span>AI ta Krajta<small>{en ? 'Listen to the conversation' : 'Poslechněte si celý rozhovor'}</small></span><ArrowRight size={16}/></div>
            <div className={s.postActions}><MessageCircle size={15}/><span>{en ? 'Context for this community' : 'Kontext pro toto publikum'}</span>{step === 3 && <CheckCheck size={18}/>}</div>
        </div>
        <div className={`${s.surface} ${s.youtubeComment}`} data-visible={step === 3} aria-hidden={step !== 3}>
            <div><Youtube size={15}/><strong>{en ? 'A comment under the episode' : 'Komentář pod dílem'}</strong><CheckCheck size={14}/></div>
            <p>{en ? '08:24 — what an agent needs to work on its own. What would you hand over first?' : '08:24 — co agent potřebuje, aby mohl pracovat sám. Jakou agendu byste mu svěřili jako první?'}</p>
        </div>
        <div className={s.distribution} data-visible={step === 3} aria-hidden={step !== 3}><span><Youtube size={16}/>YouTube<Check size={13}/></span><span><Users size={16}/>{en ? 'Groups' : 'Skupiny'}<Check size={13}/></span><span><MessageCircle size={16}/>{en ? 'Personal networks' : 'Osobní sítě'}<Check size={13}/></span></div>
        <div className={s.podcastProcessing}><Processing label={step === 0 ? (en ? 'New episode detected' : 'Nový díl zachycen') : step === 1 ? (en ? 'Finding ideas and connections' : 'Hledá myšlenky a souvislosti') : step === 2 ? (en ? 'Writing for each audience' : 'Píše pro každé publikum') : (en ? 'Promotion taken care of' : 'Propagace vyřízena')} complete={step === 3}>{step === 3 ? (en ? 'The agenda continues with the next episode.' : 'Agenda pokračuje s dalším dílem.') : (en ? 'Your voice. Your publishing rules.' : 'Váš hlas. Vaše publikační pravidla.')}</Processing></div>
    </div>;
}

/** Original CRM art and an email familiar in structure, with genuinely contextual sample copy. */
function RelationshipScene({ step }: { step: number }) {
    const { locale } = useSiteLocale();
    const en = locale === 'en';
    return <div className={`${s.stage} ${s.crmStage}`} data-phase={step}>
        <div className={`${s.surface} ${s.crm}`}>
            <WindowBar>{en ? 'Relationships' : 'Vztahy'}</WindowBar>
            <div className={s.crmBody}><aside><div className={s.crmBrand}>R<span>•</span></div><Users size={18}/><Mail size={18}/><CircleCheck size={18}/></aside><div className={s.crmContent}>
                <div className={s.crmTitle}><h4>{en ? 'Your contacts' : 'Vaše kontakty'}</h4><Search size={15}/></div>
                <div className={s.contactRow}><span className={s.avatar}>JN</span><div><strong>Jana Nováková</strong><small>Studio North</small></div><span className={s.contactDot}/></div>
                <div className={s.contactRow}><span className={s.avatarMuted}>MK</span><div><strong>Martin Král</strong><small>{en ? 'Waiting for a reply' : 'Čekáme na odpověď'}</small></div></div>
                <div className={s.contactRow}><span className={s.avatarMuted}>LB</span><div><strong>Lucie Benešová</strong><small>{en ? 'Meeting next week' : 'Schůzka příští týden'}</small></div></div>
                <div className={s.opportunity}><span className={s.newDot}/><div><strong>{en ? 'A new branch in Brno' : 'Nová pobočka v Brně'}</strong><p>{en ? 'Studio North is expanding its team.' : 'Studio North rozšiřuje svůj tým.'}</p></div><ArrowRight size={16}/></div>
            </div></div>
        </div>
        <div className={`${s.surface} ${s.contextNote}`} data-visible={step === 1} aria-hidden={step !== 1}><span className={s.documentEyebrow}><MessageCircle size={14}/>{en ? 'Your earlier conversation' : 'Váš předchozí rozhovor'}</span><h4>{en ? '“Let’s revisit this\nwhen we grow.”' : '„Vraťme se k tomu,\naž budeme růst.“'}</h4><p>{en ? 'Jana mentioned that requests from the new branch would need to reach the right person.' : 'Jana zmiňovala, že dotazy z nové pobočky budou potřebovat směrovat ke správnému člověku.'}</p><div className={s.noteFooter}><span>14. 9.</span><span><Check size={13}/>{en ? 'Relevant context found' : 'Souvislost nalezena'}</span></div></div>
        <div className={`${s.surface} ${s.personalEmail}`} data-visible={step >= 2} aria-hidden={step < 2}>
            <div className={s.emailTop}><span className={s.mailLogo}><Mail size={21}/></span><span>{step === 3 ? (en ? 'Sent' : 'Odeslané') : (en ? 'New message' : 'Nová zpráva')}</span><span>− &nbsp; ×</span></div>
            <div className={s.emailField}><small>{en ? 'To' : 'Komu'}</small><span>Jana Nováková</span></div>
            <div className={s.emailField}><strong>{en ? 'Congratulations on the Brno branch' : 'Gratulace k pobočce v Brně'}</strong></div>
            <div className={s.emailBody}><p>{en ? 'Hello Jana,' : 'Dobrý den, Jano,'}</p><p>{en ? 'congratulations on opening in Brno. In September, we discussed routing customer requests as your team grows.' : 'gratuluji k otevření pobočky v Brně. V září jsme spolu řešili, jak při rozšíření týmu směrovat dotazy zákazníků.'}</p><p>{en ? 'Would it be useful to revisit that now? I could prepare a simple proposal for both branches.' : 'Dávalo by smysl se k tomu teď vrátit? Můžu připravit jednoduchý návrh pro obě pobočky.'}</p><p>{en ? 'Have a good day,\nPavel' : 'Přeji hezký den,\nPavel'}</p></div>
            <div className={s.emailBottom}><span className={s.sendPill}>{step === 3 ? <CheckCheck size={15}/> : <Send size={15}/>} {step === 3 ? (en ? 'Sent within your rules' : 'Odesláno podle pravidel') : (en ? 'Ready in your voice' : 'Připraveno vaším hlasem')}</span><span className={s.emailAccount}>P</span></div>
        </div>
        <div className={s.followup} data-visible={step === 3} aria-hidden={step !== 3}><CircleCheck size={19}/><div><strong>{en ? 'The next step is in your CRM' : 'Další krok je v CRM'}</strong><span>{en ? 'Conversation saved · follow-up scheduled' : 'Komunikace uložena · návaznost naplánována'}</span></div></div>
        <div className={s.crmProcessing}><Processing label={step === 0 ? (en ? 'A reason to reconnect' : 'Důvod znovu se ozvat') : step === 1 ? (en ? 'Connecting the context' : 'Spojuje souvislosti') : step === 2 ? (en ? 'A conversation, continued' : 'Pokračování rozhovoru') : (en ? 'Relationship kept moving' : 'Vztah se posunul dál')} complete={step === 3}>{en ? 'A specific person. A specific reason.' : 'Konkrétní člověk. Konkrétní důvod.'}</Processing></div>
    </div>;
}

/** A night-to-morning incident follows code, checks and the resulting communication. */
function DevelopmentScene({ step }: { step: number }) {
    const { locale } = useSiteLocale();
    const en = locale === 'en';
    return <div className={`${s.stage} ${s.developmentStage}`} data-phase={step}>
        <div className={s.timeOfDay}>{step === 3 ? <Sun size={20}/> : <Moon size={18}/>}<strong>{step === 3 ? '07:30' : step === 2 ? '22:26' : step === 1 ? '22:18' : '22:14'}</strong><span>{step === 3 ? (en ? 'A good morning.' : 'Dobré ráno.') : (en ? 'You are off the clock.' : 'Vy už máte volno.')}</span></div>
        <div className={`${s.surface} ${s.incidentMail}`} data-visible={step === 0 || step === 3} aria-hidden={step !== 0 && step !== 3}>
            <WindowBar icon={<Mail size={13}/>}>{en ? 'Inbox' : 'Doručené'}</WindowBar>
            <div className={s.incidentBody}><span className={step === 3 ? s.resolvedLabel : s.incidentLabel}>{step === 3 ? <Check size={13}/> : <span/>}{step === 3 ? (en ? 'Resolved' : 'Vyřešeno') : (en ? 'Needs attention' : 'Potřebuje vyřešit')}</span><h4>{step === 3 ? (en ? 'The form works again.' : 'Formulář už funguje.') : (en ? 'Customers cannot send requests' : 'Zákazníci nemohou odeslat poptávku')}</h4><div className={s.incidentSender}><span className={s.avatar}>{step === 3 ? <Sparkles size={17}/> : 'K'}</span><div><strong>{step === 3 ? 'Promptbook' : (en ? 'Client' : 'Klient')}</strong><small>{step === 3 ? '22:28' : '22:14'}</small></div></div><p>{step === 3 ? (en ? 'I found the validation error and fixed it. Checks passed and the approved deployment completed. The change is recorded in Git.' : 'Našel jsem chybu ve validaci a opravil ji. Kontroly prošly a povolené nasazení je hotové. Změna je zaznamenaná v Gitu.') : (en ? 'Hi, the contact form returns an error after sending. Could you take a look? We have a campaign running tomorrow morning.' : 'Dobrý večer, kontaktní formulář po odeslání vrací chybu. Můžete se na to podívat? Zítra ráno nám běží kampaň.')}</p>{step === 3 && <div className={s.resolutionChecks}><span><Check size={14}/>{en ? 'Fixed' : 'Opraveno'}</span><span><Check size={14}/>{en ? 'Verified' : 'Ověřeno'}</span><span><Check size={14}/>{en ? 'Deployed' : 'Nasazeno'}</span></div>}</div>
        </div>
        <div className={`${s.surface} ${s.codeEditor}`} data-visible={step === 1 || step === 2} aria-hidden={step !== 1 && step !== 2}>
            <WindowBar icon={<Code2 size={14}/>}>contact-form.ts</WindowBar>
            <div className={s.codeBreadcrumb}>src <ChevronRight size={12}/> forms <ChevronRight size={12}/> contact-form.ts</div>
            <div className={s.codeLines}><span><i>18</i><code><b>const</b> email = input.email.trim();</code></span><span className={s.removedLine}><i>19</i><code>− validate(input.email);</code></span><span className={s.addedLine}><i>19</i><code>+ validate(email);</code></span><span><i>20</i><code><b>await</b> saveRequest(&#123; ...input, email &#125;);</code></span><span><i>21</i><code><b>return</b> &#123; success: true &#125;;</code></span></div>
            <div className={s.codeCommit}><GitCommitHorizontal size={17}/><span>{en ? 'Normalize email before validation' : 'Normalizace e-mailu před validací'}</span><code>+1 −1</code></div>
        </div>
        <div className={`${s.surface} ${s.testRun}`} data-visible={step === 2} aria-hidden={step !== 2}><span className={s.documentEyebrow}><ShieldCheck size={16}/>{en ? 'Verification' : 'Ověření'}</span><h4>{en ? 'The fix holds up.' : 'Oprava obstála.'}</h4>{[en ? 'Input validation' : 'Validace vstupu', en ? 'Form submission' : 'Odeslání formuláře', en ? 'Production build' : 'Produkční build'].map(label=><div key={label}><Check size={15}/><span>{label}</span></div>)}<p>{en ? 'Deployment allowed by project rules' : 'Nasazení povoleno pravidly projektu'}</p></div>
        <div className={s.gitReceipt} data-visible={step === 3} aria-hidden={step !== 3}><GitCommitHorizontal size={17}/><span>{en ? 'One change. A clear history.' : 'Jedna změna. Jasná historie.'}</span></div>
        <div className={s.developmentProcessing}><Processing label={step === 0 ? (en ? 'The agent picks up the issue' : 'Agent přebírá problém') : step === 1 ? (en ? 'A precise fix' : 'Konkrétní oprava') : step === 2 ? (en ? 'Checks before deployment' : 'Kontrola před nasazením') : (en ? 'Ready before you are' : 'Hotovo dřív, než vstanete')} complete={step === 3}>{en ? 'Your repository. Your release rules.' : 'Váš repozitář. Vaše pravidla nasazování.'}</Processing></div>
    </div>;
}

/** Three linked work narratives share the same visual language on product and partner pages. */
export function BrandStories({ partnership = false }: { partnership?: boolean }) {
    const { locale } = useSiteLocale();
    const en = locale === 'en';
    return <section className={s.stories} aria-labelledby="brand-stories-title">
        <div className={s.sectionIntro}><div><span className={s.sectionKicker}>{en ? 'An agenda keeps going' : 'Agenda, která pokračuje'}</span><h2 id="brand-stories-title">{partnership ? (en ? 'What you can take care of\nfor your clients.' : 'Co můžete převzít\nza své klienty.') : (en ? 'One responsibility.\nA thousand fewer reminders.' : 'Jedna svěřená agenda.\nO tisíc připomínek méně.')}</h2></div><p>{en ? 'Give your agents a goal, context and rules. They find the next useful step and keep the work moving.' : 'Dejte agentům cíl, kontext a pravidla. Sami hledají další smysluplný krok a posouvají práci dál.'}</p></div>
        <a className={s.skipStories} href="#after-brand-stories">{en ? 'Skip the stories' : 'Přeskočit příběhy'}<ArrowDown size={14}/></a>
        {stories[locale].map(story=><StoryFrame key={story.id} story={story}>{step=>story.id === 'podcast' ? <PodcastScene step={step}/> : story.id === 'relationships' ? <RelationshipScene step={step}/> : <DevelopmentScene step={step}/>}</StoryFrame>)}
        <span id="after-brand-stories" className={s.afterStories}/>
    </section>;
}
