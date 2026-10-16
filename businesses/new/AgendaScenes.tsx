import { ArrowDown, ArrowRight, Check, CheckCheck, FileText, GitBranch, Heart, Mail, MessageCircle, Paperclip, ScanLine, Send, ShieldCheck } from 'lucide-react';
import type { ScenarioId } from './economics';
import s from './agenda-showcase.module.css';

type SceneProps = { stage: number };

function EmailScene({ stage }: SceneProps) {
    return <div className={`${s.scene} ${s.emailScene}`}>
        <div className={s.mailSource}>
            <div className={s.appBar}><Mail size={15} /><span>Doručené</span><span className={s.count}>3</span></div>
            <div className={s.mailSender}><span className={s.avatar}>K</span><div><strong>Klient</strong><small>Komu: vaše firma · 9:41</small></div><span className={s.unread} /></div>
            <h3>Dotaz na dodání</h3><p>Dobrý den, kdy můžeme očekávat naši objednávku?</p>
            <div className={s.mailQueue}><span>Podklady k nabídce</span><span>Změna termínu</span></div>
        </div>
        <div className={s.contextNote} data-revealed={stage >= 1} aria-hidden={stage < 1}><span className={s.eyebrow}>FIREMNÍ KONTEXT</span><div><span className={s.orderDot} /><strong>Objednávka připravena</strong></div><p>Doručení ve čtvrtek<br />Váš tón. Vaše pravidla.</p></div>
        <div className={s.mailReply} data-revealed={stage >= 2} aria-hidden={stage < 2}>
            <div className={s.appBar}><span className={s.replyIcon}><ArrowRight size={15} /></span><span>Připravená odpověď</span><span className={s.draftLabel}>Návrh</span></div>
            <div className={s.replyText}><span>Re: Dotaz na dodání</span><p>Dobrý den,<br /><br />objednávka je připravená k expedici. Doručení očekáváme <strong>ve čtvrtek.</strong> Jakmile bude na cestě, pošleme vám sledovací odkaz.</p></div>
            <div className={s.replyFooter}><ShieldCheck size={16} /><span>{stage === 3 ? 'Vyřízeno podle vašich pravidel' : 'Odeslání podle vašich pravidel'}</span>{stage === 3 ? <CheckCheck size={18} /> : <Send size={17} />}</div>
        </div>
        <div className={s.sceneFootnote}><span className={s.liveDot} />{['Nový dotaz čeká ve schránce.', 'Odpověď vychází z objednávky a vašich pravidel.', 'Odpověď je připravená. Zbývá krok podle pravidel.', 'Dotaz je vyřízený. Agenda čeká na další zprávu.'][stage]}</div>
    </div>;
}

function DocumentsScene({ stage }: SceneProps) {
    return <div className={`${s.scene} ${s.documentsScene}`}>
        <div className={s.invoiceStack}><div className={s.paperBehind} /><div className={s.invoice}>
            <div className={s.invoiceTop}><span>FAKTURA</span><FileText size={23} /></div><h3>FV-2026-0142</h3><span className={s.paperSubtitle}>Ukázkový doklad</span>
            <div className={s.invoiceParties}><div><small>DODAVATEL</small><span>Dodavatel s.r.o.</span></div><div><small>ODBĚRATEL</small><span>Vaše firma</span></div></div>
            <div className={s.invoiceRow}><span>Vystaveno</span><strong className={stage >= 1 ? s.highlight : ''}>15. 10. 2026</strong></div>
            <div className={s.invoiceRow}><span>Služby</span><strong>1×</strong></div>
            <div className={s.invoiceTotal}><span>Celkem k úhradě</span><strong className={stage >= 1 ? s.highlight : ''}>12 480 Kč</strong></div>
            <div className={s.invoiceBottom}><Paperclip size={13} /> faktura.pdf <span>1 / 1</span></div>
            {stage === 1 && <div className={s.scanLine} aria-hidden="true" />}
        </div></div>
        <div className={s.extractConnector} aria-hidden="true"><ScanLine size={25} /><ArrowRight size={20} /></div>
        <div className={s.extracted} data-revealed={stage >= 1} aria-hidden={stage < 1}>
            <span className={s.eyebrow}>Z DOKLADU DO DAT</span><h3>Všechno na<br />svém místě.</h3>
            <dl>{[['Číslo dokladu', 'FV-2026-0142'], ['Celkem', '12 480 Kč'], ['Datum vystavení', '15. 10. 2026'], ['Příloha', 'faktura.pdf']].map(([label, value], index) => <div key={label} data-extracted={stage >= 2 || index < 2}><dt>{label}</dt><dd>{stage >= 2 || index < 2 ? value : '—'}</dd></div>)}</dl>
            <div className={s.handoff} data-revealed={stage >= 2} aria-hidden={stage < 2}><span className={s.handoffIcon}>{stage === 3 ? <Check size={20} /> : <FileText size={20} />}</span><div><strong>{stage === 3 ? 'Předáno účetní' : 'Podklady připravené'}</strong><small>Údaje i originál na jednom místě</small></div></div>
            <p className={s.responsibility}>Výjimky a odborné posouzení zůstávají účetní.</p>
        </div>
    </div>;
}

