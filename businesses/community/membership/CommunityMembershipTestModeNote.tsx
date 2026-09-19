import { FlaskConical } from 'lucide-react';

/**
 * The card the test gate of Stripe accepts, which is public documentation rather than a secret of this application
 *
 * @see https://docs.stripe.com/testing
 */
const STRIPE_TEST_CARD_NUMBER = '4242 4242 4242 4242';

type CommunityMembershipTestModeNoteProps = {
    readonly isPaymentInTestMode: boolean;
};

/**
 * Says out loud that this payment gate is the test one, so a rehearsal is never mistaken for a real payment.
 *
 * Note: A gate running on live keys says nothing at all, so nothing about testing can ever be read by a member who is
 *       really paying.
 */
export function CommunityMembershipTestModeNote({ isPaymentInTestMode }: CommunityMembershipTestModeNoteProps) {
    if (!isPaymentInTestMode) {
        return null;
    }

    return (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-room-warning/25 bg-room-warning/[0.08] px-3 py-2.5 text-xs leading-5 text-room-warning">
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
                Testovací režim platební brány – žádné peníze se nestrhnou. Zaplaťte kartou{' '}
                <strong className="font-semibold">{STRIPE_TEST_CARD_NUMBER}</strong>, libovolným datem v budoucnosti a
                libovolným CVC.
            </span>
        </p>
    );
}
