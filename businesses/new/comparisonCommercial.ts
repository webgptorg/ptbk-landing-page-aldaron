import type { COMPARISONS, ComparisonValue } from './comparisons';

type Alternative = typeof COMPARISONS[number]['slug'];
type CommercialTerms = {
    price: ComparisonValue;
    billing: ComparisonValue;
    allowance: ComparisonValue;
    licensing: ComparisonValue;
    source: string;
};

const copy = (cs: string, en: string): ComparisonValue => ({ cs, en });
const paid = copy('Předplatné', 'Subscription');
const mit = copy('Open source (MIT)', 'Open source (MIT)');
const freeSoftware = copy('0 za software', '0 software fee');
const ownCosts = copy('Vlastní hosting a AI', 'Your hosting and AI');
const noLicenceLimit = copy('Licence nestanoví limit', 'No licence cap');

export const ALTERNATIVE_COMMERCIAL_TERMS: Readonly<Record<Alternative, CommercialTerms>> = {
    'grok-bot': {
        price: copy('Premium: 30 USD/měs.', 'Premium: $30/mo'),
        billing: copy('Za uživatele, sdílený limit Groku', 'Per seat, shared Grok usage'),
        allowance: copy('Týdenní limit podle tarifu', 'Weekly usage varies by plan'),
        licensing: paid,
        source: 'https://docs.x.ai/x-subscription/pricing',
    },
    openclaw: {
        price: freeSoftware, billing: ownCosts, allowance: noLicenceLimit, licensing: mit,
        source: 'https://github.com/openclaw/openclaw',
    },
    'openai-dots': {
        price: copy('V ceně způsobilého tarifu', 'Included in eligible plans'),
        billing: copy('ChatGPT Pro, Business Premium nebo Enterprise', 'ChatGPT Pro, Business Premium or Enterprise'),
        allowance: copy('1 dot v Pro a Business Premium', '1 dot in Pro and Business Premium'),
        licensing: paid,
        source: 'https://openai.com/index/introducing-dots/',
    },
    'meta-muse': {
        price: copy('Základ zdarma', 'Free basic access'),
        billing: copy('Bezplatný základ, volitelné předplatné', 'Free basic access, optional subscription'),
        allowance: copy('Dle tarifu a dostupnosti', 'Depends on plan and availability'),
        licensing: copy('Cloudová služba', 'Hosted service'),
        source: 'https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/',
    },
    chatgpt: {
        price: copy('Free: 0 · Plus: 20 USD/měs.', 'Free: $0 · Plus: $20/mo'),
        billing: copy('Podle uživatele a tarifu', 'Per user and plan'),
        allowance: copy('Agent a limity podle tarifu', 'Agent access and limits vary by plan'),
        licensing: copy('Free a předplatné', 'Free and subscription'),
        source: 'https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus',
    },
    'google-workspace': {
        price: copy('Business Starter: 7 USD/měs. při ročním závazku', 'Business Starter: $7/mo on annual commitment'),
        billing: copy('Za uživatele Workspace', 'Per Workspace user'),
        allowance: copy('Až 25 postupů na uživatele', 'Up to 25 flows per user'),
        licensing: paid,
        source: 'https://workspace.google.com/pricing',
    },
    'claude-cowork': {
        price: copy('Pro: 20 USD/měs.', 'Pro: $20/mo'),
        billing: copy('Za uživatele Claude', 'Per Claude user'),
        allowance: copy('Sdílené využití Claude', 'Shared Claude usage'),
        licensing: paid,
        source: 'https://claude.com/pricing',
    },
    'claude-code': {
        price: copy('Pro: 20 USD/měs. nebo spotřeba API', 'Pro: $20/mo or metered API'),
        billing: copy('Předplatné nebo tokeny API', 'Subscription or API tokens'),
        allowance: copy('Sdílené využití Claude u předplatného', 'Shared Claude usage on subscription'),
        licensing: copy('Předplatné nebo API', 'Subscription or API'),
        source: 'https://claude.com/pricing',
    },
    codex: {
        price: copy('Free: 0 · Plus: 20 USD/měs.', 'Free: $0 · Plus: $20/mo'),
        billing: copy('Tarif ChatGPT, podle plánu i kredity', 'ChatGPT plan, plus credits where offered'),
        allowance: copy('Free s limitem, cloud od způsobilého Plus', 'Limited Free access, cloud from eligible Plus'),
        licensing: copy('Free a předplatné', 'Free and subscription'),
        source: 'https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan',
    },
    n8n: {
        price: copy('Community: 0 · Cloud Starter: 20 EUR/měs. při roční platbě', 'Community: €0 · Cloud Starter: €20/mo billed annually'),
        billing: copy('Cloud podle počtu spuštění workflow', 'Cloud priced by workflow executions'),
        allowance: copy('Starter: 2 500 spuštění/měs.', 'Starter: 2,500 executions/mo'),
        licensing: copy('Community pod Sustainable Use License nebo placený tarif', 'Community under Sustainable Use License or paid plan'),
        source: 'https://n8n.io/pricing/',
    },
    make: {
        price: copy('Free: 0 USD', 'Free: $0'),
        billing: copy('Tarif a kredity za spotřebu', 'Plan and usage credits'),
        allowance: copy('Free: 1 000 kreditů/měs.', 'Free: 1,000 credits/mo'),
        licensing: copy('Free a předplatné', 'Free and subscription'),
        source: 'https://www.make.com/en/pricing',
    },
    paperclip: {
        price: freeSoftware, billing: ownCosts, allowance: noLicenceLimit, licensing: mit,
        source: 'https://github.com/paperclipai/paperclip',
    },
    'microsoft-copilot-studio': {
        price: copy('200 USD za balík/měs. nebo podle spotřeby', '$200 per pack/mo or pay as you go'),
        billing: copy('Copilot Credits za akce a odpovědi', 'Copilot Credits for actions and responses'),
        allowance: copy('25 000 Copilot Credits na balík', '25,000 Copilot Credits per pack'),
        licensing: copy('Balíky nebo platba podle spotřeby', 'Capacity packs or pay as you go'),
        source: 'https://www.microsoft.com/en-us/copilot/pricing/copilot-studio',
    },
};

export const COMMERCIAL_ROWS = [
    { id: 'price', cs: 'Příklad ceny', en: 'Example price' },
    { id: 'billing', cs: 'Co se účtuje', en: 'Billing unit' },
    { id: 'allowance', cs: 'Příklad kapacity', en: 'Example allowance' },
    { id: 'licensing', cs: 'Licence a tarif', en: 'Licence and plan' },
] as const;
