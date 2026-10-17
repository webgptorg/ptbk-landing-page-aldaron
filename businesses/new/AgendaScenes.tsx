'use client';

import { useSiteLocale } from './LocaleProvider';
import { ArrowDown, ArrowRight, Check, CheckCheck, FileText, GitBranch, Heart, Mail, MessageCircle, Paperclip, ScanLine, Send, ShieldCheck } from 'lucide-react';
import type { ScenarioId } from './economics';
import s from './agenda-showcase.module.css';

type SceneProps = { stage: number };

function EmailScene({ stage }: SceneProps) {
    const { t, locale, path } = useSiteLocale();

    return <div className={`${s.scene} ${s.emailScene}`}>
        <div className={s.mailSource}>
            <div className={s.appBar}><Mail size={15} /><span>{t("Doručené")}</span><span className={s.count}>{t("3")}</span></div>
            <div className={s.mailSender}><span className={s.avatar}>{t("K")}</span><div><strong>{t("Klient")}</strong><small>{t("Komu: vaše firma · 9:41")}</small></div><span className={s.unread} /></div>
            <h3>{t("Dotaz na dodání")}</h3><p>{t("Dobrý den, kdy můžeme očekávat naši objednávku?")}</p>
            <div className={s.mailQueue}><span>{t("Podklady k nabídce")}</span><span>{t("Změna termínu")}</span></div>
        </div>
        <div className={s.contextNote} data-revealed={stage >= 1} aria-hidden={stage < 1}><span className={s.eyebrow}>{t("FIREMNÍ KONTEXT")}</span><div><span className={s.orderDot} /><strong>{t("Objednávka připravena")}</strong></div><p>{t("Doručení ve čtvrtek")}<br />{t("Váš tón. Vaše pravidla.")}</p></div>
        <div className={s.mailReply} data-revealed={stage >= 2} aria-hidden={stage < 2}>
            <div className={s.appBar}><span className={s.replyIcon}><ArrowRight size={15} /></span><span>{t("Připravená odpověď")}</span><span className={s.draftLabel}>{t("Návrh")}</span></div>
            <div className={s.replyText}><span>{t("Re: Dotaz na dodání")}</span><p>{t("Dobrý den,")}<br /><br />{t("objednávka je připravená k expedici. Doručení očekáváme ")}<strong>{t("ve čtvrtek.")}</strong>{t(" Jakmile bude na cestě, pošleme vám sledovací odkaz.")}</p></div>
            <div className={s.replyFooter}><ShieldCheck size={16} /><span>{t(stage === 3 ? 'Vyřízeno podle vašich pravidel' : 'Odeslání podle vašich pravidel')}</span>{stage === 3 ? <CheckCheck size={18} /> : <Send size={17} />}</div>
        </div>
        <div className={s.sceneFootnote}><span className={s.liveDot} />{t(['Nový dotaz čeká ve schránce.', 'Odpověď vychází z objednávky a vašich pravidel.', 'Odpověď je připravená. Zbývá krok podle pravidel.', 'Dotaz je vyřízený. Agenda čeká na další zprávu.'][stage])}</div>
    </div>;
}

function DocumentsScene({ stage }: SceneProps) {
    const { t, locale, path } = useSiteLocale();

    return <div className={`${s.scene} ${s.documentsScene}`}>
        <div className={s.invoiceStack}><div className={s.paperBehind} /><div className={s.invoice}>
            <div className={s.invoiceTop}><span>{t("FAKTURA")}</span><FileText size={23} /></div><h3>{t("FV-2026-0142")}</h3><span className={s.paperSubtitle}>{t("Ukázkový doklad")}</span>
            <div className={s.invoiceParties}><div><small>{t("DODAVATEL")}</small><span>{t("Dodavatel s.r.o.")}</span></div><div><small>{t("ODBĚRATEL")}</small><span>{t("Vaše firma")}</span></div></div>
            <div className={s.invoiceRow}><span>{t("Vystaveno")}</span><strong className={stage >= 1 ? s.highlight : ''}>{t("15. 10. 2026")}</strong></div>
            <div className={s.invoiceRow}><span>{t("Služby")}</span><strong>{t("1×")}</strong></div>
            <div className={s.invoiceTotal}><span>{t("Celkem k úhradě")}</span><strong className={stage >= 1 ? s.highlight : ''}>{t("12 480 Kč")}</strong></div>
            <div className={s.invoiceBottom}><Paperclip size={13} />{t(" faktura.pdf ")}<span>{t("1 / 1")}</span></div>
            {stage === 1 && <div className={s.scanLine} aria-hidden="true" />}
        </div></div>
        <div className={s.extractConnector} aria-hidden="true"><ScanLine size={25} /><ArrowRight size={20} /></div>
        <div className={s.extracted} data-revealed={stage >= 1} aria-hidden={stage < 1}>
            <span className={s.eyebrow}>{t("Z DOKLADU DO DAT")}</span><h3>{t("Všechno na")}<br />{t("svém místě.")}</h3>
            <dl>{[['Číslo dokladu', 'FV-2026-0142'], ['Celkem', '12 480 Kč'], ['Datum vystavení', '15. 10. 2026'], ['Příloha', 'faktura.pdf']].map(([label, value], index) => <div key={label} data-extracted={stage >= 2 || index < 2}><dt>{t(label)}</dt><dd>{t(stage >= 2 || index < 2 ? value : '—')}</dd></div>)}</dl>
            <div className={s.handoff} data-revealed={stage >= 2} aria-hidden={stage < 2}><span className={s.handoffIcon}>{stage === 3 ? <Check size={20} /> : <FileText size={20} />}</span><div><strong>{t(stage === 3 ? 'Předáno účetní' : 'Podklady připravené')}</strong><small>{t("Údaje i originál na jednom místě")}</small></div></div>
            <p className={s.responsibility}>{t("Výjimky a odborné posouzení zůstávají účetní.")}</p>
        </div>
    </div>;
}