function SocialScene({ stage }: SceneProps) {
    return <div className={`${s.scene} ${s.socialScene}`}>
        <div className={s.topic}><span className={s.topicLabel}>JEDNO TÉMA</span><strong>Méně rutiny. Více času.</strong><ArrowDown size={16} /></div>
        <div className={s.socialFan} data-revealed={stage >= 1} aria-hidden={stage < 1}>
            <article className={s.facebookPost}>
                <header className={s.socialHeader}><span className={s.networkMark}>f</span><div><strong>Facebook</strong><small>Pro vaši komunitu</small></div></header>
                <p>Pět drobností, které vám usnadní pracovní den. Kterou vyzkoušíte jako první?</p>
                <div className={s.facebookArtwork}><span>Malé změny.</span><strong>Velký<br />rozdíl.</strong><div className={s.orbit} aria-hidden="true" /></div>
                <div className={s.socialReactions}><Heart size={14} /><MessageCircle size={14} /><span>Začněme jedním krokem.</span></div>
                <footer>{stage === 3 ? <><Check size={14} /> Naplánováno · 9:00</> : stage === 2 ? <><ShieldCheck size={14} /> Ke schválení</> : 'Návrh příspěvku'}</footer>
            </article>
            <article className={s.instagramPost}>
                <header className={s.socialHeader}><span className={s.networkMark}>◎</span><div><strong>Instagram</strong><small>Příběh ve vizuálu</small></div></header>
                <div className={s.instagramArtwork}><span>MÉNĚ RUTINY</span><strong>Prostor<br />pro to<br /><em>důležité.</em></strong><div className={s.stackedDiscs} aria-hidden="true"><i /><i /><i /></div><small>01 / 05</small></div>
                <p>Začněte jedním malým krokem. ✨</p>
                <footer>{stage === 3 ? <><Check size={14} /> Naplánováno · 12:00</> : stage === 2 ? <><ShieldCheck size={14} /> Ke schválení</> : 'Návrh vizuálu'}</footer>
            </article>
            <article className={s.linkedinPost}>
                <header className={s.socialHeader}><span className={s.networkMark}>in</span><div><strong>LinkedIn</strong><small>Pro váš profesní svět</small></div></header>
                <div className={s.linkedinText}><span className={s.eyebrow}>PRÁCE, KTERÁ DÁVÁ SMYSL</span><h3>Rutina nemusí<br />zabrat celý den.</h3><p>Jak dát svému týmu více času na skutečnou práci.</p><div className={s.editorialRule} /><strong>5 malých změn<br />pro váš tým.</strong></div>
                <footer>{stage === 3 ? <><Check size={14} /> Naplánováno · 15:00</> : stage === 2 ? <><ShieldCheck size={14} /> Ke schválení</> : 'Návrh textu'}</footer>
            </article>
        </div>
        <div className={s.sceneFootnote}><span className={s.liveDot} />{['Téma je připravené pro tři různé formáty.', 'Každá síť má vlastní text, vizuál i tón.', 'Texty a vizuály čekají na vaše schválení.', 'Schválené příspěvky mají své místo v plánu.'][stage]}</div>
    </div>;
}

