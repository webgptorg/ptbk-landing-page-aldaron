import { COMMUNITIES_PAGE_DEFINITION } from '@/businesses/community/communityMetadata';
import { COMMUNITIES, COMMUNITY_IDS } from '@/businesses/community/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { ArrowUpRight, Boxes, Code2 } from 'lucide-react';
import Link from 'next/link';
import styles from '@/businesses/new/site.module.css';

export const metadata = createPageMetadata(COMMUNITIES_PAGE_DEFINITION);

export default function CommunitiesPage() {
    return (
        <>
            <header className={styles.pageIntro}>
                <h1>Komunity</h1>
            </header>
            <div className={styles.twoColumns}>
                {COMMUNITY_IDS.map((id) => {
                    const community = COMMUNITIES[id];
                    const Icon = id === 'vyvojari' ? Code2 : Boxes;
                    return (
                        <section key={id} className={styles.card}>
                            <Icon className="text-[#17386c]" aria-hidden="true" />
                            <h2 className="!my-3 !text-3xl">{community.name}</h2>
                            <p>{community.description}</p>
                            <Link href={community.path} className={styles.textLink}>
                                Vstoupit <span className="sr-only">do komunity {community.name}</span>
                                <ArrowUpRight size={16} aria-hidden="true" />
                            </Link>
                        </section>
                    );
                })}
            </div>
        </>
    );
}
