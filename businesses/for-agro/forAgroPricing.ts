import { PricingFootnote } from '@/components/pricing-section';
import { Building, Rocket, Shield } from 'lucide-react';

export const forAgroPricingFootnotes: PricingFootnote[] = [
    {
        id: '*',
        text: 'AI úvazek odpovídá práci jednoho člověka na plný úvazek při znalostní a administrativní práci.',
    },
];

export const forAgroPricing = [
    {
        name: 'Pilot',
        priceMonthly: '3 500',
        priceYearly: '35 000',
        currency: 'Kč',
        period: 'měsíčně',
        description: 'Pro menší agronomický tým nebo jednu oblast. Přínos ověříte rychle.',
        icon: Building,
        iconName: 'Building',
        features: [
            'Až 1 000 normostran znalostí',
            'Až 100 dokumentů',
            '1 plný AI úvazek*',
            '10 AI agentů',
            'Základní webová a chatová integrace',
        ],
        buttonText: 'Začít',
        popular: false,
    },
    {
        name: 'Provoz',
        priceMonthly: '8 900',
        priceYearly: '89 000',
        currency: 'Kč',
        period: 'měsíčně',
        description: 'Pro firmy, které sdílejí know-how mezi více lokalitami a regiony.',
        icon: Rocket,
        iconName: 'Rocket',
        features: [
            'Vše v Pilotu',
            'Až 10 000 normostran znalostí',
            'Až 1 000 dokumentů',
            '10 plných AI úvazků*',
            '100 AI agentů',
            'Integrace e-mailu a interních pracovních postupů',
            'Prioritní podpora',
        ],
        buttonText: 'Spustit pilot',
        popular: true,
    },
    {
        name: 'Enterprise',
        priceMonthly: 'Dohodou',
        priceYearly: 'Dohodou',
        currency: '',
        period: 'na vyžádání',
        description: 'Na míru pro velké zemědělské skupiny s vlastním provozem, compliance a systémy.',
        icon: Shield,
        iconName: 'Shield',
        features: [
            'Vše v Provozu',
            'Neomezený počet AI agentů',
            'Nasazení on-premise nebo ve vyhrazeném cloudu',
            'Vlastní integrace do ERP, CRM a skladových systémů',
            'Vlastní SLA a auditní podpora',
            'Zaškolení a uvedení do provozu',
        ],
        buttonText: 'Kontaktovat',
        popular: false,
    },
];
