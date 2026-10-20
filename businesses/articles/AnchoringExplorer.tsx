'use client';

import { useState } from 'react';
import { Anchor, ArrowDown, Check, RefreshCw } from 'lucide-react';
import type { ArticleLanguage } from '@/lib/articles/types';

const OPTIONS = [
    { id: 'api', cs: 'Veřejné API', en: 'Public API' },
    { id: 'design', cs: 'Vizuální jazyk', en: 'Visual language' },
    { id: 'behavior', cs: 'Ověřené chování', en: 'Verified behaviour' },
] as const;

/** A small explanatory model, deliberately separate from the author's original prose. */
export function AnchoringExplorer({ language }: { readonly language: ArticleLanguage }) {
    const cs = language === 'cs';
    const [anchors, setAnchors] = useState<readonly string[]>(['api', 'behavior']);
    const [revision, setRevision] = useState(1);
    return (
        <aside className="article-explorer" aria-labelledby="anchoring-explorer-title">
            <div className="article-explorer-heading"><span className="article-eyebrow">{cs ? 'Prozkoumat myšlenku' : 'Explore the idea'}</span><Anchor size={22} aria-hidden="true" /></div>
            <h3 id="anchoring-explorer-title">{cs ? 'Co při novém překladu zachováme?' : 'What survives the next generation?'}</h3>
            <p>{cs ? 'Ukotvěte hodnotu, kterou nechcete ztratit. Zbytek implementace může vzniknout znovu.' : 'Anchor the value you want to keep. The remaining implementation can be generated again.'}</p>
            <div className="article-explorer-spec">{cs ? 'Specifikace: co má software dělat' : 'Specification: what the software should do'}</div>
            <ArrowDown className="article-explorer-arrow" size={21} aria-hidden="true" />
            <fieldset className="article-anchor-options"><legend>{cs ? 'Vyberte invarianty' : 'Choose invariants'}</legend>
                {OPTIONS.map((option) => <label key={option.id}><input type="checkbox" checked={anchors.includes(option.id)} onChange={(event) => setAnchors(event.currentTarget.checked ? [...anchors, option.id] : anchors.filter((id) => id !== option.id))} /><span>{cs ? option.cs : option.en}</span></label>)}
            </fieldset>
            <div className="article-explorer-result" aria-live="polite">
                <div className="article-explorer-revision"><span>{cs ? 'Implementace' : 'Implementation'} {revision.toString().padStart(2, '0')}</span><span>{cs ? 'nově vytvořeno' : 'regenerated'}</span></div>
                <ul>{OPTIONS.map((option) => <li key={option.id} data-anchored={anchors.includes(option.id)}>{anchors.includes(option.id) ? <Check size={15} aria-hidden="true" /> : <RefreshCw size={15} aria-hidden="true" />}<span>{cs ? option.cs : option.en}</span><small>{anchors.includes(option.id) ? cs ? 'zachováno' : 'preserved' : cs ? 'může se změnit' : 'may change'}</small></li>)}</ul>
            </div>
            <button type="button" className="article-button" onClick={() => setRevision((value) => value + 1)}><RefreshCw size={16} aria-hidden="true" />{cs ? 'Vytvořit další implementaci' : 'Generate another implementation'}</button>
            <p className="article-explorer-note">{cs ? 'Ilustrační model autorovy hypotézy. Nejde o spuštění agenta ani o záruku zachování vlastností.' : 'An illustration of the author’s hypothesis. No agent runs here, and preservation is not guaranteed.'}</p>
        </aside>
    );
}
