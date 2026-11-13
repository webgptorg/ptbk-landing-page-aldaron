import { APPROACH_COMPARISONS } from '@/businesses/new/approachComparisons';
import { ApproachComparisonPage } from '@/businesses/new/ApproachComparisonPage';
import { notFound } from 'next/navigation';
import { ComparisonPage } from '@/businesses/new/InformationPages';
import { COMPARISONS } from '@/businesses/new/comparisons';
import { newPageMetadata } from '@/businesses/new/newMetadata';
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams(){return [...COMPARISONS, ...APPROACH_COMPARISONS].map(({slug})=>({slug}));}
export async function generateMetadata({params}:Props){const {slug}=await params;const approach=APPROACH_COMPARISONS.find(item=>item.slug===slug);if(approach)return newPageMetadata(`srovnani/${slug}`,`Promptbook versus ${approach.name.cs}`,approach.difference.cs);const item=COMPARISONS.find(item=>item.slug===slug);return item?newPageMetadata(`srovnani/${slug}`,`Promptbook versus ${item.name}`,item.advantage.cs):{};}
export default async function Page({params}:Props){const {slug}=await params;if(APPROACH_COMPARISONS.some(item=>item.slug===slug))return <ApproachComparisonPage slug={slug}/>;if(!COMPARISONS.some(item=>item.slug===slug))notFound();return <ComparisonPage slug={slug}/>;}
