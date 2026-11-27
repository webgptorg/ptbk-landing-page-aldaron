import { PavolGallery } from '@/businesses/pavol/PavolGallery';
import { PAVOL_PAGE_DEFINITIONS } from '@/businesses/pavol/pavolMetadata';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';

export const metadata = createPageMetadata({
    ...PAVOL_PAGE_DEFINITIONS.cs,
    path: '/cs/pavol/gallery',
    title: 'Fotogalerie | Pavol Hejný',
    languageAlternates: { cs: '/cs/pavol/gallery', en: '/en/pavol/gallery' },
});

export default function GalleryPage() {
    return <PavolGallery language="cs" />;
}
