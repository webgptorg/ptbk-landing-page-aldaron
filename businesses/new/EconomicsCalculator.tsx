'use client';

import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { ArrowDownToLine, ArrowUpRight, Building2, Handshake, RotateCcw } from 'lucide-react';
import { calculateEconomics, DEFAULT_INPUT, SCENARIOS, type EconomicsInput, type PlanId, type ScenarioId, type AiBilling } from './economics';
import s from './new.module.css';

type Mode = 'company' | 'partner';
type NumericKey = Exclude<keyof EconomicsInput, 'plan' | 'aiBilling'>;
const money = (n: number) => new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(n) + ' Kč';
const decimal = (n: number) => new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 }).format(n);

function NumberField({ label, value, onChange, hint, min = 0, max = 1e9 }: {
    label: string; value: number; onChange: (value: number) => void; hint?: string; min?: number; max?: number;
}) {
    const id = useId();
    const [draft, setDraft] = useState(String(value));
    useEffect(() => setDraft(String(value)), [value]);
    return <div className={s.field}><label htmlFor={id}>{label}</label><input id={id} type="number" inputMode="decimal"
        min={min} max={max} step="any" value={draft} aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(event) => {
            const text = event.target.value;
            setDraft(text);
            if (text !== '' && Number.isFinite(Number(text))) onChange(Math.min(max, Math.max(min, Number(text))));
        }} onBlur={() => setDraft(String(value))} />{hint && <small id={`${id}-hint`}>{hint}</small>}</div>;
}

function MoneyRows({ rows }: { rows: Array<[string, number, string?]> }) {
    return <dl className={s.moneyRows}>{rows.map(([label, value, note]) => <div key={label}><dt>{label}{note && <small>{note}</small>}</dt><dd>{money(value)}</dd></div>)}</dl>;
}

