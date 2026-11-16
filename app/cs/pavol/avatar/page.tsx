import { PavolAvatarPage } from '@/businesses/pavol/PavolAvatarPage';
import { createPavolAvatarMetadata } from '@/businesses/pavol/pavolAvatarMetadata';

export const dynamic = 'force-dynamic';
export const metadata = createPavolAvatarMetadata('cs');
export default function AvatarPage() { return <PavolAvatarPage language="cs" />; }
