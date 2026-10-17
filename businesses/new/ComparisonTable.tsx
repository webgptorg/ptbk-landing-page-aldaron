'use client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { COMPARISONS } from './comparisons';
import { useSiteLocale } from './LocaleProvider';
import s from './site.module.css';
/** Short editorial summaries of the same primary sources linked in the detailed comparisons. */
const rows = [
    ['promptbook', 'Promptbook', ['Firemní agendy', 'Business workflows'], ['Prostředí klienta', 'Client environment'], ['Dlouhodobá práce podle pravidel', 'Ongoing work under defined rules'], ['Nasazení a péče partnera', 'Partner implementation and care']],
    ['grok-bot', 'Grok Bot', ['AI kolegové', 'AI teammates'], ['Trvalý cloudový počítač', 'Persistent cloud computer'], ['Dovednosti, rutiny, paralelní boti', 'Skills, routines, parallel Bots'], ['Přímé delegování týmové práce', 'Direct delegation of team work']],
    ['openai-dots', 'OpenAI Dots', ['Průběžně dostupný agent', 'Always-on agent'], ['Cloud; specializované firemní piloty', 'Cloud; specialist enterprise pilots'], ['Dlouhodobé úkoly a práce na pozadí', 'Long-running tasks and background work'], ['Delegování v prostředí OpenAI', 'Delegation within OpenAI']],
    ['meta-muse', 'Meta Muse', ['Osobní úkoly a cíle', 'Personal tasks and goals'], ['Muse Secure VM', 'Muse Secure VM'], ['Proaktivní práce s udělenými přístupy', 'Proactive work with granted access'], ['Osobní organizace', 'Personal organization']],
    ['chatgpt', 'ChatGPT', ['AI pracovní prostředí', 'AI workspace'], ['ChatGPT a připojené aplikace', 'ChatGPT and connected apps'], ['Plánované workflow; workspace agenti¹', 'Scheduled workflows; workspace agents¹'], ['Každodenní práce týmu', 'Everyday team work']],
    ['claude-code', 'Claude Code', ['Vývojový agent', 'Coding agent'], ['CLI / Agent SDK', 'CLI / Agent SDK'], ['Skripty a CI/CD', 'Scripts and CI/CD'], ['Přímý vývoj a vlastní integrace', 'Direct development and custom integrations']],
    ['codex', 'Codex', ['Vývoj a údržba kódu', 'Code development and maintenance'], ['CLI / vývojové prostředí', 'CLI / development environment'], ['Neinteraktivní běh, CI a plánování', 'Non-interactive execution, CI and scheduling'], ['Vlastní vývojové automatizace', 'Custom development automations']],
    ['n8n', 'n8n', ['Vizuální workflow a AI', 'Visual workflows and AI'], ['Cloud i vlastní hosting', 'Cloud or self-hosted'], ['Propojené kroky, kód a agenti', 'Connected steps, code and agents'], ['Explicitní návaznosti systémů', 'Explicit connections between systems']],
    ['make', 'Make', ['Vizuální integrace', 'Visual integrations'], ['Platforma Make', 'Make platform'], ['Scénáře, moduly a AI agenti', 'Scenarios, modules and AI agents'], ['Propojování existujících aplikací', 'Connecting existing applications']],
    ['openclaw', 'OpenClaw', ['Osobní asistent', 'Personal assistant'], ['Vlastní zařízení a Gateway', 'Own devices and Gateway'], ['Nástroje a komunikační kanály', 'Tools and communication channels'], ['Asistent ve vlastní správě', 'A self-managed assistant']],
    ['paperclip', 'Paperclip', ['Organizace AI agentů', 'AI agent organization'], ['Orchestrace různých runtime', 'Orchestration across runtimes'], ['Úkoly, cíle, rozpočty a plánování', 'Tasks, goals, budgets and scheduling'], ['Řízení týmů agentů', 'Managing agent teams']],
] as const;
export function ComparisonTable() {
    const { locale, path } = useSiteLocale();
    const index = locale === 'en' ? 1 : 0;
    const copy = (cs: string, en: string) => locale === 'cs' ? cs : en;
    return <section className={s.comparisonSection} aria-labelledby="comparison-table-title">
        <div className={s.sectionTitle}><span className={s.tableEyebrow}>{copy('V JEDNOM PŘEHLEDU', 'AT A GLANCE')}</span><h2 id="comparison-table-title">{copy('Stejný cíl. Různé cesty.', 'One goal. Different approaches.')}</h2><p>{copy('Porovnejte způsob práce a nasazení. Detail každého přístupu najdete níže.', 'Compare working and deployment models. Explore each approach in detail below.')}</p></div>
        <div className={s.tableScroll} role="region" aria-label={copy('Srovnávací tabulka — lze posouvat do stran', 'Comparison table — scroll horizontally')} tabIndex={0}>
            <table className={s.comparisonTable}><caption className={s.srOnly}>{copy('Promptbook a deset alternativ: zaměření, prostředí, automatizace a vhodné použití', 'Promptbook and ten alternatives: focus, environment, automation and fit')}</caption><thead><tr>{[['Produkt','Product'],['Zaměření','Focus'],['Prostředí','Environment'],['Automatizace','Automation'],['Kdy dává smysl','Best fit']].map(labels => <th scope="col" key={labels[0]}>{labels[index]}</th>)}</tr></thead><tbody>
                {rows.map(([slug,name,focus,environment,automation,fit]) => <tr key={slug} data-featured={slug === 'promptbook'}><th scope="row"><Link href={path(slug === 'promptbook' ? 'agendy' : `srovnani/${slug}`)}>{name}<ArrowUpRight size={13}/></Link>{slug === 'promptbook' ? <span>{copy('Náš přístup','Our approach')}</span> : <a className={s.tableSource} href={COMPARISONS.find(item => item.slug === slug)!.source}>{copy('Oficiální zdroj ↗','Official source ↗')}</a>}</th><td>{focus[index]}</td><td>{environment[index]}</td><td>{automation[index]}</td><td>{fit[index]}</td></tr>)}
            </tbody></table>
        </div>
        <p className={s.tableNote}>{copy('Podklady kontrolovány 15.–17. 10. 2026. Dostupnost funkcí závisí na plánu, regionu a nastavení. ¹ Workspace agenti jsou v research preview. Tabulka shrnuje zaměření, nikoli všechny funkce nebo výsledky výkonnostního testu.', 'Sources reviewed 15–17 October 2026. Feature availability depends on plan, region and configuration. ¹ Workspace agents are in research preview. This table summarizes positioning, not every feature or benchmark results.')}</p>
    </section>;
}