function SocialScene({ stage }: SceneProps) {
    const { t, locale, path } = useSiteLocale();

    return <div className={`${s.scene} ${s.socialScene}`}>
        <div className={s.topic}><span className={s.topicLabel}>{t("JEDNO TÉMA")}</span><strong>{t("Méně rutiny. Více času.")}</strong><ArrowDown size={16} /></div>
        <div className={s.socialFan} data-revealed={stage >= 1} aria-hidden={stage < 1}>
            <article className={s.facebookPost}>
                <header className={s.socialHeader}><span className={s.networkMark}>{t("f")}</span><div><strong>{t("Facebook")}</strong><small>{t("Pro vaši komunitu")}</small></div></header>
                <p>{t("Pět drobností, které vám usnadní pracovní den. Kterou vyzkoušíte jako první?")}</p>
                <div className={s.facebookArtwork}><span>{t("Malé změny.")}</span><strong>{t("Velký")}<br />{t("rozdíl.")}</strong><div className={s.orbit} aria-hidden="true" /></div>
                <div className={s.socialReactions}><Heart size={14} /><MessageCircle size={14} /><span>{t("Začněme jedním krokem.")}</span></div>
                <footer>{stage === 3 ? <><Check size={14} />{t(" Naplánováno · 9:00")}</> : stage === 2 ? <><ShieldCheck size={14} />{t(" Ke schválení")}</> : 'Návrh příspěvku'}</footer>
            </article>
            <article className={s.instagramPost}>
                <header className={s.socialHeader}><span className={s.networkMark}>{t("◎")}</span><div><strong>{t("Instagram")}</strong><small>{t("Příběh ve vizuálu")}</small></div></header>
                <div className={s.instagramArtwork}><span>{t("MÉNĚ RUTINY")}</span><strong>{t("Prostor")}<br />{t("pro to")}<br /><em>{t("důležité.")}</em></strong><div className={s.stackedDiscs} aria-hidden="true"><i /><i /><i /></div><small>{t("01 / 05")}</small></div>
                <p>{t("Začněte jedním malým krokem. ✨")}</p>
                <footer>{stage === 3 ? <><Check size={14} />{t(" Naplánováno · 12:00")}</> : stage === 2 ? <><ShieldCheck size={14} />{t(" Ke schválení")}</> : 'Návrh vizuálu'}</footer>
            </article>
            <article className={s.linkedinPost}>
                <header className={s.socialHeader}><span className={s.networkMark}>{t("in")}</span><div><strong>{t("LinkedIn")}</strong><small>{t("Pro váš profesní svět")}</small></div></header>
                <div className={s.linkedinText}><span className={s.eyebrow}>{t("PRÁCE, KTERÁ DÁVÁ SMYSL")}</span><h3>{t("Rutina nemusí")}<br />{t("zabrat celý den.")}</h3><p>{t("Jak dát svému týmu více času na skutečnou práci.")}</p><div className={s.editorialRule} /><strong>{t("5 malých změn")}<br />{t("pro váš tým.")}</strong></div>
                <footer>{stage === 3 ? <><Check size={14} />{t(" Naplánováno · 15:00")}</> : stage === 2 ? <><ShieldCheck size={14} />{t(" Ke schválení")}</> : 'Návrh textu'}</footer>
            </article>
        </div>
        <div className={s.sceneFootnote}><span className={s.liveDot} />{t(['Téma je připravené pro tři různé formáty.', 'Každá síť má vlastní text, vizuál i tón.', 'Texty a vizuály čekají na vaše schválení.', 'Schválené příspěvky mají své místo v plánu.'][stage])}</div>
    </div>;
}

