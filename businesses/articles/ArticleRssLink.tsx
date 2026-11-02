'use client';

import { useState } from 'react';
import { Copy, ExternalLink, Rss, Smartphone } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { ArticleLanguage } from '@/lib/articles/types';

/** A subscription is a choice of actions, never an unexpected XML navigation. */
export function ArticleRssLink({ url, language, label, className = 'article-text-link' }: {
    readonly url: string; readonly language: ArticleLanguage; readonly label?: string; readonly className?: string;
}) {
    const [status, setStatus] = useState('');
    const cs = language === 'cs';
    const brand = new URL(url).hostname.endsWith('ptbk.io') ? 'Promptbook' : 'Pavol Hejný';
    const androidUrl = url.replace(/^(https?:\/\/)/, '$1subscribeonandroid.com/');
    return <Dialog onOpenChange={() => setStatus('')}>
        <DialogTrigger asChild><button type="button" className={`inline-flex items-center gap-2 ${className}`}><Rss size={17} aria-hidden="true" />{label ?? (cs ? 'Odebírat podcast' : 'Subscribe to the podcast')}</button></DialogTrigger>
        <DialogContent className="max-w-md bg-[#faf8f2] text-[#203932]">
            <DialogHeader><DialogTitle>{cs ? `Podcast ${brand}` : `${brand} podcast`}</DialogTitle>
                <DialogDescription>{cs ? 'Zkopíruj odkaz do své podcastové aplikace, nebo si otevři RSS.' : 'Copy the feed into your podcast app, or open the RSS file.'}</DialogDescription>
            </DialogHeader>
            <input type="text" readOnly value={url} aria-label={cs ? 'Adresa podcastu' : 'Podcast feed address'} onFocus={event => event.currentTarget.select()} className="w-full rounded-xl border border-[#d8dfd7] bg-white p-3 text-sm" />
            <div className="grid gap-2">
                <button type="button" className="flex min-h-12 items-center gap-3 rounded-xl bg-[#203932] px-4 py-3 text-left text-sm text-white" onClick={async () => {
                    try { await navigator.clipboard.writeText(url); setStatus(cs ? 'Odkaz zkopírován.' : 'Link copied.'); }
                    catch { setStatus(cs ? 'Odkaz prosím označ a zkopíruj ručně.' : 'Please select and copy the link manually.'); }
                }}><Copy size={17} aria-hidden="true" />{cs ? 'Zkopírovat odkaz' : 'Copy link'}</button>
                <a className="flex min-h-12 items-center gap-3 rounded-xl border border-[#d8dfd7] px-4 py-3 text-sm" href={url} target="_blank" rel="noopener noreferrer"><ExternalLink size={17} aria-hidden="true" />{cs ? 'Otevřít XML' : 'Open XML'}</a>
                <a className="flex min-h-12 items-center gap-3 rounded-xl border border-[#d8dfd7] px-4 py-3 text-sm" href={androidUrl} target="_blank" rel="noopener noreferrer"><Smartphone size={17} aria-hidden="true" />{cs ? 'Přidat do aplikace na Androidu' : 'Open in an Android podcast app'}</a>
            </div>
            <p className="text-xs leading-relaxed text-[#606b63]">{cs ? 'Na Androidu se otevře podporovaná aplikace nebo výběr přehrávačů. Na iPhonu v Apple Podcasts zvol Knihovna → Přidat pořad pomocí URL a vlož zkopírovaný odkaz.' : 'On Android this opens a supported app or a choice of players. On iPhone, use Library → Follow a Show by URL in Apple Podcasts and paste the link.'}</p>
            {status && <p role="status" className="text-sm">{status}</p>}
        </DialogContent>
    </Dialog>;
}
