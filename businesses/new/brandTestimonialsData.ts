import type { StaticImageData } from 'next/image';
import type { SiteLocale } from './localization';

export type BrandTestimonial = {
    readonly name: string;
    readonly role: string;
    readonly testimonial: string;
    readonly avatar: StaticImageData;
};
import bobKartous from '@/public/pavol/testimonials/bob-kartous.png';
import janSedo from '@/public/pavol/testimonials/jan-sedo.png';
import maxKozlov from '@/public/pavol/testimonials/max-kozlov.png';
import terezaTexlova from '@/public/pavol/testimonials/tereza-texlova.png';
import tomasStudenik from '@/public/pavol/testimonials/tomas-studenik.png';

/** Independent, owner-approved copy of the personal-site references, 23 October 2026.
 * Keep the original quotations and attribution. Future Promptbook references are edited here.
 */
export const brandTestimonials: Record<SiteLocale, readonly BrandTestimonial[]> = {
    cs: [
        {
            name: 'Tomáš Studeník',
            role: 'Startupper',
            testimonial:
                'Pavola znám šest let, hlavně z hackathonů a dalších inovačních projektů. Když se účastnil se svým týmem, mohli jste si vsadit, že skončí mezi prvními třemi. A taky že ano. Pavol se vyzná v nových technologiích a umí rychle najít řešení pro průmysl, vzdělávání i rozvoj měst.',
            avatar: tomasStudenik,
        },
        {
            name: 'Jan Šedo',
            role: 'Zakladatel H-edu',
            testimonial:
                'Pavol vytvořil prototyp naší aplikace H-edu a díky němu jsme hned získali investici. Potom navrhl architekturu systému i technologie, které se ukázaly jako správná volba i s odstupem času.',
            avatar: janSedo,
        },
        {
            name: 'Max Kozlov',
            role: 'Founder & CEO, Undout',
            testimonial:
                'Pavol umí stavět digitální produkty. Viděl jsem ho přes noc vytvořit integrovaného chatbota, se kterým jsme vyhráli Startup Weekend v Praze. Dokáže rychle vzít nové téma nebo technologii a postavit na něm fungující produkt.',
            avatar: maxKozlov,
        },
        {
            name: 'Bob Kartous',
            role: 'Prorektor VŠEM a autor',
            testimonial:
                'Pavol je schopný inovátor, který propojuje digitální technologie se společenskými tématy. V projektech, na kterých pracoval, přinesl do vzdělávání nové nápady a postupy.',
            avatar: bobKartous,
        },
        {
            name: 'Tereza Texlová',
            role: 'Spoluzakladatelka Czech.events',
            testimonial:
                'Pavol spojuje technické dovednosti s veřejným vystupováním a umí rozjet nové nápady. Těším se na náš další projekt.',
            avatar: terezaTexlova,
        },
    ],
    en: [
        {
            name: 'Tomáš Studeník',
            role: 'Startupper',
            testimonial:
                'I have known Pavol for six years, mostly through hackathons and other innovation projects. When Pavol entered with his team, you could bet on them finishing in the top three. They did. He understands new technology and quickly finds solutions for industry, education, and city development.',
            avatar: tomasStudenik,
        },
        {
            name: 'Jan Šedo',
            role: 'Founder of H-edu',
            testimonial:
                'Pavol built the prototype for our H-edu app, which helped us secure investment right away. He then designed the system architecture and picked technologies that have proved to be the right choices over time.',
            avatar: janSedo,
        },
        {
            name: 'Max Kozlov',
            role: 'Founder & CEO, Undout',
            testimonial:
                'Pavol builds digital products. I watched him create an integrated chatbot overnight. It won us first place at Startup Weekend in Prague. He can pick up a new topic or technology quickly and turn it into something that works.',
            avatar: maxKozlov,
        },
        {
            name: 'Bob Kartous',
            role: 'Vice-Rector at VŠEM and author',
            testimonial:
                'Pavol connects digital technology with social issues. In the projects he worked on, he brought fresh ideas and approaches to education.',
            avatar: bobKartous,
        },
        {
            name: 'Tereza Texlová',
            role: 'Co-founder, Czech.events',
            testimonial:
                'Pavol combines technical skill with public speaking and knows how to get new ideas off the ground. I am looking forward to our next project.',
            avatar: terezaTexlova,
        },
    ],
};

/** Existing Promptbook reference, kept separate from collaboration with its cofounder. */
export const universityTestimonial = {
    cs: {
        name: 'Slezská univerzita v Opavě',
        role: 'IT oddělení',
        testimonial: 'Promptbook nás od sebe neodstřihl. Naopak. Konečně máme čas řešit opravdovou práci, za kterou jsme placeni.',
    },
    en: {
        name: 'Silesian University in Opava',
        role: 'IT department',
        testimonial: "Promptbook didn't cut us off from each other. The opposite. We finally have time for the real work we're paid to do.",
    },
} satisfies Record<SiteLocale, Omit<BrandTestimonial, 'avatar'>>;