function VideoScene({ stage }: SceneProps) {
    const { t, locale, path } = useSiteLocale();

    return <div className={`${s.scene} ${s.videoScene}`}>
        <div className={s.editingDesk}>
            <div className={s.videoMonitor}><span className={s.videoLabel}>{t("ZDROJOVÉ VIDEO")}</span><div className={s.videoTitle}>{t("Jak si vrátit čas")}<br /><em>{t("na důležitou práci.")}</em></div><div className={s.videoOrb} aria-hidden="true" /><span className={s.timecode}>{t("00:00 ")}<span>{t("/ 18:42")}</span></span></div>
            <div className={s.timeline}><div className={s.timeRuler}><span>{t("00:00")}</span><span>{t("06:00")}</span><span>{t("12:00")}</span><span>{t("18:42")}</span></div><div className={s.waveform}>{Array.from({ length: 43 }, (_, index) => <i key={index} style={{ height: `${10 + (index * 17 % 29)}px` }} />)}<span className={s.playhead} data-started={stage >= 1} /></div></div>
            <div className={s.transcript} data-revealed={stage >= 1} aria-hidden={stage < 1}><span>{t("02:14")}</span><p>{t("„Začněte prací, která se ve firmě opakuje. Právě tam se vám čas vrátí nejdřív.“")}</p></div>
        </div>
        <div className={s.videoOutputs} data-revealed={stage >= 2} aria-hidden={stage < 2}>
            <article className={s.articleOutput}><span className={s.eyebrow}>{t("ČLÁNEK NA WEB")}</span><h3>{t("Pět způsobů,")}<br />{t("jak omezit rutinu")}<br />{t("ve firmě.")}</h3><p>{t("Více prostoru pro práci, která potřebuje právě vás.")}</p><div className={s.articleLines} aria-hidden="true" /><span className={s.articleStatus}>{stage === 3 ? <><Check size={14} />{t(" Připraveno k publikaci")}</> : 'Koncept článku'}</span></article>
            <div className={s.outputFormats}><span><FileText size={15} />{t(" Přepis")}</span><span><MessageCircle size={15} />{t(" Popis videa")}</span><span><Send size={15} />{t(" Příspěvky")}</span></div>
        </div>
    </div>;
}

function CodingScene({ stage }: SceneProps) {
    const { t, locale, path } = useSiteLocale();

    return <div className={`${s.scene} ${s.codingScene}`}>
        <div className={s.issue}><span className={s.issueDot} /><span>{t("Kontaktní formulář")}</span><strong>{t(stage === 0 ? 'Chybí potvrzení' : stage === 3 ? 'Změna připravena' : 'Oprava v průběhu')}</strong></div>
        <div className={s.codeWindow}>
            <div className={s.codeToolbar}><span className={s.windowDots}><i /><i /><i /></span><span>{t("contact-form.ts")}</span><GitBranch size={14} /></div>
            <pre><span>{t('  async function submitForm() {')}</span>{t('\n')}<del>{t('−   send(form.email);')}</del>{t('\n')}{stage >= 1 ? <><ins>{t('+   validate(form);')}</ins>{t('\n')}<ins>{t('+   await send(form.email);')}</ins>{t('\n')}<ins>{t('+   showConfirmation();')}</ins></> : <span className={s.codeComment}>{t('    // Chybí potvrzení odeslání\n\n')}</span>}{t('\n')}<span>{t('  }')}</span></pre>
            <div className={s.testRun} data-revealed={stage >= 2} aria-hidden={stage < 2}><span><Check size={14} />{t(" Validace e-mailu")}</span><span><Check size={14} />{t(" Odeslání formuláře")}</span><span><Check size={14} />{t(" Potvrzení uživateli")}</span></div>
            <div className={s.codeFooter}><GitBranch size={13} />{t(" oprava-formulare ")}<span>{t(stage >= 2 ? '3 testy prošly' : 'Údržbový úkol')}</span></div>
        </div>
        <div className={s.browserPreview}>
            <div className={s.browserBar}><span className={s.windowDots}><i /><i /><i /></span><span>{t("váš-web.cz / kontakt")}</span></div>
            <div className={s.browserContent}><span className={s.eyebrow}>{t("VAŠE FIRMA")}</span><h3>{t("Jsme tu")}<br />{t("pro vás.")}</h3><span className={s.inputLabel}>{t("Váš e-mail")}</span><div className={s.fakeInput}>{t("jmeno@firma.cz")}</div><div className={stage >= 3 ? s.formSuccess : s.formPending}>{stage >= 3 ? <><Check size={17} />{t(" Zpráva byla přijata")}</> : <>{t("Odeslat zprávu ")}<ArrowRight size={16} /></>}</div></div>
            <div className={s.browserFooter}>{stage >= 3 ? <><Check size={14} />{t(" Náhled opraveného formuláře")}</> : 'Náhled kontaktního formuláře'}</div>
        </div>
        <div className={s.sceneFootnote}><span className={s.liveDot} />{t(['Úkol: doplnit potvrzení odeslané zprávy.', 'Úprava kódu doplňuje validaci i potvrzení.', 'Automatické testy ověřují upravený formulář.', 'Ověřená změna je připravena k nasazení.'][stage])}</div>
    </div>;
}

export function AgendaScene({ scenario, stage }: SceneProps & { scenario: ScenarioId }) {
    const { t, locale, path } = useSiteLocale();

    switch (scenario) {
        case 'email': return <EmailScene stage={stage} />;
        case 'documents': return <DocumentsScene stage={stage} />;
        case 'social': return <SocialScene stage={stage} />;
        case 'video': return <VideoScene stage={stage} />;
        case 'coding': return <CodingScene stage={stage} />;
    }
}
