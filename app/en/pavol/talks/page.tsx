import { PavolTalkIndex } from '@/businesses/pavol/PavolTalkIndex';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { PAVOL_PAGE_DEFINITIONS } from '@/businesses/pavol/pavolMetadata';

export const revalidate = 3600;
export const metadata = createPageMetadata({
    ...PAVOL_PAGE_DEFINITIONS.en, path: '/en/pavol/talks',
    title: 'Talks and workshops | Pavol Hejný',
    languageAlternates: { cs: '/cs/pavol/talks', en: '/en/pavol/talks' },
});
export default function TalksPage() { return <PavolTalkIndex language="en" />; }
