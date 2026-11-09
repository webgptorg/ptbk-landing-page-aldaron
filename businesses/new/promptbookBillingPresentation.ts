const crownAmount = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 });
const minorAmount = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' });

/** Matches the amount charged to a card while omitting zero minor units on whole-crown prices. */
export function formatPromptbookBillingAmount(amountMinor: number): string {
    return (amountMinor % 100 === 0 ? crownAmount : minorAmount).format(amountMinor / 100);
}
