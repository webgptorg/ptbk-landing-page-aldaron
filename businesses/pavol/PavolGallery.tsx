import Image from 'next/image';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { PAVOL_CONTAINER_CLASS_NAME, PAVOL_SITE_STYLE } from './layout';
import { PavolHeader } from './PavolHeader';
import { PavolFooter } from './_PavolFooter';
import photos from './pavolGallery.json';
import './pavol.css';

export function PavolGallery({ language }: { readonly language: SupportedHomepageLanguage }) {
    const isCzech = language === 'cs';

    return (
        <div className="pavol-site min-h-screen bg-[var(--pavol-paper)] text-[var(--pavol-ink)]" style={PAVOL_SITE_STYLE}>
            <PavolHeader language={language} pagePath="/gallery" />
            <main id="main-content" tabIndex={-1} className={`${PAVOL_CONTAINER_CLASS_NAME} pb-16 pt-28 outline-none`}>
                <h1 className="mb-8 text-4xl font-semibold tracking-tight">{isCzech ? 'Fotogalerie' : 'Photo gallery'}</h1>
                <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                    {photos.map((photo) => (
                        <li key={photo.src}>
                            <figure>
                                <a href={photo.src} className="block overflow-hidden rounded-xl bg-[var(--pavol-warm)]">
                                    <Image
                                        src={photo.src}
                                        alt={photo.caption}
                                        lang="cs"
                                        width={photo.width}
                                        height={photo.height}
                                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                        className="aspect-[4/3] w-full object-contain"
                                    />
                                </a>
                                <figcaption className="mt-2 text-sm">
                                    <p className="font-medium">{photo.event}</p>
                                    {photo.sourceUrl && (
                                        <a href={photo.sourceUrl} className="pavol-source-link" title={photo.credit}>
                                            {isCzech ? 'Zdroj fotografie' : 'Photo source'}
                                        </a>
                                    )}
                                </figcaption>
                            </figure>
                        </li>
                    ))}
                </ul>
            </main>
            <PavolFooter language={language} isHomepage={false} />
        </div>
    );
}
