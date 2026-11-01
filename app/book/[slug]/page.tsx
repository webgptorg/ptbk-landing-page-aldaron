import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { COMMON_KNOWLEDGE_BOOKS, getCommonKnowledgeBook, getCommonKnowledgePath } from '@/lib/common-knowledge/catalog';
import { getCommonKnowledgeDefinition } from '@/lib/common-knowledge/metadata';
import { getCommonKnowledgeBody, readCommonKnowledgeSource } from '@/lib/common-knowledge/source';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import s from '../knowledge.module.css';

/** Source definitions are a curated collection rather than visitor-generated routes. */
export const dynamicParams = false;

/** Prepares every published topic while preserving real 404s for unknown slugs. */
export function generateStaticParams() {
    return COMMON_KNOWLEDGE_BOOKS.map(({ slug }) => ({ slug }));
}

/** Canonical metadata uses the same topic name and purpose as the catalogue. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const book = getCommonKnowledgeBook((await params).slug);
    return book ? createPageMetadata(getCommonKnowledgeDefinition(book)) : {};
}

/** Renders only trusted, committed knowledge Markdown; raw source remains available unchanged. */
export default async function CommonKnowledgePage({ params }: { params: Promise<{ slug: string }> }) {
    const book = getCommonKnowledgeBook((await params).slug);
    if (!book) notFound();
    const source = readCommonKnowledgeSource(book);
    if (source === undefined) notFound();
    const release = book.releases.find(({ version }) => version === book.currentVersion)!;
    const body = marked.parse(getCommonKnowledgeBody(source), { async: false });
    const latestUrl = `https://ptbk.io${getCommonKnowledgePath(book)}`;
    const usage = `KNOWLEDGE ${latestUrl}\nRULE When evaluating an external action, estimate its impact using the referenced methodology and the action's actual context.`;
    return (
        <main id="knowledge-main" className={s.main}>
            <Link href="/book" className={s.back}>
                ← All common knowledge
            </Link>
            <header className={s.documentHero}>
                <p className={s.eyebrow}>PROMPTBOOK KNOWLEDGE · v{book.currentVersion}</p>
                <h1>{book.title}</h1>
                <p className={s.intro}>{book.description}</p>
                <div className={s.documentMeta}>
                    <span>Version {book.currentVersion}</span>
                    <time dateTime={release.publishedAt}>Published {release.publishedAt}</time>
                    <span>English · Public reference</span>
                </div>
            </header>
            <div className={s.documentGrid}>
                <aside className={s.sidebar} aria-label="Source and versions">
                    <h2>Use this Book</h2>
                    <p>Choose a moving reference or an immutable release.</p>
                    <a className={s.button} href={getCommonKnowledgePath(book)}>
                        Latest .book source ↗
                    </a>
                    <div className={s.releaseList}>
                        <h3>Released versions</h3>
                        {book.releases.map((item) => (
                            <a key={item.version} href={getCommonKnowledgePath(book, item.version)}>
                                v{item.version}
                                <span>Immutable source ↗</span>
                            </a>
                        ))}
                    </div>
                    <p>
                        Knowledge releases are independent of the engine. You can replace the link or adapt your own
                        copy.
                    </p>
                </aside>
                <div className={s.documentContent}>
                    <section className={s.usage} aria-labelledby="use-in-adam">
                        <h2 id="use-in-adam">Add to your project’s Adam</h2>
                        <p>
                            Keep your existing rules and add a reference with a short instruction about when to use it.
                        </p>
                        <pre tabIndex={0} aria-label="Knowledge and rule commitments">
                            <code>{usage}</code>
                        </pre>
                        <p className={s.hint}>
                            Use a version link instead of the latest URL when you want to keep a specific release.
                        </p>
                    </section>
                    <article
                        className={s.prose}
                        aria-label="Complete knowledge text"
                        dangerouslySetInnerHTML={{ __html: body }}
                    />
                    <details className={s.source}>
                        <summary>Read the complete .book source</summary>
                        <pre tabIndex={0}>
                            <code>{source}</code>
                        </pre>
                    </details>
                </div>
            </div>
        </main>
    );
}
