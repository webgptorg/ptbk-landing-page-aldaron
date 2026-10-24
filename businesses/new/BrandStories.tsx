'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, AudioLines, Check, CheckCheck, ChevronRight, CircleCheck, Code2, GitCommitHorizontal, Headphones, Mail, MessageCircle, Moon, Play, Search, Send, ShieldCheck, Sparkles, Sun, Users, Youtube } from 'lucide-react';
import { useSiteLocale } from './LocaleProvider';
import s from './brand-stories.module.css';
import { useLocalSceneMotion } from './useLocalSceneMotion';

/** Short scenario labels keep the surrounding UI quieter than the work itself. */
const stories = {
    cs: [
        { id: 'podcast', label: 'Podcast', title: 'Od nového dílu k publikovaným příspěvkům', steps: ['Nový díl', 'Souvislosti', 'Příspěvky', 'Publikováno'], Icon: Headphones },
        { id: 'relationships', label: 'CRM', title: 'Od nové příležitosti k osobnímu oslovení', steps: ['Příležitost', 'Kontext', 'E-mail', 'Další krok'], Icon: Users },
        { id: 'development', label: 'Vývoj', title: 'Od večerního hlášení k rannímu řešení', steps: ['Hlášení', 'Oprava', 'Testy', 'Vyřešeno'], Icon: Code2 },
    ],
    en: [
        { id: 'podcast', label: 'Podcast', title: 'From a new episode to published posts', steps: ['Episode', 'Context', 'Posts', 'Published'], Icon: Headphones },
        { id: 'relationships', label: 'CRM', title: 'From a new opportunity to a personal email', steps: ['Opportunity', 'Context', 'Email', 'Follow-up'], Icon: Users },
        { id: 'development', label: 'Development', title: 'From an evening report to a morning fix', steps: ['Report', 'Fix', 'Tests', 'Resolved'], Icon: Code2 },
    ],
} as const;

/** Quiet window chrome makes the illustrations recognizable as work surfaces. */
function WindowBar({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
    return <div className={s.windowBar}><span className={s.windowDots}><i/><i/><i/></span><span>{icon}{children}</span><span className={s.windowCorner}/></div>;
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
    </div>;
}

/** One compact carousel; native page scrolling only turns the camera and advances the example. */
export function BrandStories({ partnership = false }: { partnership?: boolean }) {
    const { locale } = useSiteLocale();
    const en = locale === 'en';
    const id = useId();
    const root = useRef<HTMLElement>(null);
    const [active, setActive] = useState(0);
    const [manualStep, setManualStep] = useState<number | null>(null);
    const { step: scrollStep } = useLocalSceneMotion(root);
    const step = manualStep ?? scrollStep;
    const story = stories[locale][active];

    function select(index: number, focus = false) {
        const next = (index + stories[locale].length) % stories[locale].length;
        setActive(next);
        setManualStep(null);
        if (focus) root.current?.querySelector<HTMLButtonElement>(`[data-story-choice="${next}"]`)?.focus();
    }

    function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
        if (next !== null) { event.preventDefault(); select(next, true); }
    }

    return <section ref={root} className={s.stories} aria-label={en ? 'Work examples' : 'Ukázky práce'} aria-roledescription={en ? 'carousel' : 'karusel'} data-testid="brand-carousel" data-partnership={partnership}>
        <div className={s.carouselBar}>
            <div className={s.storyChoices} role="tablist" aria-label={en ? 'Choose an example' : 'Vyberte ukázku'}>
                {stories[locale].map(({ id: storyId, label, Icon }, index) => <button key={storyId} type="button" role="tab" id={`${id}-choice-${index}`} aria-selected={active === index} aria-controls={`${id}-panel`} tabIndex={active === index ? 0 : -1} data-story-choice={index} onClick={() => select(index)} onKeyDown={event => navigate(event, index)}><Icon size={18} strokeWidth={1.6}/><span>{label}</span></button>)}
            </div>
            <div className={s.carouselArrows}>
                <button type="button" aria-label={en ? 'Previous example' : 'Předchozí ukázka'} onClick={() => select(active - 1)}><ArrowLeft size={18}/></button>
                <button type="button" aria-label={en ? 'Next example' : 'Další ukázka'} onClick={() => select(active + 1)}><ArrowRight size={18}/></button>
            </div>
        </div>
        <article id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-choice-${active}`} tabIndex={0} className={s.story} data-story={story.id} data-step={step}>
            <h2 className={s.sceneTitle}>{story.title}</h2>
            <div className={s.scene}>
                <div className={s.sceneFloor} aria-hidden="true"/>
                <div className={s.camera}>
                    {story.id === 'podcast' ? <PodcastScene step={step}/> : story.id === 'relationships' ? <RelationshipScene step={step}/> : <DevelopmentScene step={step}/>}
                </div>
            </div>
            <div className={s.timeline} role="group" aria-label={en ? 'Scenario steps' : 'Kroky ukázky'}>
                {story.steps.map((label, index) => <button key={label} type="button" aria-pressed={step === index} onClick={() => setManualStep(index)} data-story-step={index}><span className={s.timelineDot} data-complete={step >= index}/><span>{label}</span></button>)}
            </div>
        </article>
        <div className={s.sceneFooter}><span>{en ? 'Illustrative scenarios · configured access and rules' : 'Modelové ukázky · nastavené přístupy a pravidla'}</span><span aria-live="polite">{String(active + 1).padStart(2, '0')} / 03</span></div>
    </section>;
}
