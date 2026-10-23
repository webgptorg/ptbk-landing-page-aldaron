import { notFound } from 'next/navigation';
import { AgendaPage } from '@/businesses/new/InformationPages';
import { SCENARIOS, type ScenarioId } from '@/businesses/new/economics';
import { newPageMetadata } from '@/businesses/new/newMetadata';
type Props = { params: Promise<{ scenario: string }> };
export function generateStaticParams(){return Object.keys(SCENARIOS).map(scenario=>({scenario}));}
export async function generateMetadata({params}:Props){const {scenario}=await params;if(!Object.prototype.hasOwnProperty.call(SCENARIOS,scenario))return {};const data=SCENARIOS[scenario as ScenarioId];return newPageMetadata(`agendy/${scenario}`,data.title,data.description);}
export default async function Page({params}:Props){const {scenario}=await params;if(!Object.prototype.hasOwnProperty.call(SCENARIOS,scenario))notFound();return <AgendaPage scenarioId={scenario as ScenarioId}/>;}
