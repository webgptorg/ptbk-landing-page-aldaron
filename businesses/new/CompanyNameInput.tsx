'use client';

import { sendJson } from '@/lib/api/requestJson';
import type { PromptbookBillingIdentity } from '@/lib/promptbook-billing/billingIdentity';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import styles from './promptbookBilling.module.css';

type CompanyNameInputProps = {
    value: string;
    disabled: boolean;
    searchEnabled: boolean;
    onChange: (value: string) => void;
    onSelect: (company: PromptbookBillingIdentity) => void;
};

/** Suggestions supplement the editable name; choosing a registry result is never required. */
export function CompanyNameInput({ value, disabled, searchEnabled, onChange, onSelect }: CompanyNameInputProps) {
    const id = useId();
    const resultsRef = useRef<HTMLUListElement>(null);
    const [query, setQuery] = useState('');
    const [companies, setCompanies] = useState<PromptbookBillingIdentity[]>([]);
    const [status, setStatus] = useState('');
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    useEffect(() => {
        setCompanies([]);
        setActiveIndex(-1);
        if (!searchEnabled || disabled || !open || value !== query || query.trim().length < 3 || query.trim().length > 120) {
            setStatus('');
            return;
        }
        let current = true;
        setStatus('Hledáme firmy…');
        const timeout = window.setTimeout(() => {
            void sendJson<{ companies: PromptbookBillingIdentity[]; hasMore: boolean }>(
                '/api/promptbook-billing/company-search', 'POST', { country: 'CZ', query: query.trim() },
            ).then((result) => {
                if (!current) return;
                setCompanies(result.companies);
                setStatus(result.companies.length === 0
                    ? 'Firmu jsme nenašli. Údaje vyplňte ručně.'
                    : result.hasMore ? 'Zpřesněte název, nebo vyberte firmu.' : '');
            }).catch(() => {
                if (current) setStatus('Vyhledávání není dostupné. Údaje vyplňte ručně.');
            });
        }, 350);
        return () => {
            current = false;
            window.clearTimeout(timeout);
        };
    }, [query, value, searchEnabled, disabled, open]);

    useEffect(() => {
        if (activeIndex < 0) return;
        const list = resultsRef.current;
        const option = list?.children[activeIndex] as HTMLElement | undefined;
        if (!list || !option) return;
        if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
        else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
            list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
        }
    }, [activeIndex]);

    function selectCompany(company: PromptbookBillingIdentity) {
        setOpen(false);
        setQuery('');
        setCompanies([]);
        setStatus('');
        onSelect(company);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Escape') {
            setOpen(false);
        } else if (companies.length > 0 && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault();
            setActiveIndex((index) => event.key === 'ArrowDown'
                ? (index + 1) % companies.length
                : (index <= 0 ? companies.length : index) - 1);
        } else if (event.key === 'Enter' && activeIndex >= 0 && companies[activeIndex]) {
            event.preventDefault();
            selectCompany(companies[activeIndex]!);
        }
    }

    const showResults = open && companies.length > 0;
    return (
        <div className={styles.companySearch} onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
        }}>
            <label htmlFor={id}>Název firmy</label>
            <input id={id} name="billingName" required maxLength={200} autoComplete="off"
                value={value} disabled={disabled}
                role={searchEnabled ? 'combobox' : undefined}
                aria-autocomplete={searchEnabled ? 'list' : undefined}
                aria-expanded={searchEnabled ? showResults : undefined}
                aria-controls={showResults ? `${id}-results` : undefined}
                aria-activedescendant={showResults && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
                aria-describedby={status ? `${id}-status` : undefined}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                onChange={(event) => {
                    onChange(event.target.value);
                    setQuery(event.target.value);
                    setOpen(true);
                    setActiveIndex(-1);
                }} />
            {showResults && (
                <ul ref={resultsRef} className={styles.companyResults} id={`${id}-results`} role="listbox" aria-label="Nalezené firmy">
                    {companies.map((company, index) => (
                        <li key={company.companyId} id={`${id}-option-${index}`} role="option"
                            aria-selected={index === activeIndex} onMouseDown={(event) => event.preventDefault()}
                            onMouseMove={() => setActiveIndex(index)} onClick={() => selectCompany(company)}>
                            <strong>{company.name}</strong>
                            <span>IČO {company.companyId} · {company.address.line1}, {company.address.city}</span>
                        </li>
                    ))}
                </ul>
            )}
            {status && <p id={`${id}-status`} className={styles.small} role="status">{status}</p>}
        </div>
    );
}
