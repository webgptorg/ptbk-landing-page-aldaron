import { PricingFootnote, PricingPlan } from '@/components/pricing-section';
import { Building, Gift, Rocket } from 'lucide-react';

export const hackathonFactoryPricingFootnotes: PricingFootnote[] = [
    {
        id: '*',
        text: 'Cena partnerství závisí na rozsahu podpory, formátu akce a náročnosti briefu. Úvodní konzultace je vždy zdarma.',
    },
];

export const hackathonFactoryPricing: PricingPlan[] = [
    {
        name: 'Zveřejnění zadání',
        priceMonthly: 'Zdarma',
        priceYearly: 'Zdarma',
        currency: '',
        period: 'bez závazků',
        description:
            'Pro firmy a organizace, které si chtějí nejdřív ověřit, jestli se jejich problém hodí pro sprint.',
        icon: Gift,
        iconName: 'Gift',
        features: [
            'Krátká úvodní konzultace',
            'Posouzení zadání',
            'Ujasnění rozsahu a očekávaného výstupu',
            'Schválené zadání pro účastníky',
        ],
        buttonText: 'Poslat problém',
        popular: false,
    },
    {
        name: 'Partnerství na hackathonu',
        priceMonthly: 'od 10 000',
        priceYearly: 'od 10 000',
        currency: 'Kč',
        period: 'dle rozsahu*',
        description: 'Pro firmy, které chtějí mít zadání připravené, odmoderované a zdokumentované.',
        icon: Rocket,
        iconName: 'Rocket',
        features: [
            'Příprava a vyladění zadání',
            'Představení problému účastníkům',
            'Moderování a mentoring během sprintu',
            'Přístup ke všem výstupům a prezentacím',
        ],
        buttonText: 'Domluvit partnerství',
        popular: true,
    },
    {
        name: 'Účast na hackathonu',
        priceMonthly: 'Zdarma',
        priceYearly: 'Zdarma',
        currency: '',
        period: 'za účast',
        description: 'Pro developery, designéry a technology, kteří chtějí řešit konkrétní problém z praxe.',
        icon: Building,
        iconName: 'Building',
        features: [
            'Výběr ze schválených zadání',
            'Konkrétní brief místo umělé výzvy',
            'Možnost ukázat práci na funkčním výstupu',
            'Možnost navazující spolupráce',
        ],
        buttonText: 'Registrovat se',
        popular: false,
    },
];
