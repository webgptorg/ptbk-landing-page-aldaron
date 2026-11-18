import type { ActiveDiscount, SubscriptionDiscountDuration } from './discountCode';
import { z } from 'zod';

/** Money in rules is in CZK; persisted quotes and Stripe amounts use integer haléře. */
export const discountPriceRuleSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('fixed'), amount: z.number().finite().min(0).max(1e9), currency: z.literal('CZK') }).strict(),
    z.object({ kind: z.literal('amount'), amount: z.number().finite().min(0).max(1e9), currency: z.literal('CZK') }).strict(),
    z.object({ kind: z.literal('formula'), expression: z.string().trim().min(1).max(500), currency: z.literal('CZK') }).strict(),
]);
export type DiscountPriceRule = z.infer<typeof discountPriceRuleSchema>;
export type DiscountPricing = { readonly percent: number; readonly priceRule?: DiscountPriceRule | null; readonly definitionVersion?: number };

export class DiscountCalculationError extends Error {
    constructor(message = 'Vzorec slevy není platný.') { super(message); this.name = 'DiscountCalculationError'; }
}

type Expression = (price: number) => number;
const bounded = (value: number): number => {
    if (!Number.isFinite(value) || Math.abs(value) > 1e15) throw new DiscountCalculationError('Výpočet slevy nemá platný konečný výsledek.');
    return value;
};

/** A bounded arithmetic grammar. No JavaScript, property access, assignment or external calls. */
export function compileDiscountFormula(source: string): Expression {
    if (source.length === 0 || source.length > 500) throw new DiscountCalculationError('Vzorec musí mít 1 až 500 znaků.');
    const tokens: string[] = [];
    let offset = 0;
    while (offset < source.length) {
        if (/\s/.test(source[offset])) { offset++; continue; }
        const match = /^(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[a-zA-Z_]+|[+\-*/%^(),])/.exec(source.slice(offset));
        if (!match) throw new DiscountCalculationError('Vzorec obsahuje nepovolený znak.');
        tokens.push(match[0]); offset += match[0].length;
        if (tokens.length > 256) throw new DiscountCalculationError('Vzorec je příliš složitý.');
    }
    let cursor = 0;
    let depth = 0;
    const expect = (token: string) => { if (tokens[cursor++] !== token) throw new DiscountCalculationError(); };
    const nested = (parse: () => Expression): Expression => {
        if (++depth > 32) throw new DiscountCalculationError('Vzorec je příliš hluboce vnořený.');
        const value = parse(); depth--; return value;
    };
    function primary(): Expression {
        const token = tokens[cursor++];
        if (token === undefined) throw new DiscountCalculationError();
        if (token === '(') { const value = nested(sum); expect(')'); return value; }
        if (/^(?:\d|\.)/.test(token)) {
            const value = bounded(Number(token)); return () => value;
        }
        if (token === 'price' || token === 'cena') return price => price;
        if (!['min', 'max', 'round', 'floor', 'ceil', 'abs'].includes(token)) throw new DiscountCalculationError(`Neznámý název ve vzorci: ${token}.`);
        expect('(');
        const args: Expression[] = [nested(sum)];
        while (tokens[cursor] === ',') { cursor++; args.push(nested(sum)); if (args.length > 16) throw new DiscountCalculationError(); }
        expect(')');
        if (['min', 'max'].includes(token) ? args.length < 2 : token === 'round' ? args.length > 2 : args.length !== 1) throw new DiscountCalculationError('Nesprávný počet argumentů funkce.');
        return price => {
            const values = args.map(arg => arg(price));
            if (token === 'min') return Math.min(...values);
            if (token === 'max') return Math.max(...values);
            if (token === 'abs') return Math.abs(values[0]);
            if (token === 'floor') return Math.floor(values[0]);
            if (token === 'ceil') return Math.ceil(values[0]);
            const digits = values[1] ?? 0;
            if (!Number.isInteger(digits) || Math.abs(digits) > 6) throw new DiscountCalculationError('Zaokrouhlení podporuje nejvýše 6 desetinných míst.');
            return bounded(Math.round(values[0] * 10 ** digits) / 10 ** digits);
        };
    }
    function power(): Expression {
        const left = primary();
        if (tokens[cursor] !== '^') return left;
        cursor++; const right = nested(unary); return price => bounded(left(price) ** right(price));
    }
    function unary(): Expression {
        if (tokens[cursor] === '+' || tokens[cursor] === '-') {
            const sign = tokens[cursor++]; const operand = nested(unary);
            return price => (sign === '-' ? -1 : 1) * operand(price);
        }
        return power();
    }
    function product(): Expression {
        let value = unary();
        while (['*', '/', '%'].includes(tokens[cursor])) {
            const operator = tokens[cursor++], left = value, right = unary();
            value = price => {
                const a = left(price), b = right(price);
                return bounded(operator === '*' ? a * b : operator === '/' ? a / b : a % b);
            };
        }
        return value;
    }
    function sum(): Expression {
        let value = product();
        while (tokens[cursor] === '+' || tokens[cursor] === '-') {
            const operator = tokens[cursor++], left = value, right = product();
            value = price => bounded(operator === '+' ? left(price) + right(price) : left(price) - right(price));
        }
        return value;
    }
    const expression = sum();
    if (cursor !== tokens.length) throw new DiscountCalculationError();
    return price => bounded(expression(price));
}

