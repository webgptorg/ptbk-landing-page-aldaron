import {
    getStripeConfigurationOrNull,
    isStripeTestSecretKey,
    STRIPE_SECRET_KEY_ENVIRONMENT_VARIABLE,
    STRIPE_WEBHOOK_SIGNING_SECRET_ENVIRONMENT_VARIABLE,
} from '@/lib/payments/stripeConfiguration';
import { afterEach, describe, expect, it } from 'vitest';

const ORIGINAL_ENVIRONMENT = { ...process.env };

afterEach(() => {
    process.env = { ...ORIGINAL_ENVIRONMENT };
});

describe('stripe configuration', () => {
    it('has no payment gate when no secret key was given', () => {
        delete process.env[STRIPE_SECRET_KEY_ENVIRONMENT_VARIABLE];

        expect(getStripeConfigurationOrNull()).toBeNull();
    });

    it('treats a blank secret key as no payment gate at all', () => {
        process.env[STRIPE_SECRET_KEY_ENVIRONMENT_VARIABLE] = '   ';

        expect(getStripeConfigurationOrNull()).toBeNull();
    });

    it('recognises the test gate by its own key', () => {
        expect(isStripeTestSecretKey('sk_test_51Example')).toBe(true);
        expect(isStripeTestSecretKey('sk_live_51Example')).toBe(false);
        expect(isStripeTestSecretKey('rk_test_51Example')).toBe(true);
        expect(isStripeTestSecretKey('rk_live_51Example')).toBe(false);
    });

    it('reads the key, the webhook secret and which gate it is', () => {
        process.env[STRIPE_SECRET_KEY_ENVIRONMENT_VARIABLE] = ' sk_test_51Example ';
        process.env[STRIPE_WEBHOOK_SIGNING_SECRET_ENVIRONMENT_VARIABLE] = 'whsec_Example';

        expect(getStripeConfigurationOrNull()).toEqual({
            secretKey: 'sk_test_51Example',
            webhookSigningSecret: 'whsec_Example',
            isTestMode: true,
        });
    });

    it('keeps a live gate without a webhook usable, which the return from the gate then confirms alone', () => {
        process.env[STRIPE_SECRET_KEY_ENVIRONMENT_VARIABLE] = 'sk_live_51Example';
        delete process.env[STRIPE_WEBHOOK_SIGNING_SECRET_ENVIRONMENT_VARIABLE];

        expect(getStripeConfigurationOrNull()).toEqual({
            secretKey: 'sk_live_51Example',
            webhookSigningSecret: null,
            isTestMode: false,
        });
    });
});
