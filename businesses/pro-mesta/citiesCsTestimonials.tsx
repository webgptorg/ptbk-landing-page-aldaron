import dariaHvizdalova from '@/public/people/daria-hvizdalova.jpeg';
import tomasStudenik from '@/public/people/tomas-studenik.jpg';
import { Testimonial } from '../../components/testimonials-section';

// TODO: !!! [🌆] `/pro-mesta` Testimonials for `citiesCsTestimonials`
// TODO: !!! [🌆] `/pro-mesta` Better copy of `citiesCsTestimonials`
// TODO: !!! [🌆] `/pro-mesta` Update the testimonial text according to our new Book 2.0 vision and cities

export const citiesCsTestimonials: Array<Testimonial> = [
    {
        name: 'Daria Hvizdalova',
        role: 'Ředitelka AI a vzdělávání, 42 London',
        testimonial: 'Programování ve vlastním jazyce s nástroji jako Promptbook přibližuje technologie lidem.',

        avatar: dariaHvizdalova,
    },
    {
        name: 'Tomas Studenik',
        role: 'Produktový manažer, Inovativní technologie',
        testimonial:
            'Promptbook dělá z programování tvůrčí proces dostupný každému. Pro člověka, kterého baví inovace, je to velká změna.',
        avatar: tomasStudenik,
    },
];
