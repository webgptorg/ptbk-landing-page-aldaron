import { describe, expect, it } from 'vitest';
import { ALTERNATIVE_COMMERCIAL_TERMS } from './comparisonCommercial';
import { comparisonPrice, displayComparisonPrice } from './comparisonPrices';

const readable = (value: string) => value.replaceAll('\u00a0', ' ');

describe('comparison price conversion', () => {
    it('converts USD examples to CZK without changing billing terms', () => {
        const price = ALTERNATIVE_COMMERCIAL_TERMS['google-workspace'].price;
        expect(readable(displayComparisonPrice(price, 'cs', 'converted').cs))
            .toBe('Business Starter: ≈ 153 Kč/měs. při ročním závazku');
        expect(readable(displayComparisonPrice(price, 'cs', 'original').cs))
            .toBe('Business Starter: 7 USD/měs. při ročním závazku');
    });

    it('uses the EUR/CZK and EUR/USD cross rates for n8n, including its free tier', () => {
        const price = ALTERNATIVE_COMMERCIAL_TERMS.n8n.price;
        expect(readable(displayComparisonPrice(price, 'cs', 'converted').cs))
            .toBe('Community: 0 Kč · Cloud Starter: ≈ 488 Kč/měs. při roční platbě');
        expect(displayComparisonPrice(price, 'en', 'converted').en)
            .toBe('Community: $0 · Cloud Starter: ≈ $22.25/mo billed annually');
        expect(displayComparisonPrice(price, 'en', 'original').en)
            .toBe('Community: €0 · Cloud Starter: €20/mo billed annually');
    });

    it('preserves prices already in the selected currency and non-numeric offers', () => {
        const price = ALTERNATIVE_COMMERCIAL_TERMS.chatgpt.price;
        expect(displayComparisonPrice(price, 'en', 'converted').en).toBe(price.en);
        expect(displayComparisonPrice(ALTERNATIVE_COMMERCIAL_TERMS['openai-dots'].price, 'cs', 'converted').cs)
            .toBe('V ceně způsobilého tarifu');
        expect(readable(displayComparisonPrice(comparisonPrice('{0}', '{0}', 'CZK', [399]), 'en', 'converted').en))
            .toBe('≈ $18.21');
    });
});
