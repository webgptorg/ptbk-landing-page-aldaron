import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { TERMINAL_TOUR_ARTICLE_FRAMES, TERMINAL_TOUR_PATH, TERMINAL_TOUR_STEPS } from './terminalTour';
import styles from './terminalTour.module.css';

const ARTICLE_WALKTHROUGH_STEPS = TERMINAL_TOUR_STEPS.filter((step) => step.id !== 'agenda');

export function TerminalTourArticleLink({ articleSlug }: { readonly articleSlug: string }) {
    const frame = TERMINAL_TOUR_ARTICLE_FRAMES.get(articleSlug);
    if (!frame) return null;

    return (
        <>
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
            <details className={styles.articleSteps}>
                <summary>Další kroky v terminálu</summary>
                <ul>
                    {ARTICLE_WALKTHROUGH_STEPS.map((step) => (
                        <li key={step.id}>
                            <figure>
                                <a className={styles.stepPicture} href={step.imagePath} aria-label={`Otevřít celý snímek · ${step.title}`}>
                                    <Image src={step.imagePath} width={1600} height={900} alt={step.imageAlt} unoptimized />
                                </a>
                                <figcaption>{step.title}</figcaption>
                            </figure>
                        </li>
                    ))}
                </ul>
            </details>
        </>
    );
}
