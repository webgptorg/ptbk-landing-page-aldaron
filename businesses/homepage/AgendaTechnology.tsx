import { getHomepageContent } from './homepageContent';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { ArrowUpRight, Folder, GitBranch } from 'lucide-react';
import STYLES from './homepage.module.css';

/** Verified in the pinned promptbook@0.114.0-41 README, Coder multi-runner section; two are also used in package.json. */
const CODING_HARNESSES = ['OpenAI Codex', 'Claude Code', 'OpenCode'] as const;

export function AgendaTechnology({ language }: { language: SupportedHomepageLanguage }) {
    const CONTENT = getHomepageContent(language).technology;
    return (
        <section id="technologie" className={STYLES.section} aria-labelledby="technology-title">
            <p className={STYLES.eyebrow}>{CONTENT.eyebrow}</p>
            <div className={STYLES.sectionIntroduction}>
                <h2 id="technology-title">{CONTENT.title}</h2>
                <p>{CONTENT.description}</p>
            </div>
            <div className={STYLES.technologyGrid}>
                <div className={STYLES.technologyCopy}>
                    <h3>{CONTENT.harnessTitle}</h3>
                    <p>{CONTENT.harnessDescription}</p>
                    <ul className={STYLES.harnesses}>
                        {CODING_HARNESSES.map((name) => (
                            <li key={name}>{name}</li>
                        ))}
                    </ul>
                    <p>{CONTENT.vendorDescription}</p>
                    <a href="https://coder.ptbk.io/" className={STYLES.textLink}>
                        {CONTENT.link}
                        <ArrowUpRight size={17} aria-hidden="true" />
                    </a>
                </div>
                <div className={STYLES.workspace}>
                    <h3>
                        <GitBranch size={22} aria-hidden="true" />
                        {CONTENT.workspaceTitle}
                    </h3>
                    <p>{CONTENT.workspaceDescription}</p>
                    <div className={STYLES.folder}>
                        <Folder size={20} aria-hidden="true" />
                        <span>{CONTENT.folder}</span>
                    </div>
                    <ul>
                        {CONTENT.files.map((file) => (
                            <li key={file.name}>
                                <span>{file.name}</span>
                                <span>{file.description}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
