'use client';

import { CopyTextButton } from '@/components/shortener/CopyTextButton';
import { Button } from '@/components/ui/button';
import { TableScrollArea } from '@/components/ui/table-scroll-area';
import { formatShortcodeLinkDateTime } from '@/lib/shortener/formatShortcodeLinkDateTime';
import {
    createPublicShortcodeLinkUrl,
    getShortcodeLinkCreationLabel,
    getShortcodeLinkSourceAppLabel,
    type ShortcodeLink,
    type ShortcodeLinkSummary,
} from '@/lib/shortener/shortcodeLink';
import { ExternalLink, MousePointerClick, Pencil, Trash2 } from 'lucide-react';
import { SHORTCODE_LINK_DOMAINS } from '@/lib/shortener/shortcodeLinkDomains';

const CZECH_SHORTCODE_LINK_CLICK_COUNT_FORMAT = new Intl.NumberFormat('cs-CZ');

function getShortcodeLinkClickLabel(clickCount: number): string {
    return `${CZECH_SHORTCODE_LINK_CLICK_COUNT_FORMAT.format(clickCount)} ${clickCount === 1 ? 'click' : 'clicks'}`;
}

type ShortcodeLinkTableProps = {
    readonly shortcodeLinks: readonly ShortcodeLinkSummary[];
    readonly editedShortcodeLinkId: number | null;
    readonly deletedShortcodeLinkId: number | null;
    readonly canUpdate: boolean;
    readonly canDelete: boolean;
    readonly canViewClicks: boolean;
    readonly onEdit: (shortcodeLink: ShortcodeLink) => void;
    readonly onDelete: (shortcodeLink: ShortcodeLink) => void;
    readonly onShowClicks: (shortcodeLink: ShortcodeLinkSummary) => void;
};

/**
 * Shows every short link there is, together with what each one leads to and the two actions which change it.
 */
export function ShortcodeLinkTable({
    shortcodeLinks,
    editedShortcodeLinkId,
    deletedShortcodeLinkId,
    canUpdate,
    canDelete,
    canViewClicks,
    onEdit,
    onDelete,
    onShowClicks,
}: ShortcodeLinkTableProps) {
    return (
        <TableScrollArea horizontalScrollLabel="Scroll shortened links horizontally">
            <table className="w-full min-w-[1020px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                        <th data-table-pinned-column="true" className="px-6 py-3 font-semibold">
                            Short link
                        </th>
                        <th className="px-6 py-3 font-semibold">Destinations</th>
                        <th className="px-6 py-3 font-semibold">Note</th>
                        <th className="px-6 py-3 font-semibold">Landing page</th>
                        <th className="px-6 py-3 font-semibold">Creation</th>
                        <th className="px-6 py-3 font-semibold">Application</th>
                        <th className="px-6 py-3 text-right font-semibold">Clicks</th>
                        <th className="px-6 py-3 font-semibold">Created</th>
                        <th className="px-6 py-3 text-right font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {shortcodeLinks.map((shortcodeLink) => {
                        const publicUrl = createPublicShortcodeLinkUrl(shortcodeLink.shortcode, shortcodeLink.domains);
                        const isDeleted = deletedShortcodeLinkId === shortcodeLink.id;
                        const isEdited = editedShortcodeLinkId === shortcodeLink.id;

                        return (
                            <tr key={shortcodeLink.id} className={isEdited ? 'bg-cyan-50/60 align-top' : 'align-top'}>
                                <td data-table-pinned-column="true" className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <a
                                            href={publicUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-mono font-semibold text-cyan-700 hover:underline"
                                        >
                                            {shortcodeLink.shortcode}
                                        </a>
                                        <CopyTextButton text={publicUrl} label={`Copy ${publicUrl}`} />
                                    </div>
                                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                                        <p>{shortcodeLink.domains == null ? 'All domains' : 'Selected domains'}</p>
                                        {(shortcodeLink.domains ?? SHORTCODE_LINK_DOMAINS).map((domain) => <a
                                            key={domain} className="block hover:text-cyan-700 hover:underline" target="_blank" rel="noreferrer"
                                            href={`https://${domain}/${shortcodeLink.shortcode}`}
                                        >{domain}/{shortcodeLink.shortcode}</a>)}
                                    </div>
                                </td>
                                <td className="max-w-sm px-6 py-4">
                                    <ul className="space-y-1">
                                        {shortcodeLink.urls.map((url, index) => (
                                            <li key={index} className="truncate">
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title={url}
                                                    className="text-slate-600 hover:text-cyan-700 hover:underline"
                                                >
                                                    {url}
                                                </a>
                                            </li>
                                        ))}
                                        {shortcodeLink.urls.length === 0 && (
                                            <li className="text-rose-600">No destination</li>
                                        )}
                                    </ul>
                                </td>
                                <td className="max-w-xs px-6 py-4 text-slate-600">
                                    <span className="line-clamp-3" title={shortcodeLink.note ?? undefined}>
                                        {shortcodeLink.note ?? '—'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {shortcodeLink.landingPage === null ? (
                                        <span className="text-slate-400">Redirect</span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                            Landing page
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                    {getShortcodeLinkCreationLabel(shortcodeLink.isAdHoc)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                    {getShortcodeLinkSourceAppLabel(shortcodeLink.sourceApp)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                    {canViewClicks ? <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-cyan-700 hover:text-cyan-800"
                                        aria-label={`Show ${getShortcodeLinkClickLabel(shortcodeLink.clickCount)} for ${shortcodeLink.shortcode}`}
                                        onClick={() => onShowClicks(shortcodeLink)}
                                    >
                                        <MousePointerClick className="mr-1.5 h-4 w-4" />
                                        {getShortcodeLinkClickLabel(shortcodeLink.clickCount)}
                                    </Button> : <span className="text-slate-600">{getShortcodeLinkClickLabel(shortcodeLink.clickCount)}</span>}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                    {formatShortcodeLinkDateTime(shortcodeLink.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={publicUrl} target="_blank" rel="noreferrer" aria-label="Open">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        {canUpdate && <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isDeleted}
                                            onClick={() => onEdit(shortcodeLink)}
                                        >
                                            <Pencil className="mr-1.5 h-4 w-4" /> Edit
                                        </Button>}
                                        {canDelete && <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            disabled={isDeleted}
                                            onClick={() => onDelete(shortcodeLink)}
                                        >
                                            <Trash2 className="mr-1.5 h-4 w-4" />
                                            {isDeleted ? 'Deleting…' : 'Delete'}
                                        </Button>}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </TableScrollArea>
    );
}
