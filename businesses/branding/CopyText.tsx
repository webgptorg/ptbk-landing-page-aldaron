'use client';

import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard';
import s from './branding.module.css';

/** Visible source text stays selectable when the browser refuses the clipboard. */
export function CopyText({ text, language }: { text: string; language: 'cs' | 'en' }) {
    const { copyText, copyStatus } = useCopyTextToClipboard();
    const cs = language === 'cs';
    return <div className={s.copyControl}>
        <button type="button" onClick={() => void copyText(text)}>{cs ? 'Kopírovat' : 'Copy'}</button>
        <span role="status">{copyStatus === 'copied' ? (cs ? 'Zkopírováno' : 'Copied') : copyStatus === 'failed' ? (cs ? 'Označte a zkopírujte text ručně.' : 'Select and copy the text manually.') : ''}</span>
    </div>;
}
