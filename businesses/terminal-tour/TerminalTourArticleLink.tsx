import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { TERMINAL_TOUR_ARTICLE_FRAMES, TERMINAL_TOUR_PATH } from './terminalTour';
import styles from './terminalTour.module.css';

export function TerminalTourArticleLink({ articleSlug }: { readonly articleSlug: string }) {
    const frame = TERMINAL_TOUR_ARTICLE_FRAMES.get(articleSlug);
    if (!frame) return null;

    return (
        <figure className={styles.articleFrame}>
            <a className={styles.stepPicture} href={frame.imagePath} aria-label={`Otevřít celý snímek · ${frame.title}`}>
                <Image src={frame.imagePath} width={1600} height={900} alt={frame.imageAlt} unoptimized />
            </a>
            <figcaption className={styles.articleFrameCaption}>
                <span>Zadání agendy · {frame.title}</span>
                <Link href={TERMINAL_TOUR_PATH}>
                    Zobrazit celý postup <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
            </figcaption>
        </figure>
    );
}
