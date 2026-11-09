/**
 * What the community says about a membership which could not be bought, read once by every endpoint of the membership
 * so that a member never meets two different words for the same refusal.
 */
export const COMMUNITY_MEMBERSHIP_MESSAGES = {
    emailVerificationRequired: 'Nejdříve ověřte e-mail pro přístup k placenému členství.',
    membershipNotLoaded: 'Členství se teď nepodařilo načíst. Zkuste stránku obnovit.',
    membershipNotOfferedInRoom: 'Členství se v této místnosti nespravuje.',
    connectionExpired: 'Připojení do místnosti vypršelo. Obnovte prosím stránku a připojte se znovu.',
    paymentGateUnavailable: 'Platební brána teď není nastavená. Zkuste to prosím později.',
    paymentNotOpened: 'Platbu se nepodařilo otevřít. Zkuste to prosím znovu.',
    paymentStillProcessing: 'Předchozí platba se ještě zpracovává. Zkuste to prosím za chvíli znovu.',
    paymentNotConfirmed: 'Platbu se nepodařilo ověřit. Zkuste to prosím za chvíli znovu.',
    membershipAlreadyPaid: 'Placené členství už máte aktivní.',
    membershipNotRedeemed: 'Členství se slevovým kódem nepodařilo aktivovat. Zkuste to prosím znovu.',
    membershipCannotBeManaged: 'Toto placené členství se teď nepodařilo spravovat. Zkuste to prosím později.',
    membershipPortalNotOpened: 'Správu plateb ve Stripe se teď nepodařilo otevřít. Zkuste to prosím znovu.',
    membershipCancellationNotChanged: 'Zrušení placeného členství se teď nepodařilo uložit. Zkuste to prosím znovu.',
    membershipReactivationNotChanged: 'Obnovení placeného členství se teď nepodařilo uložit. Zkuste to prosím znovu.',
    discountCodeNotLoaded: 'Slevový kód se nepodařilo ověřit. Zkuste to prosím znovu.',
    discountCodeNotActive: 'Slevový kód už zde není aktivní. Odstraňte jej nebo použijte jiný a zkontrolujte cenu.',
    discountCodeNotUsable: 'Použijte platný slevový kód, nebo pole nechte prázdné.',
    termsNotAccepted: 'Potvrďte prosím obchodní podmínky.',
} as const;