export function validateDiscountPriceRule(rule: DiscountPriceRule | null | undefined): void {
    if (!rule) return;
    const parsed = discountPriceRuleSchema.parse(rule);
    if (parsed.kind === 'formula') compileDiscountFormula(parsed.expression);
}

/** Legacy whole-crown offers retain their historical rounding; new rules always resolve to haléře. */
export function calculateDiscountedAmount(baseAmount: number, discount: DiscountPricing | null, legacyWholeCrowns = false): number {
    if (!Number.isSafeInteger(baseAmount) || baseAmount < 0) throw new DiscountCalculationError('Neplatná původní cena.');
    if (!discount) return baseAmount;
    const rule = discount.priceRule;
    if (!rule) {
        if (!Number.isFinite(discount.percent) || discount.percent < 0 || discount.percent > 100) throw new DiscountCalculationError();
        return baseAmount - (legacyWholeCrowns ? Math.round(baseAmount * discount.percent / 10000) * 100 : Math.round(baseAmount * discount.percent / 100));
    }
    const price = baseAmount / 100;
    const result = rule.kind === 'fixed' ? rule.amount : rule.kind === 'amount' ? price - rule.amount : compileDiscountFormula(rule.expression)(price);
    return Math.round(Math.min(price, Math.max(0, bounded(result))) * 100);
}

export function formatDiscountMoney(amountCzk: number, language: 'cs' | 'en' = 'cs'): string {
    return `${amountCzk.toLocaleString(language === 'cs' ? 'cs-CZ' : 'en-GB', { maximumFractionDigits: 2 })} Kč`;
}

/** Public copy describes an effect; a private formula never becomes customer-facing copy. */
export function describeDiscount(discount: DiscountPricing, language: 'cs' | 'en' = 'cs', finalAmount?: number): string {
    const rule = discount.priceRule;
    if (!rule) return language === 'cs' ? `Sleva ${discount.percent} %` : `${discount.percent}% discount`;
    if (rule.kind === 'fixed') return `${language === 'cs' ? 'Zvýhodněná cena' : 'Special price'} ${formatDiscountMoney((finalAmount ?? rule.amount * 100) / 100, language)}`;
    if (rule.kind === 'amount') return `${language === 'cs' ? 'Sleva' : 'Discount'} ${formatDiscountMoney(rule.amount, language)}`;
    return finalAmount === undefined ? (language === 'cs' ? 'Zvýhodněná cena' : 'Special price') :
        `${language === 'cs' ? 'Zvýhodněná cena' : 'Special price'} ${formatDiscountMoney(finalAmount / 100, language)}`;
}

