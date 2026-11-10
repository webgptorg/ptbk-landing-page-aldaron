import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { TERMINAL_TOUR_PATH, TERMINAL_TOUR_STEPS } from './terminalTour';
import styles from './terminalTour.module.css';

export function TerminalTourArticleLink() {
    return (
        <Link className={styles.articleLink} href={TERMINAL_TOUR_PATH}>
            <Image src={TERMINAL_TOUR_STEPS[3].imagePath} width={1600} height={900} sizes="144px" alt="" />
            <span>
                <strong>Ukázka z terminálu</strong>
                <span>Od instalace Promptbooku po zadání vlastní agendy.</span>
            </span>
            <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
    );
}
