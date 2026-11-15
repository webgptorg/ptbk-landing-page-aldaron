import { PavolTrainingPage } from '@/businesses/pavol/PavolTrainingPage';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { PAVOL_PAGE_DEFINITIONS } from '@/businesses/pavol/pavolMetadata';

export const metadata = createPageMetadata({
    ...PAVOL_PAGE_DEFINITIONS.cs, path: '/cs/pavol/training',
    title: 'Přednášky a školení | Pavol Hejný', description: 'Praktické přednášky a workshopy o AI pro firmy a vývojáře.',
    socialTitle: 'Přednášky a školení | Pavol Hejný', socialDescription: 'Praktické přednášky a workshopy o AI pro firmy a vývojáře.',
    socialPreviewImageAlt: 'Přednášky a školení | Pavol Hejný', openGraphType: 'website',
    languageAlternates: { cs: '/cs/pavol/training', en: '/en/pavol/training' },
});
export default function TrainingPage() { return <PavolTrainingPage language="cs" />; }
