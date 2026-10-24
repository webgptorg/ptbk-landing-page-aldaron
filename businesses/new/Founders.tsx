'use client';

import { Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import { useSiteLocale } from './LocaleProvider';
import { LeadButton } from './LeadCapture';
import s from './founders.module.css';

/** Public contacts and original portrait assets from components/team-section.tsx. */
const founders = [
    {
        name: 'Jiří Jahn',
        role: 'Spoluzakladatel · obchod',
        image: 'jiri-jahn',
        email: 'jiri@ptbk.io',
        phone: '+420 777 090 067',
        phoneHref: '+420777090067',
        description: 'Řeší partnerství, obchodní spolupráci a to, aby nasazení dávalo firmě smysl.',
        action: 'Probrat spolupráci',
    },
    {
        name: 'Pavol Hejný',
        role: 'Spoluzakladatel · technologie',
        image: 'pavol-hejny',
        email: 'pavol@ptbk.io',
        phone: '+420 777 759 767',
        phoneHref: '+420777759767',
        description: 'Staví technologii Promptbooku a řeší architekturu, vývoj a technické nasazení.',
        action: 'Probrat technologii',
    },
] as const;

/** Equal, mirrored cards: both portraits end at the bottom of their card. */
export function Founders({ compact = false }: { compact?: boolean }) {
    const { t } = useSiteLocale();

    return (
        <div className={s.founders}>
            {founders.map((person, index) => (
                <article className={`${s.founder} ${index === 1 ? s.reverse : ''}`} key={person.name} data-testid="founder-card">
                    <div className={s.portrait}>
                        <Image
                            src={`/people/${person.image}-transparent.png`}
                            width={person.image === 'jiri-jahn' ? 669 : 545}
                            height={person.image === 'jiri-jahn' ? 1080 : 950}
                            alt={person.name}
                            sizes="(max-width: 500px) 40vw, (max-width: 900px) 220px, 240px"
                        />
                    </div>
                    <div className={s.content}>
                        <h3>{person.name}</h3>
                        <p className={s.role}>{t(person.role)}</p>
                        {!compact && <p className={s.description}>{t(person.description)}</p>}
                        <address className={s.contacts}>
                            <a href={`mailto:${person.email}`}><Mail size={15} aria-hidden="true" />{person.email}</a>
                            <a href={`tel:${person.phoneHref}`}><Phone size={15} aria-hidden="true" />{person.phone}</a>
                        </address>
                        <LeadButton secondary className={s.action} topic={`${person.name} — ${t(person.action)}`}>
                            {t(person.action)}
                        </LeadButton>
                    </div>
                </article>
            ))}
        </div>
    );
}
