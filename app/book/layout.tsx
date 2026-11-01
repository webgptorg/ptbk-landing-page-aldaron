import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import s from './knowledge.module.css';

/** Compact shared reading shell using the existing Promptbook mark and wordmark. */
export default function KnowledgeLayout({ children }: { children: ReactNode }) {
    return (
        <div className={s.site} lang="en">
            <a href="#knowledge-main" className={s.skip}>
                Skip to content
            </a>
            <header className={s.header}>
                <Link href="/en" className={s.brand} aria-label="Promptbook home">
                    <Image src="/logo/promptbook-logo-blue-transparent-128.png" width={34} height={34} alt="" />
                    <span>
                        prompt<span className={s.brandBlue}>book</span>
                    </span>
                </Link>
                <nav aria-label="Knowledge navigation">
                    <Link href="/book">Common knowledge</Link>
                    <Link href="/en/open-source">
                        Install Promptbook <span aria-hidden="true">↗</span>
                    </Link>
                </nav>
            </header>
            {children}
            <footer className={s.footer}>
                <span>Promptbook · Shared knowledge, your own rules</span>
                <nav aria-label="Footer">
                    <Link href="/en">Promptbook</Link>
                    <a href="https://github.com/webgptorg/ptbk-landing-page-aldaron/tree/main/knowledge">
                        Source on GitHub ↗
                    </a>
                </nav>
            </footer>
        </div>
    );
}
