'use client';

import { useRef, useState, type FormEvent } from 'react';
import { COMMUNITY_IDS } from '@/businesses/community/config';
import { Button } from '@/components/ui/button';
import { useAdminDraftProtection } from '@/hooks/useAdminDraftProtection';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { ARTICLES_ADMIN_API, ARTICLE_DESTINATION_LABELS, type GitArticleSummary, type GitArticlePublication } from '@/lib/articles/articleAdminTypes';
import type { ArticleCommunity, ManagedArticleDestination } from '@/lib/articles/managedArticleInput';

type Props = {
    readonly article: GitArticleSummary;
    readonly onSaved: (publication: GitArticlePublication) => void;
    readonly onBusy: (isBusy: boolean) => void;
};

export function GitArticlePublicationEditor({ article, onSaved, onBusy }: Props) {
    const [publication, setPublication] = useState(article.publication);
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const inProgress = useRef(false);
    const draft = useAdminDraftProtection(publication);
    const destinations = [...article.fixedDestinations, ...publication.communities];

    function toggleCommunity(community: ArticleCommunity, selected: boolean) {
        setIsSaved(false);
        setPublication((current) => {
            const communities = COMMUNITY_IDS.filter((candidate) => candidate === community ? selected : current.communities.includes(candidate));
            const canonicalDestination = current.canonicalDestination === community && !selected
                ? article.fixedDestinations.at(-1) ?? 'promptbook-blog' : current.canonicalDestination;
            return { communities, canonicalDestination };
        });
    }

    function chooseCanonical(canonicalDestination: ManagedArticleDestination) {
        setIsSaved(false);
        setPublication((current) => ({ ...current, canonicalDestination }));
    }

    async function save(event: FormEvent) {
        event.preventDefault();
        if (inProgress.current || !draft.isDraftDirty) return;
        inProgress.current = true;
        setIsBusy(true);
        setError('');
        onBusy(true);
        try {
            const result = await requestAdminJson<{ publication: GitArticlePublication }>(`${ARTICLES_ADMIN_API}/legacy/${encodeURIComponent(article.id)}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(publication),
            }, 'Umístění článku se nepodařilo uložit.');
            draft.acceptDraftValue(result.publication);
            setPublication(result.publication);
            setIsSaved(true);
            onSaved(result.publication);
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Umístění článku se nepodařilo uložit.');
        } finally {
            onBusy(false);
            setIsBusy(false);
            inProgress.current = false;
        }
    }

    return <form className="space-y-5" onSubmit={(event) => void save(event)}>
        <p className="text-sm text-slate-600">Obsah a předčítání se upravují v Gitu. Tady můžete veřejný článek přidat do komunit a vybrat jeho hlavní odkaz.</p>
        <fieldset disabled={isBusy} className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">Zobrazit v komunitách</legend>
            {COMMUNITY_IDS.map((community) => <label key={community} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-cyan-600" checked={publication.communities.includes(community)} onChange={(event) => toggleCommunity(community, event.target.checked)} />
                {ARTICLE_DESTINATION_LABELS[community]}
            </label>)}
        </fieldset>
        <fieldset disabled={isBusy} className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">Hlavní odkaz</legend>
            {destinations.map((destination) => <label key={destination} className="flex items-center gap-2 text-sm">
                <input type="radio" name="git-article-canonical" className="accent-cyan-600" checked={publication.canonicalDestination === destination} onChange={() => chooseCanonical(destination)} />
                {ARTICLE_DESTINATION_LABELS[destination]}
            </label>)}
        </fieldset>
        <Button type="submit" variant="outline" disabled={isBusy || !draft.isDraftDirty}>{isBusy ? 'Ukládám…' : 'Uložit umístění'}</Button>
        {isSaved && <p role="status" className="text-sm text-emerald-700">Umístění článku jsou uložená.</p>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </form>;
}
