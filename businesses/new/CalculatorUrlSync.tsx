'use client';

import { useSiteLocale } from './LocaleProvider';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculatorPath, parseCalculatorState } from './calculatorState';

/** Materialize even an untouched default example in GET; discard unknown/identity/commercial override fields. */
export function CalculatorUrlSync() {
    const { locale } = useSiteLocale();
    const params = useSearchParams();
    const key = params.toString();
    useEffect(() => {
        const next = calculatorPath(parseCalculatorState(new URLSearchParams(key)), locale);
        if (`${window.location.pathname}${window.location.search}` !== next) {
            window.history.replaceState(window.history.state, '', next);
        }
    }, [key, locale]);
    return null;
}
