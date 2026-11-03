import type { ContactSubmissionEvidence } from '@/lib/contacts/contactSubmissionPolicy';

/** The recorded choice is historical evidence, never a claim that consent has not since been withdrawn. */
export function ContactSubmissionEvidenceDetails({ evidence }: { evidence?: ContactSubmissionEvidence | null }) {
    if (!evidence) return <p className="my-2 text-xs text-slate-500">Souhlas ani informační text nejsou u tohoto záznamu evidovány. Souhlas nelze dovozovat.</p>;
    return <details className="my-3 rounded border border-slate-200 p-3 text-xs text-slate-600">
        <summary className="cursor-pointer font-medium">Účel a záznam volby: {evidence.marketingConsent ? 'souhlas s konkrétními novinkami' : 'vyřízení požadavku bez newsletteru'}</summary>
        <dl className="mt-2 space-y-1">
            <div><dt className="inline font-medium">Účel a zdroj: </dt><dd className="inline break-words">{evidence.purpose} · {evidence.source}</dd></div>
            <div><dt className="inline font-medium">Přijato: </dt><dd className="inline">{evidence.receivedAt}</dd></div>
            <div><dt className="inline font-medium">Verze a jazyk: </dt><dd className="inline">{evidence.version} · {evidence.language}</dd></div>
            <div><dt className="font-medium">Informační text</dt><dd>{evidence.noticeText}</dd></div>
            {evidence.consentText && <div><dt className="font-medium">Znění souhlasu</dt><dd>{evidence.consentText}</dd></div>}
        </dl>
        <p className="mt-2">Schránka není ověřena. Před rozesílkou je nutné zohlednit odvolání souhlasu a odmítnutí; tento historický záznam je nenahrazuje.</p>
    </details>;
}
