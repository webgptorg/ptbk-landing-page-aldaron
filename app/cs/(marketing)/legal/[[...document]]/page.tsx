import { LegalRoute, legalRouteMetadata, legalRouteParams } from '@/lib/legal/legalRoute';
type Props = { params: Promise<{ document?: string[] }> };
export const revalidate = 3600;
export function generateStaticParams() { return legalRouteParams('cs'); }
export async function generateMetadata({ params }: Props) { return legalRouteMetadata((await params).document ?? [], 'cs'); }
export default async function Page({ params }: Props) { return <LegalRoute parts={(await params).document ?? []} language="cs"/>; }
