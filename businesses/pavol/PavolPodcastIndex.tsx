import Link from 'next/link';
import { ArticleRssLink } from '@/businesses/articles/ArticleRssLink';
import { getArticlePodcastUrl } from '@/lib/articles/urls';
import { ArrowLeft } from 'lucide-react';
import { PAVOL_CONTAINER_CLASS_NAME, PAVOL_SITE_STYLE } from './layout';
import { PavolHeader } from './PavolHeader';
import { PavolFooter } from './_PavolFooter';
import { PavolSectionHeading } from './PavolSectionHeading';
import { PavolPodcastCard } from './PavolPodcastCard';
import { PavolPodcastList } from './PavolPodcastList';
import { fetchPavolPodcasts } from './fetchPavolPodcasts';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import './pavol.css';

export async function PavolPodcastIndex({ language, revalidateSeconds }: {
    readonly language: SupportedHomepageLanguage;
    readonly revalidateSeconds: number;
}) {
    const podcasts = await fetchPavolPodcasts(language, revalidateSeconds);
    const cs = language === 'cs';

    return <div className="pavol-site min-h-screen bg-[var(--pavol-paper)] text-[var(--pavol-ink)]" style={PAVOL_SITE_STYLE}>
        <PavolHeader language={language} pagePath="/podcasts" />
        <main id="main-content" tabIndex={-1} className="pt-20 outline-none">
            <section className="pavol-section">
                <div className={PAVOL_CONTAINER_CLASS_NAME}>
                    <Link href="/#podcasts" className="pavol-source-link mb-8"><ArrowLeft size={15} aria-hidden="true" />{cs ? 'Zpět na úvod' : 'Back to home'}</Link>
                    <PavolSectionHeading as="h1" eyebrow={cs ? 'Podcasty' : 'Podcasts'} title={cs ? 'Podcasty, kde mě uslyšíte' : 'Podcasts you can hear me on'} description={cs ? 'Všechny rozhovory o AI, vývoji a vzdělávání. Poslouchejte přímo tady, nebo otevřete původní díl.' : 'All conversations about AI, software, and education. Listen here or open the original episode. Czech recordings are marked with a flag.'} />
                    <div className="my-6"><ArticleRssLink language={language} url={getArticlePodcastUrl(language, 'personal')} /></div>
                    <PavolPodcastList language={language} items={podcasts.map((podcast) => ({
                        searchText: `${podcast.source} ${podcast.title} ${podcast.originalTitle ?? ""} ${podcast.description}`,
                        id: podcast.id, source: podcast.source, publishedAt: podcast.publishedAt, prominence: podcast.prominence,
                        content: <PavolPodcastCard podcast={podcast} language={language} headingAs="h2" />,
                    }))} />
                </div>
            </section>
        </main>
        <PavolFooter language={language} isHomepage={false} />
    </div>;
}
