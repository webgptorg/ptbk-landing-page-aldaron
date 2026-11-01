import Link from 'next/link';
import { COMMON_KNOWLEDGE_BOOKS, getCommonKnowledgePath } from '@/lib/common-knowledge/catalog';
import { COMMON_KNOWLEDGE_INDEX_DEFINITION } from '@/lib/common-knowledge/metadata';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import s from './knowledge.module.css';

/** The catalogue is published with the website, independently of the engine package. */
export const metadata = createPageMetadata(COMMON_KNOWLEDGE_INDEX_DEFINITION);

/** Readable catalogue of the currently published reusable knowledge Books. */
export default function CommonKnowledgeIndex() {
    return (
        <main id="knowledge-main" className={s.main}>
            <section className={s.hero} aria-labelledby="knowledge-title">
                <p className={s.eyebrow}>
                    <span className={s.dot} /> THE PROMPTBOOK KNOWLEDGE COLLECTION
                </p>
                <h1 id="knowledge-title">Common knowledge</h1>
                <p className={s.lead}>
                    A shared starting point
                    <br className={s.desktopBreak} /> for your agents
                </p>
                <p className={s.intro}>
                    Practical rules and reference material you can reuse across projects. Link a Book, keep a particular
                    version, or adapt it to the way you work.
                </p>
            </section>
            <section aria-labelledby="published-books">
                <div className={s.sectionHeading}>
                    <h2 id="published-books">The collection</h2>
                    <span>{COMMON_KNOWLEDGE_BOOKS.length} published Book</span>
                </div>
                {COMMON_KNOWLEDGE_BOOKS.map((book, index) => (
                    <article className={s.card} key={book.slug}>
                        <div className={s.cardContent}>
                            <div className={s.cardMeta}>
                                <span className={s.number}>{String(index + 1).padStart(2, '0')}</span>
                                <span>REFERENCE · v{book.currentVersion}</span>
                            </div>
                            <h3>
                                <Link href={`/book/${book.slug}`}>{book.title}</Link>
                            </h3>
                            <p>{book.description}</p>
                            <div className={s.actions}>
                                <Link className={s.button} href={`/book/${book.slug}`}>
                                    Read the Book <span aria-hidden="true">↗</span>
                                </Link>
                                <a className={s.textLink} href={getCommonKnowledgePath(book)}>
                                    Raw .book source <span aria-hidden="true">↗</span>
                                </a>
                            </div>
                        </div>
                        <div className={s.scale}>
                            <p className={s.eyebrow}>ONE POINT · TEN TIMES THE WEIGHT</p>
                            <div className={s.scaleNumbers} aria-label="Impact points zero through four">
                                {[0, 1, 2, 3, 4].map((point) => (
                                    <span key={point}>{point}</span>
                                ))}
                            </div>
                            <p>
                                10 actions with impact 1<br />
                                <strong>One group with impact 2</strong>
                            </p>
                        </div>
                    </article>
                ))}
            </section>
            <section className={s.principles} aria-label="Using shared knowledge">
                <div>
                    <span className={s.smallNumber}>01 / REUSE</span>
                    <h2>One reference, many agents</h2>
                    <p>Add a knowledge link to your project’s Adam. Descendants can share the same starting point.</p>
                </div>
                <div>
                    <span className={s.smallNumber}>02 / KEEP CONTROL</span>
                    <h2>Your project, your rules</h2>
                    <p>Keep the reference and add your own instructions, replace it, or make an editable local copy.</p>
                </div>
                <div>
                    <span className={s.smallNumber}>03 / UPDATE</span>
                    <h2>A separate release cycle</h2>
                    <p>
                        Knowledge is versioned independently of the engine. Use the latest URL or pin an immutable
                        release.
                    </p>
                </div>
            </section>
        </main>
    );
}
