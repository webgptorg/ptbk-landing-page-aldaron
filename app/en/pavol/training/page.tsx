import { PavolTrainingPage } from '@/businesses/pavol/PavolTrainingPage';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { PAVOL_PAGE_DEFINITIONS } from '@/businesses/pavol/pavolMetadata';

export const metadata = createPageMetadata({
    ...PAVOL_PAGE_DEFINITIONS.en, path: '/en/pavol/training',
    title: 'Talks and training | Pavol Hejný', description: 'Practical AI talks and workshops for companies and developers.',
    socialTitle: 'Talks and training | Pavol Hejný', socialDescription: 'Practical AI talks and workshops for companies and developers.',
    socialPreviewImageAlt: 'Talks and training | Pavol Hejný', openGraphType: 'website',
    languageAlternates: { cs: '/cs/pavol/training', en: '/en/pavol/training' },
});
export default function TrainingPage() { return <PavolTrainingPage language="en" />; }
