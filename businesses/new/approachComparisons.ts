/** Process-level choices, not claims about a named competitor or guaranteed savings. */
export const APPROACH_COMPARISONS = [
    {
        slug: 'vlastni-reseni',
        name: { cs: 'Vlastní řešení', en: 'Custom solution' },
        difference: {
            cs: 'Promptbook dodává společný základ pro dlouhodobou práci agentů. Vlastní řešení vám dovolí navrhnout celý systém pro velmi specifický proces.',
            en: 'Promptbook supplies a shared foundation for ongoing agent work. A custom solution lets you design the complete system for a highly specific process.',
        },
        alternative: {
            cs: 'Když potřebujete pevně definované chování, přesné integrace či vlastní produkt a máte tým pro vývoj, provoz a údržbu.',
            en: 'When you need tightly defined behavior, specific integrations or your own product and have a team to build, operate and maintain it.',
        },
        example: {
            cs: 'U péče o kontakty vlastní řešení přesně zakóduje pravidla a napojení. S Promptbookem tým pracuje podle zadání, navazuje na nové podklady a řeší výjimky; integrace, oprávnění i kontrolu kvality musíte připravit v obou případech.',
            en: 'For contact care, a custom solution encodes the rules and integrations precisely. A Promptbook team follows instructions, builds on new inputs and handles exceptions; both approaches still require integration setup, permissions and quality review.',
        },
    },
    {
        slug: 'clovek',
        name: { cs: 'Člověk, asistent či brigádník', en: 'Human assistant' },
        difference: {
            cs: 'Člověk přináší úsudek, vztahy a odpovědnost. Tým agentů může průběžně připravovat a zpracovávat rutinní práci v nastavených mezích.',
            en: 'A person brings judgment, relationships and accountability. An agent team can continuously prepare and process routine work within configured boundaries.',
        },
        alternative: {
            cs: 'Když práce stojí na osobních vztazích, citlivém rozhodování, fyzické přítomnosti nebo odpovědnosti, kterou nemůžete předat AI.',
            en: 'When work depends on personal relationships, sensitive judgment, physical presence or accountability you cannot delegate to AI.',
        },
        example: {
            cs: 'Při správě podcastu mohou agenti hlídat podklady a připravovat opakované výstupy. Člověk vybírá hosty, vede rozhovor a posuzuje citlivé publikace. Smysl často dává společná práce, nikoli úplná náhrada člověka.',
            en: 'For a podcast, agents can track materials and prepare recurring outputs. A person selects guests, conducts interviews and reviews sensitive publications. Working together often fits better than replacing a person entirely.',
        },
    },
] as const;
