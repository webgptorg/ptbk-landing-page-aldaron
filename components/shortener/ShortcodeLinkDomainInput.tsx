'use client';

import { SHORTCODE_LINK_DOMAINS } from '@/lib/shortener/shortcodeLinkDomains';

export function ShortcodeLinkDomainInput({ domains, onChange, disabled = false }: {
    readonly domains: readonly string[] | null;
    readonly onChange: (domains: readonly string[] | null) => void;
    readonly disabled?: boolean;
}) {
    return <fieldset disabled={disabled} className="space-y-3 rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">Domains</legend>
        <label className="flex items-center gap-3 text-sm text-slate-700">
            <input type="checkbox" checked={domains === null} onChange={(event) => onChange(event.target.checked ? null : [...SHORTCODE_LINK_DOMAINS])} className="h-4 w-4 accent-cyan-600" />
            All domains
        </label>
        <p className="text-xs text-slate-500">The same short link works on every domain by default, including future domains. www aliases are included.</p>
        {domains !== null && <div className="grid gap-3 sm:grid-cols-2">
            {SHORTCODE_LINK_DOMAINS.map((domain) => <label key={domain} className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={domains.includes(domain)} onChange={(event) => onChange(event.target.checked ? [...domains, domain] : domains.filter((value) => value !== domain))} className="h-4 w-4 accent-cyan-600" />
                {domain}
            </label>)}
            {domains.length === 0 && <p role="alert" className="text-sm text-red-700 sm:col-span-2">Select at least one domain or use all domains.</p>}
        </div>}
    </fieldset>;
}
