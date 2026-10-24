'use client';

import { useSiteLocale } from './LocaleProvider';
import { Suspense, useEffect, useId, useState, type KeyboardEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Download, Link2, RotateCcw } from 'lucide-react';
import { calculateEconomics, SCENARIOS, type EconomicsInput, type ScenarioId } from './economics';
import { formatCurrency, licencePrice } from './localization';
import { displayFieldValue, storedFieldValue, localizedFieldLabel } from './localizedCalculator';
import { COMMERCIAL_TERMS } from './commercialTerms';
import { calculatorPath, calculationShareUrl, changeScenario, defaultCalculatorState, parseCalculatorState, type CalculatorMode, type CalculatorState, type NumericKey } from './calculatorState';
import { FIELD_GROUPS, FIELD_LABELS, numericFieldBounds } from './calculatorFields';
import { useLeadCapture } from './LeadCapture';
import s from './site.module.css';
import controls from './calculator-controls.module.css';

export const formatMoney = (n: number) => new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(n) + ' Kč';
const decimal = (n: number) => new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 }).format(n);

function NumberField({ label, value, onChange, name }: { label: string; value: number; onChange: (value: number) => void; name: NumericKey }) {
    const { t, locale, path } = useSiteLocale();

    const id = useId();
    const bounds = numericFieldBounds(name);
    const [draft, setDraft] = useState(String(value));
    useEffect(() => setDraft(String(value)), [value]);
    return <label className={s.field} htmlFor={id}>{t(label)}<input id={id} name={name} type="number" inputMode="decimal" {...bounds} value={draft}
        onChange={(event) => { const text = event.target.value; setDraft(text); if (text.trim() !== '' && Number.isFinite(Number(text))) { const n = Math.min(bounds.max, Math.max(bounds.min, Number(text))); onChange(bounds.step === 1 ? Math.floor(n) : n); } }}
        onBlur={() => setDraft(String(value))} /></label>;
}

function MoneyRows({ rows, exchangeRate }: { rows: Array<[string, number]>; exchangeRate: number }) {
    const { t, locale, path } = useSiteLocale();

    return <dl className={s.moneyRows}>{rows.map(([label, amount]) => <div key={label}><dt>{t(label)}</dt><dd>{formatCurrency(amount, locale, exchangeRate)}</dd></div>)}</dl>;
}

