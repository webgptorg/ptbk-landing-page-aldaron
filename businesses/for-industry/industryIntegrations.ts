import chatAsset from '@/public/integrations/chat.png';
import gmailAsset from '@/public/integrations/gmail.png';
import graphAsset from '@/public/integrations/graph.png';
import vscodeAsset from '@/public/integrations/vscode.png';
import { Integration } from '../../components/integrations-section';

export const industryIntegrations: Array<Integration> = [
    {
        preview: chatAsset,
        title: 'Technical support chat',
        description: 'Answer customer and technician questions from the manuals and procedures you provide.',
        features: ['Available 24/7', 'Answers grounded in your material', 'Controlled responses'],
    },
    {
        preview: gmailAsset,
        title: 'Support email drafts',
        description: 'Analyze technical questions and prepare replies for your team to review.',
        features: ['Automatic analysis', 'Relevant context', 'Draft replies'],
    },
    {
        preview: vscodeAsset,
        title: 'Engineering coding assistant',
        description: 'Keep your coding style, architecture, and security rules close at hand in the tools your team uses.',
        features: ['Your coding standards', 'Architecture rules', 'Security checks'],
    },
    {
        preview: graphAsset,
        title: 'Internal expertise',
        description: 'Bring company knowledge into internal apps for data analysis, sentiment analysis, and other tasks.',
        features: ['Custom automations', 'Data analysis', 'Sentiment classification'],
    },
];