export function EconomicsCalculator({ initialMode = 'company' }: { initialMode?: Mode }) {
    const [mode, setMode] = useState<Mode>(initialMode);
    const [scenarioId, setScenarioId] = useState<ScenarioId>('documents');
    const [input, setInput] = useState<EconomicsInput>({ ...DEFAULT_INPUT });
    const [exportStatus, setExportStatus] = useState('');
    const id = useId();
    const scenario = SCENARIOS[scenarioId];
    const result = calculateEconomics(input);
    const partner = result.partner;
    const field = (key: NumericKey, label: string, hint?: string, min = 0, max = 1e9) => <NumberField key={key}
        label={label} hint={hint} value={input[key]} min={min} max={max} onChange={(value) => setInput((previous) => ({ ...previous, [key]: value }))} />;
    const workload = <div className={s.fieldGrid}>
        {field('volume', scenario.volumeLabel)}{field('unitsPerItem', scenario.unitsLabel)}
        {field('manualMinutes', 'Ruční práce na celou položku (min)', 'Celý doklad, celé téma pro všechny sítě, celé video nebo celý úkol. Ne čas na jednu dílčí jednotku.')}
        {field('hourlyCost', 'Celkový náklad na člověka (Kč/h)', 'U zaměstnance včetně souvisejících nákladů; u dodavatele jeho sazba. Nejde o mzdový průzkum.')}
        {field('retainedWorkPercent', 'Lidská práce, která zůstane (%)', 'Kontrola a úpravy výstupů.', 0, 100)}
        {field('oversightHours', 'Další dohled za měsíc (h)', 'Navíc ke kontrole každé položky.')}
    </div>;
    function tabKey(event: KeyboardEvent<HTMLButtonElement>, next: Mode) {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            const target = event.key === 'Home' ? 'company' : event.key === 'End' ? 'partner' : next;
            setMode(target);
            document.getElementById(`${id}-${target}-tab`)?.focus();
        }
    }
    function exportCalculation() {
        const text = [
            'PROMPTBOOK — ORIENTAČNÍ KALKULACE', `Scénář: ${scenario.title}`,
            `Režim: ${mode === 'company' ? 'Vlastní agenda' : 'Partnerské nasazení'}`,
            'Všechny částky jsou CZK bez DPH. Vstupy a partnerské podmínky jsou modelové předpoklady.',
            `Měsíční peněžní náklad klienta: ${money(result.cashMonthly)}`,
            `Zbývající lidská práce: ${money(result.remainingWorkCost)}`,
            `Čistý měsíční ekonomický přínos: ${money(result.netMonthly)}`,
            `Přínos za ${result.input.horizonMonths} měsíců po nasazení: ${money(result.horizonBenefit)}`,
            `Partnerské měsíční tržby v období podílu: ${money(partner.recurringRevenue)}`,
            `Partnerský příspěvek po měsíčních nákladech: ${money(partner.monthlyContribution)}`,
            `Partnerské tržby po skončení podílu: ${money(partner.afterCommissionRevenue)}`,
            `Partnerský příspěvek za horizont včetně implementace: ${money(partner.horizonContribution)}`,
            '', 'Úplné vstupy (názvy odpovídají výpočetnímu modelu):', JSON.stringify(result.input, null, 2),
            '', 'Úspora času není automaticky úspora vyplacených mezd. Tržby nejsou zisk.',
            'Model předpokládá konstantní počet aktivních klientů od prvního měsíce. Neobsahuje daň z příjmů.',
        ].join('\n');
        try {
            const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
            const link = document.createElement('a'); link.href = url; link.download = `promptbook-${mode}-${scenarioId}.txt`;
            document.body.appendChild(link); link.click(); link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            setExportStatus('Soubor s výpočtem byl připraven ke stažení.');
        } catch { setExportStatus('Export se nezdařil. Výsledky zůstávají zobrazené níže.'); }
    }
    const maxComparison = Math.max(1, result.baselineCost, result.economicMonthly);
    return <section id="kalkulacka" className={`${s.section} ${s.calculatorSection}`} aria-labelledby="calculator-title">
        <div className={s.sectionHeading}><span className={s.eyebrow}>EKONOMIKA, NE JEN CENA LICENCE</span><h2 id="calculator-title">Spočítejte si celý obrázek.</h2><p>Co skutečně stojí provoz? Kolik práce zůstane člověku? A na čem vydělává partner? Upravte předpoklady podle sebe.</p></div>
        <div className={s.calculator}>
            <div className={s.calculatorToolbar}><div className={s.tabs} role="tablist" aria-label="Režim kalkulačky">
                {(['company', 'partner'] as const).map((tab) => <button key={tab} type="button" role="tab" id={`${id}-${tab}-tab`}
                    aria-selected={mode === tab} aria-controls={`${id}-panel`} tabIndex={mode === tab ? 0 : -1}
                    onClick={() => setMode(tab)} onKeyDown={(event) => tabKey(event, tab === 'company' ? 'partner' : 'company')}>
                    {tab === 'company' ? <Building2 size={18} /> : <Handshake size={18} />}{tab === 'company' ? 'Mám vlastní agendu' : 'Nasazuji klientům'}</button>)}
            </div><button type="button" className={s.resetButton} onClick={() => { setInput({ ...DEFAULT_INPUT }); setScenarioId('documents'); setExportStatus(''); }}><RotateCcw size={15} /> Obnovit příklad</button></div>
            <div className={s.calculatorBody} role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${mode}-tab`}>
                <div className={s.calculatorInputs}>
                    <div className={s.fieldGrid}><div className={s.field}><label htmlFor={`${id}-scenario`}>Co chcete automatizovat?</label><select id={`${id}-scenario`} value={scenarioId} onChange={(event) => {
                        const value = event.target.value as ScenarioId; setScenarioId(value); setInput((previous) => ({ ...previous, ...SCENARIOS[value].defaults }));
                    }}>{Object.entries(SCENARIOS).map(([value, option]) => <option value={value} key={value}>{option.title}</option>)}</select></div>
                    <div className={s.field}><label htmlFor={`${id}-plan`}>Aplikace pro 1 klientskou instanci</label><select id={`${id}-plan`} value={input.plan} onChange={(event) => setInput({ ...input, plan: event.target.value as PlanId })}>
                        <option value="engine">Jen engine · bez aplikace</option><option value="starter">Starter · 10 USD / měsíc</option><option value="business">Business · 100 USD / měsíc</option><option value="custom">Individuální cena licence</option>
                    </select></div>{input.plan === 'custom' && field('customLicenseUsd', 'Cena licence (USD/měs.)')}</div>
                    {input.plan === 'engine' && <p className={s.assumption}>Bez aplikace a smluvní podpory. Produkční použití podle licence enginu; podíl z aplikace je v tomto režimu nulový.</p>}
                    {mode === 'company' ? <fieldset><legend>Kolik práce děláte dnes?</legend>{workload}</fieldset> : <><fieldset><legend>Vaše partnerská služba</legend><div className={s.fieldGrid}>
                        {field('clients', 'Počet aktivních klientů', 'Každý má vlastní licenci a prostředí.', 0, 5000)}
                        {field('serviceFeeCzk', 'Servis za klienta (Kč/měs.)', 'Vaše pravidelná fakturace klientovi.')}
                        {field('commissionPercent', 'Partnerský podíl z licence (%)', 'Ilustrativní sazba, nikoli potvrzená nabídka.', 0, 100)}
                        {field('commissionMonths', 'Doba partnerského podílu (měsíce)', 'Po této době zůstávají jen tržby ze servisu. 0 = bez podílu.', 0, 120)}
                        {field('partnerHours', 'Obsluha jednoho klienta (h/měs.)')}{field('partnerHourlyCost', 'Váš interní náklad (Kč/h)')}
                    </div></fieldset><details className={s.inputDetails}><summary>Model agendy jednoho klienta</summary>{workload}</details></>}
                    <fieldset><legend>{mode === 'company' ? 'Nasazení a vyhodnocení' : 'Implementace a vyhodnocení'}</legend><div className={s.fieldGrid}>
                        {field('setupFeeCzk', 'Cena nasazení za klienta (Kč)', 'Jednorázově; není součástí měsíční licence.')}
                        {field('horizonMonths', 'Horizont výpočtu (měsíce)', undefined, 1, 120)}
                        {mode === 'company' && field('serviceFeeCzk', 'Servis partnera (Kč/měs.)', 'Při vlastní správě zadejte 0 a zahrňte svůj čas do dohledu.')}
                    </div></fieldset>
                    <details className={s.inputDetails}><summary>AI a spotřeba celého pracovního postupu</summary>
                        <div className={s.field}><label htmlFor={`${id}-ai`}>Jak platíte za AI?</label><select id={`${id}-ai`} value={input.aiBilling} onChange={(event) => setInput({ ...input, aiBilling: event.target.value as AiBilling })}><option value="tokens">Vlastní API · podle tokenů</option><option value="subscription">Vlastní předplatné harnessu</option><option value="local">Lokální model</option></select></div>
                        {input.aiBilling === 'tokens' ? <><p className={s.assumption}>Tokeny za {scenario.unit} v celém postupu, včetně kontextu a nástrojových kroků. Výchozí sazby jsou modelový příklad, ne aktuální tarif konkrétního poskytovatele.</p><div className={s.fieldGrid}>
                            {field('inputTokens', 'Vstupní tokeny / jednotku')}{field('outputTokens', 'Výstupní tokeny / jednotku')}
                            {field('inputPriceUsd', 'Vstup (USD / milion tokenů)')}{field('outputPriceUsd', 'Výstup (USD / milion tokenů)')}
                        </div></> : input.aiBilling === 'subscription' ? <>{field('aiSubscriptionCzk', 'AI předplatné (Kč/měs.)')}<p className={s.assumption}>Tokeny nepřičítáme podruhé. Dostupnou kapacitu, automatizovaný provoz a případné příplatky ověřte u poskytovatele. Příplatky lze zadat do dalších nástrojů.</p></> : <p className={s.assumption}>Bez externího tokenového účtu. Zahrňte hardware, elektřinu nebo pronájem potřebného serveru níže. Kvalitu a kapacitu modelu je nutné ověřit.</p>}
                        <div className={s.fieldGrid}>{field('externalPerUnitCzk', `Další služby (Kč / ${scenario.unit})`, 'Například OCR, tvorba obrázků nebo přepis. Nezapočítejte stejnou službu i do tokenů.')}
                            {field('retryReservePercent', 'Rezerva na měřenou spotřebu (%)', 'Opakované běhy a proměnlivost. Jen tokeny a služby na jednotku, ne pevné předplatné.', 0, 500)}
                            {field('exchangeRate', 'Přepočet USD → Kč', 'Ilustrativní kurz. Není aktualizovaný z trhu.', 0.01, 1000)}
                        </div>
                    </details>
                    <details className={s.inputDetails}><summary>Server, zálohy a ostatní náklady</summary><p className={s.assumption}>Částky za jednu klientskou instanci a měsíc. U existujících služeb zvolte, zda počítáte celý náklad, nebo jen navýšení. Pro srovnání postupujte stejně.</p><div className={s.fieldGrid}>
                        {field('hostingCzk', 'Server / hosting (Kč/měs.)')}{field('backupCzk', 'Zálohy a úložiště (Kč/měs.)')}
                        {field('toolsCzk', 'Ostatní nástroje (Kč/měs.)', 'Např. monitoring, licence, e-mailing, doména nebo rendering.')}
                        {field('energyCzk', 'Elektřina (Kč/měs.)', 'U VPS bývá už součástí hostingu.')}{field('hardwareCzk', 'Rozpočítaný hardware (Kč/měs.)', 'Jen pokud není zahrnutý v pronájmu serveru.')}
                    </div></details>
                    {mode === 'partner' && <details className={s.inputDetails}><summary>Vaše náklady na nasazení a získání klienta</summary><div className={s.fieldGrid}>
                        {field('partnerSetupHours', 'Implementace za klienta (h)')}{field('acquisitionPerClientCzk', 'Získání klienta (Kč jednorázově)')}
                        {field('partnerOverheadCzk', 'Režie celého portfolia (Kč/měs.)', 'Další náklady vaší firmy, nikoli klientem placené AI či hosting.')}
                    </div></details>}
                    <p className={s.assumption}>Všechny předvyplněné hodnoty jsou upravitelné příklady, ne změřené úspory, garantované výnosy ani závazný ceník. Částky jsou bez DPH. Výpočet probíhá v prohlížeči bez volání AI.</p>
                </div>
                <div className={s.calculatorResults}>
                    {mode === 'company' ? <>
                        <div className={`${s.resultHero} ${result.netMonthly < 0 ? s.negative : ''}`} role="status"><span>Čistý měsíční ekonomický přínos</span><strong data-testid="net-benefit">{money(result.netMonthly)}</strong><p>Hodnota uvolněného času po odečtení provozu a zbývající lidské práce. Před jednorázovým nasazením.</p></div>
                        <div className={s.resultMetrics}><div><span>Uvolněná kapacita</span><strong>{decimal(result.savedHours)} h / měsíc</strong></div><div><span>Návratnost nasazení</span><strong>{result.paybackMonths === null ? 'Nevychází' : result.paybackMonths === 0 ? 'Bez vstupního nákladu' : `${decimal(result.paybackMonths)} měs.`}</strong></div></div>
                        <div className={s.comparison}><div><span>Stejná práce ručně</span><strong>{money(result.baselineCost)}</strong></div><div className={s.barTrack}><span style={{ width: `${result.baselineCost / maxComparison * 100}%` }} /></div><div><span>S agendou včetně lidské práce</span><strong>{money(result.economicMonthly)}</strong></div><div className={`${s.barTrack} ${s.automationBar}`}><span style={{ width: `${result.economicMonthly / maxComparison * 100}%` }} /></div></div>
                    </> : <>
                        <div className={s.resultHero} role="status"><span>Opakované partnerské tržby / měsíc</span><strong data-testid="partner-revenue">{money(partner.recurringRevenue)}</strong><p>Servis + podíl z licence po dobu jeho nároku. Bez jednorázových implementací. Tržby nejsou zisk.</p></div>
                        <MoneyRows rows={[
                            ['Vaše pravidelné služby', partner.monthlyServices], ['Partnerský podíl z licence', partner.monthlyCommission],
                            ['Obsluha klientů a vaše režie', -partner.deliveryCost], ['Příspěvek po měsíčních nákladech', partner.monthlyContribution],
                        ]} />
                        <div className={s.resultNote}><strong>Po skončení podílu ({result.input.commissionMonths} měsíců)</strong><p>Pravidelné tržby {money(partner.afterCommissionRevenue)} / měsíc. Po zadaných nákladech {money(partner.afterCommissionContribution)} / měsíc.</p></div>
                        <details className={s.resultDetails} open><summary>Jednorázová implementace · celé portfolio</summary><MoneyRows rows={[
                            ['Tržby za nasazení', partner.setupRevenue], ['Implementace a získání klientů', -partner.setupCost], ['Příspěvek z nasazení', partner.setupContribution],
                        ]} /></details>
                        <div className={`${s.horizonResult} ${partner.horizonContribution < 0 ? s.negative : ''}`}><span>Za {result.input.horizonMonths} měsíců včetně implementací</span><strong>{money(partner.horizonContribution)}</strong><p>Příspěvek po zadaných nákladech. Celkové tržby {money(partner.horizonRevenue)}, náklady {money(partner.horizonPartnerCost)}. Před zdaněním.</p></div>
                        <p className={s.assumption}>Model drží {result.input.clients} aktivních klientů od prvního měsíce. Nezahrnuje růst ani odchody. Licence, tokeny a infrastruktura placené klientem nejsou vaše tržby ani vaše přímé náklady.</p>
                    </>}
                    <details className={s.resultDetails} open={mode === 'company'} key={`costs-${mode}`}><summary>{mode === 'company' ? 'Úplný měsíční rozpad nákladů' : 'Kolik platí jeden váš klient?'}</summary>
                        <MoneyRows rows={[
                            ['Aplikace Promptbook', result.licence, 'Licence a podpora podle plánu'],
                            ['AI model / předplatné', result.ai, 'Přímo vašemu poskytovateli'],
                            ['Další služby podle objemu', result.external, 'Např. OCR, obrázky nebo přepis'],
                            ['Rezerva na měřenou spotřebu', result.reserve],
                            ['Server / hosting', input.hostingCzk], ['Zálohy a úložiště', input.backupCzk],
                            ['Elektřina a rozpočítaný hardware', input.energyCzk + input.hardwareCzk],
                            ['Ostatní nástroje', input.toolsCzk], ['Servis partnera', input.serviceFeeCzk],
                            ['Celkem provoz bez interní práce', result.cashMonthly],
                            ['Zbývající lidská práce', result.remainingWorkCost, `${decimal(result.remainingHours)} h včetně kontrol a dohledu`],
                            ['Celkem včetně lidské práce', result.economicMonthly],
                        ]} />
                        <div className={s.resultNote}><span>Jednorázové nasazení: <strong>{money(input.setupFeeCzk)}</strong></span><p>Podíl partnera z licence je vyplácen z ceny Promptbooku; klientovi jej znovu nepřičítáme.</p></div>
                    </details>
                    {mode === 'company' && <><div className={`${s.horizonResult} ${result.horizonBenefit < 0 ? s.negative : ''}`}><span>Čistý přínos za {result.input.horizonMonths} měsíců</span><strong>{money(result.horizonBenefit)}</strong><p>Po započtení jednorázového nasazení {money(input.setupFeeCzk)}.</p></div><p className={s.assumption}>Uvolněná kapacita není automaticky hotovostní úspora mezd. Neodhadujeme nové tržby z obsahu ani garantované výsledky. Záporný přínos znamená, že při zadaných předpokladech automatizace ekonomicky nevychází.</p></>}
                    <div className={s.exportActions}><button type="button" className={s.secondaryButton} onClick={exportCalculation}><ArrowDownToLine size={16} /> Stáhnout výpočet</button><a className={s.textLink} href={`mailto:pavol@ptbk.io?subject=${encodeURIComponent(`Promptbook — ověření kalkulace: ${scenario.title}`)}`}>Ověřit předpoklady <ArrowUpRight size={16} /></a></div><p className={s.finePrint} role="status">{exportStatus}</p>
                </div>
            </div>
        </div>
    </section>;
}
