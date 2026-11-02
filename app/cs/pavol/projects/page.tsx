import { PavolProjectIndex } from '@/businesses/pavol/PavolProjectIndex';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { PAVOL_PAGE_DEFINITIONS } from '@/businesses/pavol/pavolMetadata';

export const metadata = createPageMetadata({
    ...PAVOL_PAGE_DEFINITIONS.cs, path: '/cs/pavol/projects',
    title: 'Projekty | Pavol Hejný',
    languageAlternates: { cs: '/cs/pavol/projects', en: '/en/pavol/projects' },
});
export default function ProjectsPage() { return <PavolProjectIndex language="cs" />; }
