import { Cable, FileText, History, MessagesSquare, Paperclip, Send, type LucideIcon } from 'lucide-react';
import { COMMUNITY_MEMBERSHIP_PATH, CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK } from '@/businesses/community/membership/communityMembershipConfig';
import { createPublicUrl } from '@/lib/domains/publicDomainRouting';
import { AVATAR_PUBLIC_PRICE_CZK, type AvatarAvailability } from '@/lib/pavol-avatar/presentation';

type Plan = keyof AvatarAvailability['limits'];
type Props = {
    language: 'cs' | 'en';
    availability: AvatarAvailability;
    currentPlan?: Plan;
    busy: boolean;
    onFree: (trigger: HTMLButtonElement) => void;
    onFull: (trigger: HTMLButtonElement) => void;
};

function Feature({ icon: Icon, label, detail }: { icon: LucideIcon; label: string; detail?: string }) {
    return <li><Icon size={18} aria-hidden="true" /><span>{label}{detail && <small>{detail}</small>}</span></li>;
}

export function AvatarPlans({ language, availability, currentPlan, busy, onFree, onFull }: Props) {
    const cs = language === 'cs';
    const prices = { full: AVATAR_PUBLIC_PRICE_CZK, light: CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK, free: 0 };
    const descriptions = {
        full: cs ? 'Měsíční předplatné bez ročního závazku.' : 'Monthly subscription with no annual commitment.',
        light: cs ? 'V ceně členství v komunitě Vývojáři.' : 'Included in the Developers community membership.',
        free: cs ? 'Vyzkoušej si avatara bez platební karty.' : 'Try the avatar without a payment card.',
    };
    return <div className="avatar-plan-grid">
        {(['full', 'light', 'free'] as const).map(kind => {
            const name = { full: 'Full', light: 'Light', free: 'Free' }[kind];
            const limit = availability.limits[kind];
            const questions = cs ? (limit === 1 ? 'otázka' : limit >= 2 && limit <= 4 ? 'otázky' : 'otázek') : (limit === 1 ? 'question' : 'questions');
            const quota = `${limit} ${questions} ${cs ? 'za kalendářní měsíc' : 'per calendar month'}`;
            return <article key={kind} className="avatar-plan" data-plan={kind} aria-labelledby={`avatar-plan-${kind}`}>
                <h2 id={`avatar-plan-${kind}`}>{name}</h2>
                <p className="avatar-plan-price"><strong>{prices[kind].toLocaleString(cs ? 'cs-CZ' : 'en-GB')} Kč</strong> <span>/ {cs ? 'měsíc' : 'month'}</span></p>
                <p className="avatar-plan-description">{descriptions[kind]}</p>
                {kind === 'light' ? <a className="avatar-plan-action" href={createPublicUrl(COMMUNITY_MEMBERSHIP_PATH)} hrefLang="cs">
                    {cs ? 'Přejít do komunity' : 'Visit the community'}
                </a> : kind === 'full' ? <button className="avatar-plan-action" type="button"
                    disabled={busy || !availability.billingEnabled || currentPlan === 'full'} aria-haspopup={currentPlan ? undefined : 'dialog'}
                    onClick={event => onFull(event.currentTarget)}>
                    {currentPlan === 'full' ? (cs ? 'Tvůj tarif' : 'Your plan') : (cs ? 'Získat Full' : 'Get Full')}
                </button> : <button className="avatar-plan-action" type="button" disabled={busy || (!currentPlan && !availability.authEnabled)}
                    aria-haspopup={currentPlan ? undefined : 'dialog'} onClick={event => onFree(event.currentTarget)}>
                    {currentPlan ? (cs ? 'Otevřít chat' : 'Open chat') : (cs ? 'Vyzkoušet zdarma' : 'Try for free')}
                </button>}
                <ul className="avatar-plan-features">
                    <Feature icon={MessagesSquare} label={quota} />
                    <Feature icon={Paperclip} label={cs ? 'Webový chat a přílohy' : 'Web chat and attachments'} />
                    <Feature icon={History} label={cs ? 'Historie napříč zařízeními' : 'History across devices'} />
                    {kind === 'full' && <>
                        <Feature icon={Cable} label={cs ? 'Připojení přes MCP' : 'MCP connections'} detail="Claude Code, Codex, OpenCode" />
                        <Feature icon={FileText} label="SKILL.md" detail={cs ? 'Živé konzultace s avatarem přes MCP' : 'Consult the live avatar through MCP'} />
                        {availability.telegramEnabled && <Feature icon={Send} label={cs ? 'Chat přes Telegram' : 'Chat on Telegram'} />}
                    </>}
                </ul>
            </article>;
        })}
    </div>;
}
