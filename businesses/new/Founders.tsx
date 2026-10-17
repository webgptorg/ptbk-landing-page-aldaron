'use client';

import { useSiteLocale } from './LocaleProvider';
import Image from 'next/image';
import { LeadButton } from './LeadCapture';
import s from './site.module.css';

/** Equal cofounder prominence; photos and email addresses are the existing site's public assets. */
export function Founders() {
    const { t, locale, path } = useSiteLocale();

    return <div className={s.founders}>
        {[{ name: 'Jiří Jahn', role: 'Spoluzakladatel · obchod', image: 'jiri-jahn', email: 'jiri@ptbk.io', description: 'Řeší partnerství, obchodní spolupráci a to, aby nasazení dávalo firmě smysl.', action: 'Probrat spolupráci' },
          { name: 'Pavol Hejný', role: 'Spoluzakladatel · technologie', image: 'pavol-hejny', email: 'pavol@ptbk.io', description: 'Staví technologii Promptbooku a řeší architekturu, vývoj a technické nasazení.', action: 'Probrat technologii' }].map(person => <article className={s.founder} key={person.name}>
            <div className={s.founderPortrait}><Image src={`/people/${person.image}-transparent.png`} width={320} height={360} alt={person.name} /></div><div><h3>{t(person.name)}</h3><strong>{t(person.role)}</strong><p>{t(person.description)}</p><span className={s.founderEmail}>{t(person.email)}</span><LeadButton secondary topic={t(`${person.name} — ${t(person.action)}`)}>{t(person.action)}</LeadButton></div>
        </article>)}
    </div>;
}
