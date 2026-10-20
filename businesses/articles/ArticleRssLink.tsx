'use client';

import { useState } from 'react';
import { Check, Copy, Rss } from 'lucide-react';
import type { ArticleLanguage } from '@/lib/articles/types';

export function ArticleRssLink({ url, language }: { readonly url: string; readonly language: ArticleLanguage }) {
    const [copied, setCopied] = useState(false);
    const [failed, setFailed] = useState(false);
    const cs = language === 'cs';
    return (
        <div className="article-rss">
            <a href={url} className="article-text-link"><Rss size={17} aria-hidden="true" />{cs ? 'Odebírat v podcastové aplikaci' : 'Subscribe in your podcast app'}</a>
            <div className="article-rss-address">
                <span>{url}</span>
                <button type="button" aria-label={cs ? 'Kopírovat adresu RSS' : 'Copy RSS address'} onClick={async () => {
                    try {
                        await navigator.clipboard.writeText(url);
                        setCopied(true);
                        setFailed(false);
                    } catch { setFailed(true); }
                }}>{copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}</button>
            </div>
            <span className="article-rss-status" role="status">{copied ? cs ? 'Adresa zkopírována.' : 'Address copied.' : failed ? cs ? 'Adresu můžete označit a zkopírovat ručně.' : 'Select and copy the address manually.' : ''}</span>
        </div>
    );
}