export type DiscountSnapshot = {
    readonly version: 1;
    readonly definitionVersion: number;
    readonly code: string;
    readonly percent: number;
    readonly priceRule: DiscountPriceRule | null;
    readonly months: number | null;
    readonly currency: 'CZK';
    readonly baseAmount: number;
    readonly finalAmount: number;
};

export function createDiscountSnapshot(discount: (DiscountPricing & SubscriptionDiscountDuration & { code: string }) | null, baseAmount: number, legacyWholeCrowns = false): DiscountSnapshot | null {
    return discount && {
        version: 1, definitionVersion: discount.definitionVersion ?? 1, code: discount.code, percent: discount.percent,
        priceRule: discount.priceRule ? { ...discount.priceRule } : null, months: discount.subscriptionDiscountDurationMonths, currency: 'CZK',
        baseAmount, finalAmount: calculateDiscountedAmount(baseAmount, discount, legacyWholeCrowns),
    };
}

export const expectedDiscountSchema = z.object({
    percent: z.number().min(1).max(100), months: z.number().int().min(1).max(36).nullable(),
    priceRule: discountPriceRuleSchema.nullable().optional(),
    definitionVersion: z.number().int().positive().optional(),
    finalAmount: z.number().int().nonnegative().optional(),
});
export type ExpectedDiscount = z.infer<typeof expectedDiscountSchema>;

export function discountRuleKey(rule: DiscountPriceRule | null | undefined): string {
    return rule ? JSON.stringify([rule.kind, rule.currency, rule.kind === 'formula' ? rule.expression : rule.amount]) : 'percent';
}

export function discountSnapshotsEqual(a: DiscountSnapshot | null | undefined, b: DiscountSnapshot | null | undefined): boolean {
    if (!a || !b) return a == null && b == null;
    return a.version === b.version && a.definitionVersion === b.definitionVersion && a.code === b.code &&
        a.percent === b.percent && a.months === b.months && a.currency === b.currency &&
        a.baseAmount === b.baseAmount && a.finalAmount === b.finalAmount && discountRuleKey(a.priceRule) === discountRuleKey(b.priceRule);
}

export function createExpectedDiscount(discount: ActiveDiscount | null, baseAmount: number, legacyWholeCrowns = false): ExpectedDiscount | null {
    if (!discount) return null;
    const quote = { percent: discount.percent, months: discount.subscriptionDiscountDurationMonths };
    // Older pages and orders remain accepted byte-for-byte for legacy percentage definitions.
    return !discount.priceRule && discount.definitionVersion === undefined ? quote : {
        ...quote, priceRule: discount.priceRule ?? null, definitionVersion: discount.definitionVersion ?? 1,
        finalAmount: calculateDiscountedAmount(baseAmount, discount, legacyWholeCrowns),
    };
}

export function discountMatchesExpected(discount: ActiveDiscount | null, expected: ExpectedDiscount | null, baseAmount: number, legacyWholeCrowns = false): boolean {
    if (!discount || !expected) return discount === null && expected === null;
    return discount.percent === expected.percent && discount.subscriptionDiscountDurationMonths === expected.months &&
        discountRuleKey(discount.priceRule) === discountRuleKey(expected.priceRule) &&
        (expected.definitionVersion === undefined || expected.definitionVersion === (discount.definitionVersion ?? 1)) &&
        (expected.finalAmount === undefined || expected.finalAmount === calculateDiscountedAmount(baseAmount, discount, legacyWholeCrowns));
}

export function snapshotFromExpected(code: string | null, expected: ExpectedDiscount | null, baseAmount: number): DiscountSnapshot | null {
    return code && expected ? createDiscountSnapshot({ ...expected, code, subscriptionDiscountDurationMonths: expected.months }, baseAmount) : null;
}
