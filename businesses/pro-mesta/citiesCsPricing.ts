import { PricingFootnote } from '@/components/pricing-section';
import { Building, Rocket, Shield } from 'lucide-react';

// TODO: !!! [🌆] `/pro-mesta` Figure out best pricing
// TODO: !!! [🌆] `/pro-mesta` Figure out the features
// TODO: !!! [🌆] `/pro-mesta` Better copy of `citiesCsPricing`

export const citiesCsPricingFootnotes: PricingFootnote[] = [
    {
        id: '*',
        text: 'AI úvazek odpovídá výkonu jednoho člověka na plný úvazek.',
    },
];

export const citiesCsPricing = [
    {
        name: 'Základní',
        priceMonthly: '2 000',
        priceYearly: '20 000',
        currency: 'Kč',
        period: 'měsíčně',
        description: 'Pro obce a města do 3 000 obyvatel.',
        icon: Building,
        iconName: 'Building',
        features: [
            'Až 1 000 normostran znalostí',
            'Až 100 dokumentů',
            '1 plný AI úvazek*',
            '10 AI agentů',
            //
        ],
        buttonText: 'Začít',
        popular: false,
    },
    {
        name: 'Standardní',
        priceMonthly: '10 000',
        priceYearly: '45 000',
        currency: 'Kč',
        period: 'měsíčně',
        description: 'Pro střední a větší města.',
        icon: Rocket,
        iconName: 'Rocket',
        features: [
            'Vše ve Standardu',
            'Až 10 000 normostran znalostí',
            'Až 1 000 dokumentů',
            '10 plných AI úvazků*',
            '100 AI agentů',
            'Vlastní integrace',
            'Prioritní podpora',
        ],
        buttonText: 'Domluvit konzultaci',
        popular: true,
    },
    {
        name: 'Pokročilý',
        priceMonthly: 'Dohodou',
        priceYearly: 'Dohodou',
        currency: '',
        period: 'na vyžádání',
        description: 'Pro rozsáhlé městské aplikace na míru.',
        icon: Shield,
        iconName: 'Shield',
        features: [
            'Vše v Pokročilém',
            'Neomezený počet AI agentů',
            'Nasazení na místě',
            'Vlastní integrace',
            'Vlastní SLA',
            'Prémiové zaškolení',
        ],
        buttonText: 'Probrat řešení',
        popular: false,
    },
];
