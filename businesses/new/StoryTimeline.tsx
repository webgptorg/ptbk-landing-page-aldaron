'use client';
import { useSiteLocale } from './LocaleProvider';
import s from './story-timeline.module.css';

/** Years are grounded in the founders' public history; sources are recorded in specs/new-pages-sources.md. */
const milestones = [
    { year: '2023', cs: ['WebGPT: web z nápadu', 'Začali jsme generováním webů pomocí AI. Od návrhu a textů až k hotové stránce jsme potřebovali propojit víc kroků do jednoho postupu.'], en: ['WebGPT: from an idea to a website', 'We started with AI-generated websites. Taking an idea through design and copy to a finished page meant connecting several steps into one process.'] },
    { year: '2024', cs: ['Z WebGPT vzniká Promptbook', 'Postupy vyvinuté pro weby otevíráme i dalším úlohám. Promptbook propojuje jednotlivá zadání a dává nad celým postupem větší kontrolu.'], en: ['WebGPT becomes Promptbook', 'The workflows we developed for websites open up to other tasks. Promptbook connects individual instructions and gives us more control over the process.'] },
    { year: '2025', cs: ['Agenti s vlastním kontextem', 'Od jednotlivých postupů se posouváme k AI kolegům. Každý může mít vlastní znalosti, pravidla a způsob práce pro konkrétní firmu.'], en: ['Agents with their own context', 'We move from individual workflows to AI colleagues. Each can have its own knowledge, rules and way of working for a particular company.'] },
    { year: '2026', cs: ['Od úkolování k dlouhodobé práci', 'Promptbook stavíme pro agendy, které pokračují i bez dalšího zadání. Engine pracuje na vašem stroji; vy určujete pravidla a máte práci pod kontrolou.'], en: ['From assigning tasks to ongoing work', 'We are building Promptbook for responsibilities that continue without another prompt. The engine runs on your machine; you set the rules and stay in control.'] },
] as const;

export function StoryTimeline() {
    const { locale } = useSiteLocale();
    return <ol className={s.timeline} aria-label={locale === 'en' ? 'Promptbook through the years' : 'Promptbook po letech'}>
        {milestones.map(milestone => <li key={milestone.year}>
            <time dateTime={milestone.year}>{milestone.year}</time>
            <div><h2>{milestone[locale][0]}</h2><p>{milestone[locale][1]}</p></div>
        </li>)}
    </ol>;
}