function VideoScene({ stage }: SceneProps) {
    return <div className={`${s.scene} ${s.videoScene}`}>
        <div className={s.editingDesk}>
            <div className={s.videoMonitor}><span className={s.videoLabel}>ZDROJOVÉ VIDEO</span><div className={s.videoTitle}>Jak si vrátit čas<br /><em>na důležitou práci.</em></div><div className={s.videoOrb} aria-hidden="true" /><span className={s.timecode}>00:00 <span>/ 18:42</span></span></div>
            <div className={s.timeline}><div className={s.timeRuler}><span>00:00</span><span>06:00</span><span>12:00</span><span>18:42</span></div><div className={s.waveform}>{Array.from({ length: 43 }, (_, index) => <i key={index} style={{ height: `${10 + (index * 17 % 29)}px` }} />)}<span className={s.playhead} data-started={stage >= 1} /></div></div>
            <div className={s.transcript} data-revealed={stage >= 1} aria-hidden={stage < 1}><span>02:14</span><p>„Začněte prací, která se ve firmě opakuje. Právě tam se vám čas vrátí nejdřív.“</p></div>
        </div>
        <div className={s.videoOutputs} data-revealed={stage >= 2} aria-hidden={stage < 2}>
            <article className={s.articleOutput}><span className={s.eyebrow}>ČLÁNEK NA WEB</span><h3>Pět způsobů,<br />jak omezit rutinu<br />ve firmě.</h3><p>Více prostoru pro práci, která potřebuje právě vás.</p><div className={s.articleLines} aria-hidden="true" /><span className={s.articleStatus}>{stage === 3 ? <><Check size={14} /> Připraveno k publikaci</> : 'Koncept článku'}</span></article>
            <div className={s.outputFormats}><span><FileText size={15} /> Přepis</span><span><MessageCircle size={15} /> Popis videa</span><span><Send size={15} /> Příspěvky</span></div>
        </div>
    </div>;
}

function CodingScene({ stage }: SceneProps) {
    return <div className={`${s.scene} ${s.codingScene}`}>
        <div className={s.issue}><span className={s.issueDot} /><span>Kontaktní formulář</span><strong>{stage === 0 ? 'Chybí potvrzení' : stage === 3 ? 'Změna připravena' : 'Oprava v průběhu'}</strong></div>
        <div className={s.codeWindow}>
            <div className={s.codeToolbar}><span className={s.windowDots}><i /><i /><i /></span><span>contact-form.ts</span><GitBranch size={14} /></div>
            <pre><span>{'  async function submitForm() {'}</span>{'\n'}<del>{'−   send(form.email);'}</del>{'\n'}{stage >= 1 ? <><ins>{'+   validate(form);'}</ins>{'\n'}<ins>{'+   await send(form.email);'}</ins>{'\n'}<ins>{'+   showConfirmation();'}</ins></> : <span className={s.codeComment}>{'    // Chybí potvrzení odeslání\n\n'}</span>}{'\n'}<span>{'  }'}</span></pre>
            <div className={s.testRun} data-revealed={stage >= 2} aria-hidden={stage < 2}><span><Check size={14} /> Validace e-mailu</span><span><Check size={14} /> Odeslání formuláře</span><span><Check size={14} /> Potvrzení uživateli</span></div>
            <div className={s.codeFooter}><GitBranch size={13} /> oprava-formulare <span>{stage >= 2 ? '3 testy prošly' : 'Údržbový úkol'}</span></div>
        </div>
        <div className={s.browserPreview}>
            <div className={s.browserBar}><span className={s.windowDots}><i /><i /><i /></span><span>váš-web.cz / kontakt</span></div>
            <div className={s.browserContent}><span className={s.eyebrow}>VAŠE FIRMA</span><h3>Jsme tu<br />pro vás.</h3><span className={s.inputLabel}>Váš e-mail</span><div className={s.fakeInput}>jmeno@firma.cz</div><div className={stage >= 3 ? s.formSuccess : s.formPending}>{stage >= 3 ? <><Check size={17} /> Zpráva byla přijata</> : <>Odeslat zprávu <ArrowRight size={16} /></>}</div></div>
            <div className={s.browserFooter}>{stage >= 3 ? <><Check size={14} /> Náhled opraveného formuláře</> : 'Náhled kontaktního formuláře'}</div>
        </div>
        <div className={s.sceneFootnote}><span className={s.liveDot} />{['Úkol: doplnit potvrzení odeslané zprávy.', 'Úprava kódu doplňuje validaci i potvrzení.', 'Automatické testy ověřují upravený formulář.', 'Ověřená změna je připravena k nasazení.'][stage]}</div>
    </div>;
}

export function AgendaScene({ scenario, stage }: SceneProps & { scenario: ScenarioId }) {
    switch (scenario) {
        case 'email': return <EmailScene stage={stage} />;
        case 'documents': return <DocumentsScene stage={stage} />;
        case 'social': return <SocialScene stage={stage} />;
        case 'video': return <VideoScene stage={stage} />;
        case 'coding': return <CodingScene stage={stage} />;
    }
}
