import Link from 'next/link';
import { PageIntro } from '@/businesses/new/InformationPages';
import { sitePath } from '@/businesses/new/siteConfig';
import s from '@/businesses/new/site.module.css';
export default function NotFound(){return <><PageIntro title="Tuhle stránku jsme nenašli.">Vraťte se k přehledu agend nebo se podívejte na hlavní stránku.</PageIntro><div className={s.actions}><Link className={s.button} href={sitePath()}>Na úvod Promptbooku</Link><Link className={s.secondaryButton} href={sitePath('agendy')}>Prohlédnout agendy</Link></div></>;}
