import { notFound } from 'next/navigation';
import { PavolAvatarLegalPage } from '@/businesses/pavol/PavolAvatarLegalPage';
import { AVATAR_LEGAL_VERSION, isAvatarLegalKind, loadAvatarLegalDocument } from '@/lib/legal/productLegalAvatar';
export function generateStaticParams() { return ['terms', 'privacy'].map((kind) => ({ kind, version: AVATAR_LEGAL_VERSION })); }
export async function generateMetadata({ params }: { params: Promise<{ kind: string; version: string }> }) {
    const {kind,version} = await params;
    if (!isAvatarLegalKind(kind) || version !== AVATAR_LEGAL_VERSION) return {};
    const value = loadAvatarLegalDocument(kind, 'cs', version);
    return { title: value.title, alternates: { canonical: 'https://pavolhejny.cz' + value.path }, robots: { index: false, follow: true } };
}
export default async function Page({ params }: { params: Promise<{ kind: string; version: string }> }) {
    const {kind,version} = await params;
    if (!isAvatarLegalKind(kind) || version !== AVATAR_LEGAL_VERSION) notFound();
    return <PavolAvatarLegalPage language="cs" kind={kind} />;
}
