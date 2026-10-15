'use client';

import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { ArrowDownToLine, ArrowUpRight, Building2, Handshake, RotateCcw } from 'lucide-react';
import { calculateEconomics, exportEconomics, DEFAULT_INPUT, SCENARIOS, type EconomicsInput, type PlanId, type ScenarioId, type AiBilling, type CostPayer } from './economics';
import { COMMERCIAL_TERMS as terms, enquiry } from './commercialTerms';
import s from './new.module.css';

type Mode = 'company' | 'partner';
type NumericKey = { [K in keyof EconomicsInput]: EconomicsInput[K] extends number ? K : never }[keyof EconomicsInput];
const money = (n: number) => new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(n) + ' Kč';
const decimal = (n: number) => new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 }).format(n);

function NumberField({ label, value, onChange, hint, min = 0, max = 1e9, integer = false }: {
    label: string; value: number; onChange: (value: number) => void;
    hint?: string; min?: number; max?: number; integer?: boolean;
}) {
    const id = useId();
    const [draft, setDraft] = useState(String(value));
    useEffect(() => setDraft(String(value)), [value]);
    return <div className={s.field}>
        <label htmlFor={id}>{label}</label>
        <input id={id} type="number" inputMode={integer ? 'numeric' : 'decimal'} min={min} max={max}
            step={integer ? 1 : 'any'} value={draft} aria-describedby={hint ? `${id}-hint` : undefined}
            onChange={(event) => {
                const text = event.target.value;
                setDraft(text);
                if (text !== '' && Number.isFinite(Number(text))) {
                    const number = integer ? Math.floor(Number(text)) : Number(text);
                    onChange(Math.min(max, Math.max(min, number)));
                }
            }} onBlur={() => setDraft(String(value))} />
        {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>;
}

function MoneyRows({ rows }: { rows: Array<[string, number, string?]> }) {
    return <dl className={s.moneyRows}>{rows.map(([label, value, note]) =>
        <div key={label}><dt>{label}{note && <small>{note}</small>}</dt><dd>{money(value)}</dd></div>,
    )}</dl>;
}

export function EconomicsCalculator({ initialMode = 'company' }: { initialMode?: Mode }) {
    const [mode, setMode] = useState<Mode>(initialMode);
    const [scenarioId, setScenarioId] = useState<ScenarioId>('documents');
    const [input, setInput] = useState<EconomicsInput>({ ...DEFAULT_INPUT });
    const [exportStatus, setExportStatus] = useState('');
    const id = useId();
    const scenario = SCENARIOS[scenarioId];
    const result = calculateEconomics(input);
    const { partner, isPilot } = result;
    const period = isPilot ? 'za 30 dní' : 'za měsíc';
    const field = (key: NumericKey, label: string, hint?: string, min = 0, max = 1e9, integer = false) =>
        <NumberField key={key} label={label} hint={hint} value={input[key]} min={min} max={max} integer={integer}
            onChange={(value) => setInput((previous) => ({ ...previous, [key]: value }))} />;
    const workload = <div className={s.fieldGrid}>
        {field('volume', isPilot ? scenario.volumeLabel.replace('za měsíc', 'za 30 dní') : scenario.volumeLabel)}
        {field('unitsPerItem', scenario.unitsLabel)}
        {field('manualMinutes', 'Ruční práce na celou položku (min)', 'Čas na celý e-mail, doklad, téma pro všechny sítě, video nebo úkol; ne na dílčí jednotku.')}
        {field('hourlyCost', 'Celkový náklad na člověka (Kč/h)', 'Náklad zaměstnavatele nebo sazba dodavatele: účetní, asistent, social media manažer, copywriter či vývojář. Příklad, ne mzdový průzkum.')}
        {field('retainedWorkPercent', 'Lidská práce, která zůstane (%)', 'Kontrola, výjimky a úpravy výstupů.', 0, 100)}
        {field('oversightHours', `Další dohled ${period} (h)`, 'Navíc ke kontrole jednotlivých položek.')}
    </div>;

    function tabKey(event: KeyboardEvent<HTMLButtonElement>, next: Mode) {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            const target = event.key === 'Home' ? 'company' : event.key === 'End' ? 'partner' : next;
            setMode(target);
            document.getElementById(`${id}-${target}-tab`)?.focus();
        }
    }
    function download() {
        try {
            const url = URL.createObjectURL(new Blob([exportEconomics(input, scenarioId, mode)], { type: 'text/plain;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `promptbook-${mode}-${scenarioId}.txt`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            setExportStatus('Soubor s výpočtem byl připraven ke stažení.');
        } catch {
            setExportStatus('Export se nezdařil. Výsledky zůstávají zobrazené níže.');
        }
    }
    const maxComparison = Math.max(1, result.baselineCost, result.economicCost);
    const thirdPartyNote = input.costPayer === 'partner' ? 'Zahrnuto ve službě partnera; klientovi znovu nepřičítáme.' : 'Hradí klient samostatně.';

    return <section id="kalkulacka" className={`${s.section} ${s.calculatorSection}`} aria-labelledby="calculator-title">
        <div className={s.sectionHeading}>
            <span className={s.eyebrow}>EKONOMIKA, NE JEN CENA LICENCE</span>
            <h2 id="calculator-title">Spočítejte si celý obrázek.</h2>
            <p>Náklady na licenci, AI i provoz proti hodnotě uvolněného času. Pro partnery také implementace, pravidelný servis a podíl z licence.</p>
        </div>
        <div className={s.calculator}>
            <div className={s.calculatorToolbar}>
                <div className={s.tabs} role="tablist" aria-label="Režim kalkulačky">
                    {(['company', 'partner'] as const).map((tab) => <button key={tab} type="button" role="tab"
                        id={`${id}-${tab}-tab`} aria-selected={mode === tab} aria-controls={`${id}-panel`}
                        tabIndex={mode === tab ? 0 : -1} onClick={() => setMode(tab)}
                        onKeyDown={(event) => tabKey(event, tab === 'company' ? 'partner' : 'company')}>
                        {tab === 'company' ? <Building2 size={18} /> : <Handshake size={18} />}
                        {tab === 'company' ? 'Mám vlastní agendu' : 'Nasazuji klientům'}
                    </button>)}
                </div>
                <button type="button" className={s.resetButton} onClick={() => {
                    setInput({ ...DEFAULT_INPUT }); setScenarioId('documents'); setExportStatus('');
                }}><RotateCcw size={15} /> Obnovit příklad</button>
            </div>
            <div className={s.calculatorBody} role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${mode}-tab`}>
                <div className={s.calculatorInputs}>
                    <div className={s.fieldGrid}>
                        <div className={s.field}>
                            <label htmlFor={`${id}-scenario`}>Co chcete automatizovat?</label>
                            <select id={`${id}-scenario`} value={scenarioId} onChange={(event) => {
                                const value = event.target.value as ScenarioId;
                                setScenarioId(value); setInput((previous) => ({ ...previous, ...SCENARIOS[value].defaults }));
                            }}>{Object.entries(SCENARIOS).map(([value, option]) => <option value={value} key={value}>{option.title}</option>)}</select>
                        </div>
                        <div className={s.field}>
                            <label htmlFor={`${id}-plan`}>Komerční licence</label>
                            <select id={`${id}-plan`} value={input.plan} onChange={(event) => setInput({ ...input, plan: event.target.value as PlanId })}>
                                <option value="start">Start · {terms.startUsd} USD / 30 dní jednorázově</option>
                                <option value="business">Business · {terms.businessUsd} USD / instanci / měsíc</option>
                            </select>
                        </div>
                    </div>
                    <p className={s.assumption}>{isPilot
                        ? 'Start: jedna instance, jednou pro koncového klienta. Počítáme jen 30 dní. Bez obnovy, automatického přechodu na Business, produktové podpory a SLA.'
                        : 'Business: měsíční licence bez ročního závazku. Instance není fyzický server ani počet agentů.'}</p>
                    {!isPilot && field('instancesPerClient', 'Instancí na jednoho klienta', 'Násobí pouze licenci. Práci, infrastrukturu i servis níže zadejte za celého klienta.', 1, 100, true)}
                    {mode === 'company' ? <fieldset><legend>Kolik práce děláte dnes?</legend>{workload}</fieldset> : <>
                        <fieldset><legend>Vaše partnerská služba</legend><div className={s.fieldGrid}>
                            {field('clients', 'Počet aktivních klientů', isPilot ? 'Každý musí mít nárok na svůj jediný pilot.' : 'Každý má vlastní klientské prostředí.', 0, 5000, true)}
                            {field('serviceFeeCzk', `Servis za klienta ${period} (Kč)`, 'Vaše vlastní cena; není stanovena Promptbookem.')}
                            {field('partnerHours', `Obsluha jednoho klienta ${period} (h)`)}
                            {field('partnerHourlyCost', 'Váš interní náklad (Kč/h)')}
                        </div></fieldset>
                        <div className={s.resultNote}><strong>Partnerský podíl: {terms.partnerSharePercent} %</strong>
                            <p>{terms.share} {terms.shareTerm}</p>
                        </div>
                        <details className={s.inputDetails}><summary>Úhrady a vratky licencí</summary><div className={s.fieldGrid}>
                            {field('paidLicencePercent', 'Skutečně uhrazené licence (%)', 'Podíl se nepočítá z nezaplacených faktur.', 0, 100)}
                            {field('refundPercent', 'Vratky z uhrazených licencí (%)', 'Snižují základ pro partnerský podíl, nikoli odhad běžných provozních nákladů klienta.', 0, 100)}
                        </div></details>
                        <details className={s.inputDetails}><summary>Model agendy jednoho klienta</summary>{workload}</details>
                    </>}
                    <fieldset><legend>Nasazení a vyhodnocení</legend><div className={s.fieldGrid}>
                        {field('setupFeeCzk', 'Cena nasazení za klienta (Kč)', 'Jednorázová práce agentury, zvlášť od licence.')}
                        {!isPilot && field('horizonMonths', 'Horizont výpočtu (měsíce)', 'Předpoklad pokračujícího předplatného, ne roční závazek.', 1, 120, true)}
                        {mode === 'company' && field('serviceFeeCzk', `Servis partnera ${period} (Kč)`, 'Při vlastní správě zadejte 0 a započítejte svůj čas.')}
                    </div></fieldset>
                    <details className={s.inputDetails}><summary>AI a spotřeba celého pracovního postupu</summary>
                        <div className={s.field}><label htmlFor={`${id}-ai`}>Jak platíte za AI?</label>
                            <select id={`${id}-ai`} value={input.aiBilling} onChange={(event) => setInput({ ...input, aiBilling: event.target.value as AiBilling })}>
                                <option value="tokens">Vlastní API · podle tokenů</option><option value="subscription">Vlastní předplatné</option><option value="local">Lokální model</option>
                            </select>
                        </div>
                        {input.aiBilling === 'tokens' ? <>
                            <p className={s.assumption}>Tokeny za {scenario.unit} v celém postupu, včetně kontextu a nástrojových kroků. Sazby jsou příklad, ne aktuální ceník poskytovatele.</p>
                            <div className={s.fieldGrid}>{field('inputTokens', 'Vstupní tokeny / jednotku')}{field('outputTokens', 'Výstupní tokeny / jednotku')}
                                {field('inputPriceUsd', 'Vstup (USD / milion tokenů)')}{field('outputPriceUsd', 'Výstup (USD / milion tokenů)')}</div>
                        </> : input.aiBilling === 'subscription' ? <>
                            {field('aiSubscriptionCzk', `AI předplatné ${period} (Kč)`)}
                            <p className={s.assumption}>Tokeny nepřičítáme podruhé. Kapacitu, povolený automatizovaný provoz a příplatky ověřte u poskytovatele; příplatky zadejte do ostatních nástrojů.</p>
                        </> : <p className={s.assumption}>Lokální model nemá externí tokenový účet. Započítejte hardware, energii a případný server. Kvalita a kapacita závisí na zvoleném modelu a stroji.</p>}
                        <div className={s.fieldGrid}>
                            {field('externalPerUnitCzk', `Další služby (Kč / ${scenario.unit})`, 'Například OCR, obrázky nebo přepis. Stejnou službu nepočítejte dvakrát.')}
                            {field('retryReservePercent', 'Rezerva na měřenou spotřebu (%)', 'Jen tokeny a služby na jednotku, ne pevné předplatné.', 0, 500)}
                            {field('exchangeRate', 'Přepočet USD → Kč', 'Ilustrativní kurz, nikoli živá tržní kotace.', 0.01, 1000)}
                        </div>
                    </details>
                    <details className={s.inputDetails}><summary>Server, databáze a ostatní provoz</summary>
                        <p className={s.assumption}>Všechny částky za celého klienta {period}, ne za každou instanci. U sdíleného serveru uveďte připadající podíl.</p>
                        <div className={s.field}><label htmlFor={`${id}-payer`}>Kdo hradí AI a ostatní provoz?</label>
                            <select id={`${id}-payer`} value={input.costPayer} onChange={(event) => setInput({ ...input, costPayer: event.target.value as CostPayer })}>
                                <option value="client">Klient samostatně</option><option value="partner">Partner v ceně svého servisu</option>
                            </select>
                        </div>
                        <div className={s.fieldGrid}>
                            {field('hostingCzk', `Server / hosting ${period} (Kč)`)}{field('databaseCzk', `Databáze ${period} (Kč)`, '0, pokud je již v ceně serveru.')}
                            {field('backupCzk', `Zálohy a úložiště ${period} (Kč)`)}{field('toolsCzk', `Ostatní nástroje ${period} (Kč)`, 'Monitoring, licence, e-mailing, doména, rendering a další náklady.')}
                            {field('energyCzk', `Elektřina ${period} (Kč)`, 'U VPS bývá zahrnuta v hostingu.')}
                            {field('hardwareCzk', `Rozpočítaný hardware ${period} (Kč)`, 'Ekonomický náklad; není nutně peněžní výdaj tohoto období. Nezdvojujte pronájem.')}
                        </div>
                    </details>
                    {mode === 'partner' && <details className={s.inputDetails}><summary>Vaše implementace, akvizice a režie</summary><div className={s.fieldGrid}>
                        {field('partnerSetupHours', 'Implementace za klienta (h)')}{field('acquisitionPerClientCzk', 'Získání klienta (Kč jednorázově)')}
                        {field('partnerOverheadCzk', `Režie celého portfolia ${period} (Kč)`)}
                    </div></details>}
                    <p className={s.assumption}>Licence a 20% podíl vycházejí z návrhu nabídky z 15. 10. 2026. Ostatní hodnoty jsou upravitelné příklady, ne změřené úspory ani zaručené výnosy. Bez DPH, bez volání AI. Pro pilot používáme uvedený objem a náklady za 30 dní.</p>
                </div>
                <div className={s.calculatorResults}>
                    {mode === 'company' ? <>
                        <div className={`${s.resultHero} ${result.netBenefit < 0 ? s.negative : ''}`} role="status">
                            <span>Čistý ekonomický přínos {period}</span><strong data-testid="net-benefit">{money(result.netBenefit)}</strong>
                            <p>Hodnota uvolněné kapacity po odečtení provozu a zbývající lidské práce. Před jednorázovým nasazením.</p>
                        </div>
                        <div className={s.resultMetrics}><div><span>Uvolněná kapacita</span><strong>{decimal(result.savedHours)} h {period}</strong></div>
                            <div><span>{isPilot ? 'Návratnost v rámci pilotu' : 'Návratnost nasazení'}</span>
                                <strong>{result.paybackMonths === null ? 'Nevychází' : result.paybackMonths === 0 ? 'Bez vstupního nákladu' : isPilot ? `${decimal(result.paybackMonths * 30)} dní` : `${decimal(result.paybackMonths)} měs.`}</strong>
                            </div></div>
                        <div className={s.comparison}><div><span>Stejná práce ručně</span><strong>{money(result.baselineCost)}</strong></div>
                            <div className={s.barTrack}><span style={{ width: `${result.baselineCost / maxComparison * 100}%` }} /></div>
                            <div><span>S agendou včetně lidské práce</span><strong>{money(result.economicCost)}</strong></div>
                            <div className={`${s.barTrack} ${s.automationBar}`}><span style={{ width: `${result.economicCost / maxComparison * 100}%` }} /></div>
                        </div>
                    </> : <>
                        <div className={s.resultHero} role="status"><span>{isPilot ? 'Partnerské tržby za pilot · bez implementace' : 'Opakované partnerské tržby / měsíc'}</span>
                            <strong data-testid="partner-revenue">{money(partner.periodRevenue)}</strong>
                            <p>{isPilot ? 'Jednorázový 30denní pilot. Není opakované předplatné ani automatický přechod na Business.' : 'Servis + podíl z uhrazených licencí po dobu trvání dohody. Bez jednorázových implementací.'} Tržby nejsou zisk.</p>
                        </div>
                        <MoneyRows rows={[
                            ['Vaše služby', partner.services], ['Čisté uhrazené licence klientů', partner.netPaidLicences, 'Základ podílu, nikoli vaše tržba.'],
                            ['Partnerský podíl 20 %', partner.licenceShare], ['Vámi hrazený provoz klientů', -partner.partnerThirdPartyCosts],
                            ['Obsluha a režie', -(partner.deliveryCost - partner.partnerThirdPartyCosts)],
                            ['Příspěvek po nákladech období', partner.periodContribution],
                        ]} />
                        {isPilot && <p className={s.resultNote}>Opakované měsíční tržby ze Startu: <strong data-testid="pilot-mrr">{money(partner.recurringRevenue)}</strong>. Pokračování vyžaduje samostatné objednání Business.</p>}
                        <details className={s.resultDetails} open><summary>Jednorázové nasazení · celé portfolio</summary><MoneyRows rows={[
                            ['Tržby za nasazení', partner.setupRevenue], ['Implementace a získání klientů', -partner.setupCost], ['Příspěvek z nasazení', partner.setupContribution],
                        ]} /></details>
                        <div className={`${s.horizonResult} ${partner.horizonContribution < 0 ? s.negative : ''}`}>
                            <span>{isPilot ? 'Celý pilot' : `Za ${result.input.horizonMonths} měsíců`} včetně implementací</span>
                            <strong>{money(partner.horizonContribution)}</strong>
                            <p>Příspěvek po zadaných nákladech. Tržby {money(partner.horizonRevenue)}, náklady {money(partner.horizonPartnerCost)}. Před zdaněním.</p>
                        </div>
                        <p className={s.assumption}>Stálý počet {result.input.clients} klientů od začátku, bez růstu a odchodů. Předpokládáme trvající partnerskou dohodu a stejné procento úhrad a vratek v každém období. Nejde o bezpodmínečný doživotní podíl. Klientem placené licence nejsou tržbou partnera.</p>
                    </>}
                    <details className={s.resultDetails} open={mode === 'company'} key={`costs-${mode}`}>
                        <summary>{mode === 'company' ? `Úplný rozpad nákladů ${period}` : `Kolik platí jeden klient ${period}?`}</summary>
                        <MoneyRows rows={[
                            ['Licence Promptbook', result.licence, isPilot ? 'Start · jednorázový produkční pilot' : `${result.input.instancesPerClient} klientských instancí Business`],
                            ['AI model / předplatné', result.ai, thirdPartyNote], ['Další služby podle objemu', result.external],
                            ['Rezerva na měřenou spotřebu', result.reserve], ['Server / hosting', input.hostingCzk],
                            ['Databáze', input.databaseCzk], ['Zálohy a úložiště', input.backupCzk],
                            ['Elektřina a rozpočítaný hardware', input.energyCzk + input.hardwareCzk], ['Ostatní nástroje', input.toolsCzk],
                            ['AI a ostatní provoz celkem', result.thirdPartyCosts, thirdPartyNote],
                            ['Servis partnera', input.serviceFeeCzk, input.costPayer === 'partner' ? 'Cena včetně výše rozepsaného provozu.' : 'Mimo výše rozepsaný provoz.'],
                            ['Celkem klient bez interní práce', result.operatingCost],
                            ['Zbývající lidská práce', result.remainingWorkCost, `${decimal(result.remainingHours)} h včetně kontrol a dohledu`],
                            ['Celkem včetně lidské práce', result.economicCost],
                        ]} />
                        <div className={s.resultNote}><span>Jednorázové nasazení: <strong>{money(input.setupFeeCzk)}</strong></span>
                            <p>Partnerský podíl je vyplácen z ceny licence; klientovi jej znovu nepřičítáme. Součtové řádky nejsou další náklady.</p>
                        </div>
                    </details>
                    {mode === 'company' && <>
                        <div className={`${s.horizonResult} ${result.horizonBenefit < 0 ? s.negative : ''}`}>
                            <span>{isPilot ? 'Čistý přínos celého 30denního pilotu' : `Čistý přínos za ${result.input.horizonMonths} měsíců`}</span>
                            <strong>{money(result.horizonBenefit)}</strong><p>Po jednorázovém nasazení {money(input.setupFeeCzk)}.</p>
                        </div>
                        <p className={s.assumption}>Uvolněná kapacita není automaticky hotovostní úspora mezd ani nová tržba. Záporný výsledek znamená, že při zadaných předpokladech automatizace ekonomicky nevychází. Návratnost předpokládá rovnoměrný přínos v období.</p>
                    </>}
                    <div className={s.exportActions}><button type="button" className={s.secondaryButton} onClick={download}><ArrowDownToLine size={16} /> Stáhnout výpočet</button>
                        <a className={s.textLink} href={enquiry(`Promptbook — ověření kalkulace: ${scenario.title}`)}>Ověřit předpoklady <ArrowUpRight size={16} /></a>
                    </div><p className={s.finePrint} role="status">{exportStatus}</p>
                </div>
            </div>
        </div>
    </section>;
}
