import { Suspense } from 'react';
import { EconomicsCalculator } from '@/businesses/new/EconomicsCalculator';
import { CalculatorUrlSync } from '@/businesses/new/CalculatorUrlSync';
import { PageIntro } from '@/businesses/new/InformationPages';
import { newPageMetadata } from '@/businesses/new/newMetadata';
import s from '@/businesses/new/site.module.css';
export const metadata = newPageMetadata('kalkulacka','Kalkulačka nákladů a přínosů','Spočítejte celkové náklady vaší AI agendy nebo partnerské služby. Upravte předpoklady, sdílejte odkaz a stáhněte PDF výpočet.');
export default function Page(){return <><PageIntro title="Spočítejte si celý obrázek.">Licence, AI, provoz, váš čas i nasazení. Všechny předpoklady na jednom místě.</PageIntro><Suspense fallback={null}><CalculatorUrlSync/></Suspense><div className={s.calculatorPage}><EconomicsCalculator advanced/></div></>;}
