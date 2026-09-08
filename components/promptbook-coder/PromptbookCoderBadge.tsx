'use client';

import { useRef } from 'react';
import {
    DEFAULT_PROMPTBOOK_CODER_POSE,
    PROMPTBOOK_CODER_URL,
    type PromptbookCoderPose,
} from './promptbookCoderAnimation';
import { usePromptbookCoderAnimation } from './usePromptbookCoderAnimation';
import { useCoderBadgeClearance } from './useCoderBadgeClearance';
import styles from './PromptbookCoderBadge.module.css';

/** The footer and the animated terminal draw exactly the same independently movable body parts. */
function PromptbookCoderOctopus({ pose = DEFAULT_PROMPTBOOK_CODER_POSE }: { readonly pose?: PromptbookCoderPose }) {
    return (
        <span className={styles.octopus}>
            <span className={styles.tentacle} data-part="left-tentacle">
                {pose.leftTentacle}
            </span>
            <span className={styles.head} data-part="head">
                <span className={styles.cell}>{pose.headOpening}</span>
                <span className={styles.eyes} data-part="eyes">
                    <span className={styles.cell} data-part="left-eye">
                        {pose.leftEye}
                    </span>
                    <span className={styles.cell} data-part="right-eye">
                        {pose.rightEye}
                    </span>
                </span>
                <span className={styles.cell} data-part="code">
                    {pose.code}
                </span>
                <span className={styles.cell}>{pose.headClosing}</span>
            </span>
            <span className={styles.tentacle} data-part="right-tentacle">
                {pose.rightTentacle}
            </span>
        </span>
    );
}

export function PromptbookCoderBadge({
    obstacleSelector,
    playmateSelector,
}: {
    readonly obstacleSelector: string;
    readonly playmateSelector?: string;
}) {
    const badgeReference = useRef<HTMLAnchorElement>(null);
    const frame = usePromptbookCoderAnimation(badgeReference, playmateSelector);
    useCoderBadgeClearance(badgeReference, obstacleSelector);

    return (
        <a
            ref={badgeReference}
            href={PROMPTBOOK_CODER_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Promptbook coder (otevře se v nové kartě)"
            title="Promptbook coder"
            className={`${styles.terminal} ${styles.floating}`}
            data-promptbook-coder-badge
            data-mood={frame.command === null ? frame.mood : 'boot'}
        >
            <span className={styles.line} aria-hidden="true">
                {frame.command === null ? (
                    <PromptbookCoderOctopus pose={frame.pose} />
                ) : (
                    <span className={styles.command}>
                        <span className={styles.prompt}>$</span>
                        {frame.command.slice(1)}
                        <span className={styles.cursor}>▏</span>
                    </span>
                )}
            </span>
        </a>
    );
}

/** A quiet, static credit keeps the footer from running a second animation clock. */
export function PromptbookCoderCredit() {
    return (
        <a
            className={styles.credit}
            href={PROMPTBOOK_CODER_URL}
            target="_blank"
            rel="noopener noreferrer"
            lang="en"
        >
            <span className={styles.terminal} aria-hidden="true">
                <span className={styles.line}>
                    <PromptbookCoderOctopus />
                </span>
            </span>
            <span>Done by Promptbook coder</span>
        </a>
    );
}
