import type { COMPARISONS, ComparisonValue } from './comparisons';
import { comparisonPrice, type ComparisonPrice } from './comparisonPrices';

type Alternative = typeof COMPARISONS[number]['slug'];
type CommercialTerms = {
    price: ComparisonValue | ComparisonPrice;
    billing: ComparisonValue;
    allowance: ComparisonValue;
    licensing: ComparisonValue;
    source: string;
};

const copy = (cs: string, en: string): ComparisonValue => ({ cs, en });
const paid = copy('Předplatné', 'Subscription');
const mit = copy('Open source (MIT)', 'Open source (MIT)');
const freeSoftware = comparisonPrice('{0} za software', '{0} software fee', 'USD', [0]);
const ownCosts = copy('Vlastní hosting a AI', 'Your hosting and AI');
const noLicenceLimit = copy('Licence nestanoví limit', 'No licence cap');

export const ALTERNATIVE_COMMERCIAL_TERMS: Readonly<Record<Alternative, CommercialTerms>> = {
    'grok-bot': {
        price: comparisonPrice('Premium: {0}/měs.', 'Premium: {0}/mo', 'USD', [30]),
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
        price: comparisonPrice('Free: {0} · Plus: {1}/měs.', 'Free: {0} · Plus: {1}/mo', 'USD', [0, 20]),
        billing: copy('Podle uživatele a tarifu', 'Per user and plan'),
        allowance: copy('Agent a limity podle tarifu', 'Agent access and limits vary by plan'),
        licensing: copy('Free a předplatné', 'Free and subscription'),
        source: 'https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus',
    },
    'google-workspace': {
        price: comparisonPrice('Business Starter: {0}/měs. při ročním závazku', 'Business Starter: {0}/mo on annual commitment', 'USD', [7]),
        billing: copy('Za uživatele Workspace', 'Per Workspace user'),
        allowance: copy('Až 25 postupů na uživatele', 'Up to 25 flows per user'),
        licensing: paid,
        source: 'https://workspace.google.com/pricing',
    },
    'claude-cowork': {
        price: comparisonPrice('Pro: {0}/měs.', 'Pro: {0}/mo', 'USD', [20]),
        billing: copy('Za uživatele Claude', 'Per Claude user'),
        allowance: copy('Sdílené využití Claude', 'Shared Claude usage'),
        licensing: paid,
        source: 'https://claude.com/pricing',
    },
    'claude-code': {
        price: comparisonPrice('Pro: {0}/měs. nebo spotřeba API', 'Pro: {0}/mo or metered API', 'USD', [20]),
        billing: copy('Předplatné nebo tokeny API', 'Subscription or API tokens'),
        allowance: copy('Sdílené využití Claude u předplatného', 'Shared Claude usage on subscription'),
        licensing: copy('Předplatné nebo API', 'Subscription or API'),
        source: 'https://claude.com/pricing',
    },
    codex: {
        price: comparisonPrice('Free: {0} · Plus: {1}/měs.', 'Free: {0} · Plus: {1}/mo', 'USD', [0, 20]),
        billing: copy('Tarif ChatGPT, podle plánu i kredity', 'ChatGPT plan, plus credits where offered'),
        allowance: copy('Free s limitem, cloud od způsobilého Plus', 'Limited Free access, cloud from eligible Plus'),
        licensing: copy('Free a předplatné', 'Free and subscription'),
        source: 'https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan',
    },
    n8n: {
        price: comparisonPrice('Community: {0} · Cloud Starter: {1}/měs. při roční platbě', 'Community: {0} · Cloud Starter: {1}/mo billed annually', 'EUR', [0, 20]),
        billing: copy('Cloud podle počtu spuštění workflow', 'Cloud priced by workflow executions'),
        allowance: copy('Starter: 2 500 spuštění/měs.', 'Starter: 2,500 executions/mo'),
        licensing: copy('Community pod Sustainable Use License nebo placený tarif', 'Community under Sustainable Use License or paid plan'),
        source: 'https://n8n.io/pricing/',
    },
    make: {
        price: comparisonPrice('Free: {0}', 'Free: {0}', 'USD', [0]),
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
        price: comparisonPrice('{0} za balík/měs. nebo podle spotřeby', '{0} per pack/mo or pay as you go', 'USD', [200]),
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
