'use client';

import Image from 'next/image';
import technologyIncubationSponsor from '@/public/sponsors/CI-Technology-Incubation.png';
import { useSiteLocale } from './LocaleProvider';
import s from './technology-incubation.module.css';

/** Preserves the existing funding acknowledgement and original sponsor artwork. */
export function TechnologyIncubation() {
    const { locale } = useSiteLocale();

    return (
        <div className={s.sponsorship}>
            <Image
                src={technologyIncubationSponsor}
                alt={locale === 'cs' ? 'CzechInvest — Technologická inkubace' : 'CzechInvest — Technology Incubation'}
                className={s.logo}
                sizes="200px"
            />
            <p className={s.acknowledgement}>
                {locale === 'cs'
                    ? 'Tento projekt byl realizován za finanční podpory z národního rozpočtu prostřednictvím Ministerstva průmyslu a obchodu České republiky v rámci programu CzechInvest Technologická inkubace.'
                    : 'This project was implemented with funding from the national budget via the Ministry of Industry and Trade of the Czech Republic within the CzechInvest Technology Incubation programme.'}
            </p>
        </div>
    );
}
