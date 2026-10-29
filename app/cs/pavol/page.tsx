import { PavolPage } from '@/businesses/pavol/_PavolPage';
import { PAVOL_METADATA, createPavolStructuredData } from '@/businesses/pavol/pavolMetadata';
import { StructuredData } from '@/components/structured-data';
import { PavolMediaSection } from '@/businesses/pavol/PavolMediaSection';

export const metadata = PAVOL_METADATA.cs;
export const revalidate = 3600;

export default function CsPavolPage() {
    return (
        <>
            <StructuredData nodes={[createPavolStructuredData('cs')]} />
            <PavolPage language="cs" media={<PavolMediaSection language="cs" revalidateSeconds={revalidate} />} />
        </>
    );
}
