import { Paperclip, X } from 'lucide-react';
import { chatAttachmentHref, type MessageChatAttachment } from '@/lib/messages/messageAttachments';
import './messageAttachments.css';

/** Persisted IDs resolve fresh CDN URLs; expiring signatures never enter transcripts or localStorage. */
export function MessageAttachments({ files = [], admin = false, onRemove, language = 'cs' }: {
    readonly files?: readonly MessageChatAttachment[]; readonly admin?: boolean; readonly language?: 'cs' | 'en';
    readonly onRemove?: (id: string) => void;
}) {
    if (!files.length) return null;
    return <ul className="message-attachments" aria-label={language === 'cs' ? 'Přílohy' : 'Attachments'}>{files.map((file) => <li key={file.id}>
        <a href={chatAttachmentHref(file.id, admin)} target="_blank" rel="noopener noreferrer">
            {file.contentType.startsWith('image/') ? <img src={chatAttachmentHref(file.id, admin)} alt={file.name} loading="lazy" /> : <Paperclip size={18} aria-hidden="true" />}
            <span>{file.name}<small>{Math.max(1, Math.round(file.byteLength / 1024))} kB</small></span>
        </a>
        {onRemove && <button type="button" onClick={() => onRemove(file.id)} aria-label={`${language === 'cs' ? 'Odebrat' : 'Remove'} ${file.name}`}><X size={16} aria-hidden="true" /></button>}
    </li>)}</ul>;
}
