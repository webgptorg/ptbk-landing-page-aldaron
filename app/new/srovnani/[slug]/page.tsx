import { notFound } from 'next/navigation';
import { ComparisonPage } from '@/businesses/new/InformationPages';
import { COMPARISONS } from '@/businesses/new/comparisons';
import { newPageMetadata } from '@/businesses/new/newMetadata';
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams(){return COMPARISONS.map(({slug})=>({slug}));}
export async function generateMetadata({params}:Props){const {slug}=await params;const item=COMPARISONS.find(item=>item.slug===slug);return item?newPageMetadata(`srovnani/${slug}`,`Promptbook a ${item.name}`,item.question):{};}
export default async function Page({params}:Props){const {slug}=await params;if(!COMPARISONS.some(item=>item.slug===slug))notFound();return <ComparisonPage slug={slug}/>;}
