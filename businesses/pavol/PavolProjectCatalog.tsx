'use client';

import { useState } from 'react';
import projects from './pavolProjectCatalog.json';
import { ArchiveSearchField } from '@/components/podcast/ArchiveSearchField';
import { createSearchWords, isTextMatchingSearchWords } from '@/lib/search/textSearch';
import { rankContent } from '@/lib/content/contentRanking';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

const categories: Record<string, string> = {
    'Produkty a dlouhodobé projekty': 'Products and long-term projects',
    'Nové miniaplikace': 'Small apps',
    'Hry, 3D a hackathony': 'Games, 3D, and hackathons',
    'Knihovny a vývojářské nástroje': 'Libraries and developer tools',
    'Moduly Collboardu': 'Collboard modules',
    'Ukázky, workshopy a fyzické výtvory': 'Demos and workshop materials',
    'Další dohledané stopy': 'Other projects',
};

export function PavolProjectCatalog({ language }: { readonly language: SupportedHomepageLanguage }) {
    const [query, setQuery] = useState('');
    const cs = language === 'cs';
    const words = createSearchWords(query);
    const filtered = rankContent(projects).filter(project => isTextMatchingSearchWords(`${project.title} ${project.category} ${categories[project.category] ?? ''}`, words));
    const groups = Array.from(new Set(filtered.map(project => project.category)));
    return <>
        <h2 className="mb-6 text-3xl font-medium">{cs ? 'Všechny projekty' : 'All projects'}</h2>
        <ArchiveSearchField value={query} onChange={setQuery} label={cs ? 'Hledat projekt' : 'Search projects'} placeholder={cs ? 'Název nebo oblast' : 'Name or category'} className="border-[var(--pavol-border)]" />
        <p role="status" className="my-5 text-sm text-[var(--pavol-muted)]">{filtered.length} / {projects.length}</p>
        {!filtered.length && <p>{cs ? 'Žádný projekt neodpovídá hledání.' : 'No projects match your search.'}</p>}
        {groups.map(group => <section key={group} className="mt-10">
            <h3 className="border-b border-[var(--pavol-border)] pb-4 text-xl font-medium">{cs ? group : categories[group] ?? group}</h3>
            <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">{filtered.filter(project => project.category === group).map(project => <li key={project.id} className="border-b border-[var(--pavol-border)] py-5">
                <h4 className="font-medium">{project.title}</h4>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--pavol-muted)]">{project.urls.slice(0, 2).map(url => <a key={url} href={url} className="underline underline-offset-4">{new URL(url).hostname.includes('github') ? 'GitHub' : cs ? 'Otevřít projekt' : 'Open project'} ↗</a>)}</div>
            </li>)}</ul>
        </section>)}
    </>;
}
