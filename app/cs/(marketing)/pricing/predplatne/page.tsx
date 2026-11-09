import { PromptbookMembers } from '@/businesses/new/PromptbookMembers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Moje předplatné Promptbook',
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
};

type MembersPageProps = {
    readonly searchParams: Promise<{ stav?: string }>;
};

export default async function MembersPage({ searchParams }: MembersPageProps) {
    const query = await searchParams;
    return <PromptbookMembers confirming={query.stav === 'potvrzuji'} />;
}