function Calculator({ initialMode = 'company', advanced = false }: { initialMode?: CalculatorMode; advanced?: boolean }) {
    const { t, locale, path } = useSiteLocale();

    const query = useSearchParams();
    const queryKey = query.toString();
    const [state, setState] = useState<CalculatorState>(() => parseCalculatorState(query, initialMode));
    const [shareStatus, setShareStatus] = useState('');
    const [showLink, setShowLink] = useState(false);
    const id = useId();
    const lead = useLeadCapture();
    // Next's native history integration updates searchParams on replaceState and browser Back/Forward.
    useEffect(() => { setState(parseCalculatorState(new URLSearchParams(queryKey), initialMode)); }, [queryKey, initialMode]);
    function update(next: CalculatorState) {
        setState(next); setShareStatus('');
        if (advanced) window.history.replaceState(window.history.state, '', calculatorPath(next, locale));
    }
    const input = state.input;
    const scenario = SCENARIOS[state.scenario];
    const result = calculateEconomics(input);
    const formatMoney = (amount: number) => formatCurrency(amount, locale, input.exchangeRate);
    const partner = result.partner;
    const setInput = (change: Partial<EconomicsInput>) => update({ ...state, input: { ...input, ...change } });
    const field = (key: NumericKey, label = FIELD_LABELS[key]) => <NumberField key={key} name={key} label={localizedFieldLabel(key, label, locale)} value={displayFieldValue(key, input[key], locale, input.exchangeRate)} onChange={(value) => setInput({ [key]: storedFieldValue(key, value, locale, input.exchangeRate) })} />;
    const company = state.mode === 'company';
    const period = result.isPilot ? t('30 dní pilotu') : `${result.input.horizonMonths} ${t('měsíců')}`;
    const amount = company ? result.horizonBenefit : partner.horizonContribution;
    const costRows: Array<[string, number]> = [
        ['Licence Promptbooku', result.licence], ['AI / předplatné', result.ai],
        ['Externí služby podle objemu', result.external], ['Rezerva na měřenou spotřebu', result.reserve],
        ['Server', input.hostingCzk], ['Databáze', input.databaseCzk], ['Zálohy a úložiště', input.backupCzk],
        ['Elektřina', input.energyCzk], ['Rozpočítaný hardware', input.hardwareCzk], ['Ostatní nástroje', input.toolsCzk],
        ['Servis partnera', input.serviceFeeCzk], ['Provoz placený klientem', result.operatingCost],
        ['Zbývající lidská práce', result.remainingWorkCost], ['Celkem včetně lidské práce', result.economicCost],
    ];
    function tabKey(event: KeyboardEvent<HTMLButtonElement>) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const mode = event.key === 'Home' ? 'company' : event.key === 'End' ? 'partner' : company ? 'partner' : 'company';
        update({ ...state, mode }); document.getElementById(`${id}-${mode}`)?.focus();
    }
    async function copyLink() {
        const url = calculationShareUrl(state, locale);
        setShowLink(true);
        try { await navigator.clipboard.writeText(url); setShareStatus('Odkaz je zkopírovaný. Obsahuje všechny parametry, ne kontaktní údaje.'); }
        catch { setShareStatus('Zkopírujte odkaz z pole níže.'); }
    }
    function requestPdf() {
        const snapshot: CalculatorState = { ...state, input: { ...input } };
        const url = calculationShareUrl(snapshot, locale);
        lead({ kind: 'pdf', topic: `PDF kalkulace — ${scenario.title} — ${company ? 'vlastní agenda' : 'partnerství'}`,
            note: `Model ${COMMERCIAL_TERMS.version}\nParametry kalkulace: ${url}`,
            afterSave: async () => {
                const { downloadCalculationPdf } = await import('./calculationPdf');
                await downloadCalculationPdf(snapshot, locale);
            },
        });
    }
    const quickKey = company ? 'volume' : 'clients';
    const quickMax = company ? Math.max(100, Number(SCENARIOS[state.scenario].defaults.volume || 300) * 4, input.volume) : Math.max(100, input.clients);
    return <section className={s.calculatorSection} id="kalkulacka" aria-label={t("Kalkulačka nákladů a přínosů")}>
        <div className={s.calculatorCard}>
            <div className={s.calculatorTop}><h2>{t(advanced ? 'Vaše kalkulace' : 'Vyplatí se vám Promptbook?')}</h2><div className={s.modeTabs} role="tablist" aria-label={t("Režim kalkulačky")}>
                {(['company','partner'] as const).map(mode => <button type="button" role="tab" key={mode} id={`${id}-${mode}`} aria-controls={`${id}-panel`} aria-selected={state.mode === mode} tabIndex={state.mode === mode ? 0 : -1} onClick={() => update({ ...state, mode })} onKeyDown={tabKey}>{t(mode === 'company' ? 'Pro mou firmu' : 'Nasazuji klientům')}</button>)}
            </div></div>
            <div className={s.calculatorGrid} role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${state.mode}`}>
                <div className={s.calculatorControls}><p>{t(company ? 'Vyberte práci, kterou chcete předat agentům.' : 'Spočítejte si službu, kterou nabídnete klientům.')}</p>
                    <div className={s.fields}><label className={`${s.field} ${s.fullField}`} htmlFor={`${id}-scenario`}>{t("Co chcete automatizovat?")}<select id={`${id}-scenario`} value={state.scenario} onChange={(event) => update(changeScenario(state, event.target.value as ScenarioId))}>{Object.entries(SCENARIOS).map(([key,value]) => <option value={key} key={key}>{t(value.title)}</option>)}</select></label>
                    {t(company ? field('hourlyCost') : field('serviceFeeCzk'))}
                    {advanced && <label className={s.field} htmlFor={`${id}-plan`}>{t("Licenční plán")}<select id={`${id}-plan`} value={input.plan} onChange={(event) => setInput({ plan: event.target.value as EconomicsInput['plan'] })}><option value="business">Business · {licencePrice('business', locale)} / {t('měsíc')}</option><option value="start">Start · {licencePrice('start', locale)} / {t('30 dní')}</option></select></label>}
                    </div>
                    <div className={s.sliderField}><div><label htmlFor={`${id}-quick`}>{t(company ? scenario.volumeLabel : FIELD_LABELS.clients)}</label><input id={`${id}-quick`} type="number" min={0} max={company ? 1e9 : 5000} step={1} value={input[quickKey]} onChange={(event) => { const n = event.target.valueAsNumber; if (Number.isFinite(n)) setInput({ [quickKey]: Math.max(0, Math.min(company ? 1e9 : 5000, Math.floor(n))) }); }} /></div><input type="range" aria-label={t(`${company ? scenario.volumeLabel : 'Počet klientů'} — posuvník`)} min={0} max={quickMax} step={1} value={input[quickKey]} onChange={(event) => setInput({ [quickKey]: Number(event.target.value) })} /></div>
                    {!company && <div className={s.fixedShare}><strong>{t(COMMERCIAL_TERMS.partnerSharePercent)}{t(" %")}</strong><span>{t("pevný partnerský podíl")}<br />{t("z uhrazených licencí po vratkách")}</span></div>}
                    {!advanced && <p className={s.advancedNote}>{t(result.isPilot ? 'Výpočet jednoho 30denního pilotu Start.' : 'Výpočet pro Business.')}{t(" Ostatní náklady a čas na obsluhu jsou předvyplněné odhady. ")}<Link className={s.textLink} href={calculatorPath(state, locale)}>{t("Upravit všechny předpoklady ")}<ArrowRight size={15} /></Link></p>}
                    {advanced && <>
                        {result.isPilot && <p className={s.advancedNote}>{t("Start počítá pouze jeden 30denní pilot. Bez obnovy a bez automatického přechodu na Business; měsíční vstupy zde představují celých 30 dní.")}</p>}
                        {!company && <details className={s.advancedDetails}><summary>{t("Objem práce jednoho klienta")}</summary><div className={s.fields}>{field('volume',scenario.volumeLabel)}</div></details>}
                        {FIELD_GROUPS.filter(group => !group.partnerOnly || !company).map(group => <details className={s.advancedDetails} key={group.title}><summary>{t(group.title)}</summary><p>{t(group.description)}</p>
                            {group.title === 'AI a externí služby' && <label className={s.field} htmlFor={`${id}-ai`}>{t("Jak platíte za AI?")}<select id={`${id}-ai`} value={input.aiBilling} onChange={(event) => setInput({ aiBilling: event.target.value as EconomicsInput['aiBilling'] })}><option value="tokens">{t("Vlastní API — tokeny")}</option><option value="subscription">{t("Vlastní předplatné")}</option><option value="local">{t("Lokální model")}</option></select></label>}
                            {group.title === 'Server a ostatní provoz' && <label className={s.field} htmlFor={`${id}-payer`}>{t("Kdo hradí AI a provoz?")}<select id={`${id}-payer`} value={input.costPayer} onChange={(event) => setInput({ costPayer: event.target.value as EconomicsInput['costPayer'] })}><option value="client">{t("Klient samostatně")}</option><option value="partner">{t("Partner — zahrnuto v ceně servisu")}</option></select></label>}
                            <div className={s.fields}>{group.keys.filter(key => {
                                if ((key === 'hourlyCost' && company) || (key === 'serviceFeeCzk' && !company)) return false;
                                if (result.isPilot && ['horizonMonths','instancesPerClient'].includes(key)) return false;
                                if (key === 'aiSubscriptionCzk') return input.aiBilling === 'subscription';
                                if (['inputTokens','outputTokens','inputPriceUsd','outputPriceUsd'].includes(key)) return input.aiBilling === 'tokens';
                                return true;
                            }).map(key => field(key, key === 'unitsPerItem' ? scenario.unitsLabel : FIELD_LABELS[key]))}</div>
                            {input.aiBilling === 'subscription' && group.title === 'AI a externí služby' && <p>{t("Tokeny nepřičítáme podruhé. Povolený způsob použití, limity a případné příplatky ověřte u poskytovatele předplatného; příplatky patří do ostatních nástrojů.")}</p>}
                        </details>)}
                    </>}
                </div>
                <div className={s.resultsColumn}><div className={`${s.calcResult} ${amount < 0 ? s.negative : ''}`} aria-live="polite" aria-atomic="true">
                    <p>{t("Za ")}{t(period)}</p><div className={s.resultSentence}>
                        {t(amount < 0 ? 'náklady převýší přínos o' : company ? 'můžete ušetřit v hodnotě práce' : 'vám může zbýt po nákladech')}
                        <strong data-testid={company ? 'net-benefit' : 'partner-benefit'}>{formatMoney(Math.abs(amount))}</strong>
                        {t(amount < 0 ? 'Při těchto předpokladech to nevychází.' : company ? 'Prostor pro to, co je důležité.' : 'Z nasazení, servisu a podílu z licencí.')}
                    </div><div className={s.calcMetrics}>
                        <div><small>{t(company ? 'Uvolněná kapacita / období' : result.isPilot ? 'Tržby za pilot bez nasazení' : 'Opakované tržby / měsíc')}</small><strong data-testid={company ? 'saved-hours' : 'partner-revenue'}>{t(company ? `${decimal(result.savedHours)} h` : formatMoney(result.isPilot ? partner.periodRevenue : partner.recurringRevenue))}</strong></div>
                        <div><small>{t(company ? 'Provoz bez lidské práce / období' : 'Obsluha a režie / období')}</small><strong>{formatMoney(company ? result.operatingCost : partner.deliveryCost)}</strong></div>
                    </div><p className={s.small}>{t(company ? 'Odhad zahrnuje provoz, lidskou kontrolu i jednorázové nasazení. Hodnota uvolněného času není automaticky hotovostní úspora mezd.' : 'Odhad po zadaných nákladech, před daní z příjmů. Stálý počet klientů od začátku a trvající partnerská dohoda; nejde o zaručený výdělek.')}</p>
                </div>
                {advanced && <div className={s.breakdown}>
                    {!company && <><h3>{t("Vaše partnerská ekonomika")}</h3><MoneyRows exchangeRate={input.exchangeRate} rows={[
                        ['Tržby za pravidelný servis',partner.services], ['Partnerský podíl z licencí',partner.licenceShare],
                        ['Obsluha, režie a převzatý provoz',partner.deliveryCost], ['Příspěvek za období',partner.periodContribution],
                        ['Tržby za jednorázové nasazení',partner.setupRevenue], ['Náklady nasazení a získání klientů',partner.setupCost],
                        [`Tržby za ${period} celkem`,partner.horizonRevenue], [`Náklady za ${period} celkem`,partner.horizonPartnerCost],
                        ['Výsledek po zadaných nákladech',partner.horizonContribution],
                    ]} />{result.isPilot && <p className={s.small}>{t("Start nevytváří opakované měsíční tržby (MRR = 0).")}</p>}</>}
                    <details className={s.advancedDetails} open={company} key={state.mode}><summary>{t(company ? 'Celý rozpad nákladů vaší agendy' : 'Kolik platí jeden klient?')}</summary><MoneyRows exchangeRate={input.exchangeRate} rows={costRows} />
                        {input.costPayer === 'partner' && <p>{t("AI a provoz jsou zahrnuté v ceně servisu. Uvedené dílčí náklady se klientovi nepřičítají podruhé, ale jsou odečtené partnerovi.")}</p>}
                        <MoneyRows exchangeRate={input.exchangeRate} rows={[
                            ['Stejná práce ručně / období',result.baselineCost], ['Jednorázové nasazení',input.setupFeeCzk],
                            [`Celkové náklady klienta za ${period}`,result.horizonCost],
                        ]} /><p>{t("Návratnost nasazení: ")}{t(result.paybackMonths === null ? 'Nevychází' : result.paybackMonths === 0 ? 'bez vstupního nákladu' : result.isPilot ? `${decimal(result.paybackMonths * 30)} dní` : `${decimal(result.paybackMonths)} měsíců`)}{t(". Dílčí částky jsou zaokrouhlené.")}</p></details>
                </div>}
                </div>
            </div>
            <div className={s.calculatorBottom}><div><button type="button" className={s.secondaryButton} onClick={requestPdf}><Download size={17} />{t("Stáhnout PDF výpočet")}</button>{advanced ? <button type="button" className={`${s.resetButton} ${controls.inlineAction}`} onClick={copyLink}><Link2 size={15} aria-hidden="true"/><span>{t("Sdílet kalkulaci")}</span></button> : <Link className={s.textLink} href={calculatorPath(state, locale)}>{t("Pokročilá kalkulačka ")}<ArrowRight size={17} /></Link>}<button type="button" className={`${s.resetButton} ${controls.inlineAction}`} onClick={() => update(defaultCalculatorState(state.mode))}><RotateCcw size={15} aria-hidden="true"/><span>{t("Obnovit příklad")}</span></button></div><p>{t("Upravitelné odhady, částky bez DPH. Změna vstupů nic neobjednává.")}</p>
                {showLink && <label className={`${s.field} ${s.fullField}`}>{t("Odkaz se všemi parametry")}<input className={s.copyField} readOnly value={calculationShareUrl(state, locale)} onFocus={(event) => event.target.select()} /></label>}<span className={s.shareStatus} role="status">{t(shareStatus)}</span>
            </div>
        </div>
    </section>;
}

export function EconomicsCalculator(props: { initialMode?: CalculatorMode; advanced?: boolean }) {
    const { t, locale, path } = useSiteLocale();

    return <Suspense fallback={<div className={s.card} role="status">{t("Načítám kalkulačku…")}</div>}><Calculator {...props} /></Suspense>;
}
