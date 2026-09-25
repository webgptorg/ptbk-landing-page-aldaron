import { PAVOL_LAYOUT_METADATA, PAVOL_VIEWPORT } from '@/businesses/pavol/pavolMetadata';

export const metadata = PAVOL_LAYOUT_METADATA;
export const viewport = PAVOL_VIEWPORT;

export default function CsPavolLayout({ children }: { children: React.ReactNode }) {
    return children;
}
