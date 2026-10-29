import { PavolPage } from '@/businesses/pavol/_PavolPage';
import { PAVOL_METADATA, createPavolStructuredData } from '@/businesses/pavol/pavolMetadata';
import { StructuredData } from '@/components/structured-data';
import { PavolMediaSection } from '@/businesses/pavol/PavolMediaSection';

export const metadata = PAVOL_METADATA.en;
export const revalidate = 3600;

export default function EnPavolPage() {
    return (
        <>
            <StructuredData nodes={[createPavolStructuredData('en')]} />
            <PavolPage language="en" media={<PavolMediaSection language="en" revalidateSeconds={revalidate} />} />
        </>
    );
}
