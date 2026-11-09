/**
 * The secret key of the payment gate, which also decides whether it is the test gate or the live one
 */
export const STRIPE_SECRET_KEY_ENVIRONMENT_VARIABLE = 'STRIPE_SECRET_KEY';

/**
 * The secret every webhook of the gate is signed with, without which no payment event is believed
 */
export const STRIPE_WEBHOOK_SIGNING_SECRET_ENVIRONMENT_VARIABLE = 'STRIPE_WEBHOOK_SIGNING_SECRET';

/**
 * Prefix Stripe gives to every key of its test gate, where only test cards are accepted and no money moves
 */
export const STRIPE_TEST_SECRET_KEY_PREFIX = 'sk_test_';

export type StripeConfiguration = {
    readonly secretKey: string;

    /**
     * `null` while no webhook is configured, which leaves the return from the gate as the only way a payment is
     * confirmed
     */
    readonly webhookSigningSecret: string | null;
    readonly isTestMode: boolean;
};

export function isStripeTestSecretKey(secretKey: string): boolean {
    return secretKey.startsWith(STRIPE_TEST_SECRET_KEY_PREFIX) || secretKey.startsWith('rk_test_');
}

function readEnvironmentSecret(environmentVariableName: string): string | null {
    return process.env[environmentVariableName]?.trim() || null;
}

/**
 * Reads the payment gate this server was given, or `null` when it was given none.
 *
 * Note: A server without the gate is a normal state rather than a failure. Nothing about a payment is then offered,
 *       so a development or preview deployment never opens a checkout it cannot honour.
 */
export function getStripeConfigurationOrNull(): StripeConfiguration | null {
    const secretKey = readEnvironmentSecret(STRIPE_SECRET_KEY_ENVIRONMENT_VARIABLE);
    if (secretKey === null) {
        return null;
    }

    return {
        secretKey,
        webhookSigningSecret: readEnvironmentSecret(STRIPE_WEBHOOK_SIGNING_SECRET_ENVIRONMENT_VARIABLE),
        isTestMode: isStripeTestSecretKey(secretKey),
    };
}
