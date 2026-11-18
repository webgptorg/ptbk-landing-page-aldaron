'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { calculateDiscountedAmount, describeDiscount, formatDiscountMoney, type DiscountPriceRule } from '@/lib/discounts/discountPricing';

export function DiscountPriceRuleEditor({ rule, percent, onRuleChange, onPercentChange }: {
    rule: DiscountPriceRule | null; percent: number;
    onRuleChange: (rule: DiscountPriceRule | null) => void; onPercentChange: (percent: number) => void;
}) {
    const [basePrice, setBasePrice] = useState(5000);
    const kind = rule?.kind ?? 'percent';
    let preview = '', error = '';
    try {
        const amount = calculateDiscountedAmount(Math.round(basePrice * 100), { percent, priceRule: rule });
        preview = `${formatDiscountMoney(basePrice)} → ${formatDiscountMoney(amount / 100)} · ${describeDiscount({ percent, priceRule: rule }, 'cs', amount)}`;
    } catch (failure) { error = failure instanceof Error ? failure.message : 'Neplatný výpočet.'; }
    return <fieldset className="space-y-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        <legend className="px-1 font-semibold text-slate-950">Výpočet ceny</legend>
        <label className="block font-medium">Typ slevy
            <select className="mt-2 block w-full rounded-md border border-slate-300 bg-white p-2" value={kind} onChange={event => {
                const next = event.target.value;
                onRuleChange(next === 'percent' ? null : next === 'formula' ? { kind: 'formula', expression: 'price * 0.01 + 1', currency: 'CZK' } :
                    { kind: next as 'fixed' | 'amount', amount: next === 'fixed' ? 20 : 100, currency: 'CZK' });
            }}>
                <option value="percent">Procentní sleva</option><option value="fixed">Pevná výsledná cena</option>
                <option value="amount">Odečtení částky</option><option value="formula">Vlastní matematický vzorec</option>
            </select>
        </label>
        {rule === null ? <label className="block font-medium">Sleva v procentech
            <Input className="mt-2" type="number" min={1} max={100} value={percent} onChange={event => onPercentChange(Number(event.target.value))} required />
        </label> : rule.kind === 'formula' ? <label className="block font-medium">Vzorec výsledné ceny v Kč
            <Input className="mt-2 font-mono" value={rule.expression} maxLength={500} spellCheck={false} onChange={event => onRuleChange({ ...rule, expression: event.target.value })} required />
            <span className="mt-2 block text-xs font-normal">Původní cena: <code>price</code> nebo <code>cena</code>. Operace + − * / % ^, závorky, min, max, round, floor, ceil, abs. Desetinná tečka. Např. <code>price * 0.7 + 1</code> nebo <code>min(price, 20)</code>.</span>
        </label> : <label className="block font-medium">{rule.kind === 'fixed' ? 'Výsledná cena v Kč' : 'Odečíst Kč'}
            <Input className="mt-2" type="number" min={0} max={1e9} step="0.01" value={Number.isFinite(rule.amount) ? rule.amount : ''} onChange={event => onRuleChange({ ...rule, amount: event.target.value === '' ? NaN : Number(event.target.value) })} required />
        </label>}
        <p className="text-xs text-slate-500">Výsledkem je cena k zaplacení v Kč, omezená na 0 až původní cenu a zaokrouhlená na haléře. Úprava kódu ovlivní nové nákupy; přijaté objednávky si zachovají vlastní podmínky.</p>
        <label className="block font-medium">Původní cena pro náhled v Kč
            <Input className="mt-2 max-w-xs" type="number" min={0} max={1e9} step="0.01" value={basePrice} onChange={event => setBasePrice(Number(event.target.value))} />
        </label>
        <p aria-live="polite" className={error ? 'text-red-700' : 'font-medium text-emerald-800'}>{error || preview}</p>
        <p className="text-xs text-slate-500">Nenulovou cenu pod 15 Kč lze nastavit, ale současná platba kartou ji nepřijme. Cena se automaticky nezvýší.</p>
    </fieldset>;
}
