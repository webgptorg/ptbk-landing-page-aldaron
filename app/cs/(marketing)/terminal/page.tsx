import { COMMUNITIES } from '@/businesses/community/config';
import {
    TERMINAL_TOUR_OTHER_AGENDAS,
    TERMINAL_TOUR_PAGE_DEFINITION,
    TERMINAL_TOUR_RECORDED_VERSION,
    TERMINAL_TOUR_STEPS,
    TERMINAL_TOUR_VIDEO_PATH,
} from '@/businesses/terminal-tour/terminalTour';
import styles from '@/businesses/terminal-tour/terminalTour.module.css';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = createPageMetadata(TERMINAL_TOUR_PAGE_DEFINITION);

export default function TerminalTourPage() {
    return (
        <div className={styles.tour}>
            <header className={styles.intro}>
                <h1>Promptbook v terminálu</h1>
                <p>Skutečný záznam od instalace po zadání první agendy.</p>
            </header>
            <video
                aria-label="Záznam instalace a založení projektu v Promptbooku"
                className={styles.video}
                controls
                playsInline
                preload="none"
                poster={TERMINAL_TOUR_STEPS[1].imagePath}
            >
                <source src={TERMINAL_TOUR_VIDEO_PATH} type="video/mp4" />
            </video>
            <div className={styles.recordingDetails}>
                <a href={TERMINAL_TOUR_VIDEO_PATH} download="promptbook-v-terminalu.mp4">Stáhnout MP4</a>
                <span>Verze {TERMINAL_TOUR_RECORDED_VERSION}</span>
            </div>
            <ol aria-label="Postup krok za krokem" className={styles.steps}>
                {TERMINAL_TOUR_STEPS.map((step, index) => (
                    <li key={step.id} id={step.id} className={styles.step}>
                        <div>
                            <span className={styles.stepNumber}>Krok {index + 1}</span>
                            <h2>{step.title}</h2>
                            <p>{step.description}</p>
                            {'commands' in step && <div className={styles.commands}>
                                {step.commands.map((command) => <code key={command}>{command}</code>)}
                            </div>}
                            {'note' in step && <p className={styles.stepNote}>{step.note}</p>}
                        </div>
                        <a className={styles.stepPicture} href={step.imagePath} aria-label={`Otevřít celý snímek · ${step.title}`}>
                            <Image src={step.imagePath} width={1600} height={900} alt={step.imageAlt} sizes="(max-width: 720px) 90vw, (max-width: 1180px) 57vw, 680px" />
                        </a>
                    </li>
                ))}
            </ol>
            <details className={styles.otherAgendas}>
                <summary>Další příklady zadání</summary>
                <div className={styles.otherAgendaFrames}>
                    {TERMINAL_TOUR_OTHER_AGENDAS.map((frame) => (
                        <figure key={frame.imagePath}>
                            <a className={styles.stepPicture} href={frame.imagePath} aria-label={`Otevřít celý snímek · ${frame.title}`}>
                                <Image src={frame.imagePath} width={1600} height={900} alt={frame.imageAlt} unoptimized />
                            </a>
                            <figcaption>{frame.title}</figcaption>
                        </figure>
                    ))}
                </div>
            </details>
            <nav className={styles.links} aria-label="Další kroky">
                <Link href="/cs/open-source">Instalační návod</Link>
                <Link href={`${COMMUNITIES.promptbook.path}#clanky`}>Články komunity Promptbook</Link>
            </nav>
        </div>
    );
}
