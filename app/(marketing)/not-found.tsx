'use client';
import { useSiteLocale } from '@/businesses/new/LocaleProvider';
import Link from 'next/link';
import { PageIntro } from '@/businesses/new/InformationPages';
import { sitePath } from '@/businesses/new/siteConfig';
import s from '@/businesses/new/site.module.css';
export default function NotFound(){const {t,path}=useSiteLocale();return <><PageIntro title="Tuhle stránku jsme nenašli.">Vraťte se k přehledu agend nebo se podívejte na hlavní stránku.</PageIntro><div className={s.actions}><Link className={s.button} href={path()}>{t('Na úvod Promptbooku')}</Link><Link className={s.secondaryButton} href={path('agendy')}>{t('Prohlédnout agendy')}</Link></div></>;}
