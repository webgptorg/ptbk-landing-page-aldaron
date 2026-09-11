import { Conversation } from '@/lib/conversations-data';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import spaceTrim from 'spacetrim';

export const industryConversation = {
    title: 'Pump maintenance and safety',
    description: 'An engineer checks an overheating pump against the maintenance procedure and safety rules.',
    participants: [
        {
            name: 'USER',
            fullname: 'Maintenance engineer',
            color: '#1c6981ff',
            personality: '',
            avatar: jiriJahn.src,
            isMe: true,
        },
        {
            name: 'AGENT',
            fullname: 'Engineering & Compliance Advisor',
            color: '#5df1e8ff',
            personality: '',
            avatar: pavolHejny.src,
        },
    ],
    messages: [
        {
            author: 'USER',
            content: 'The pump on line 3 is overheating and tripping. What should I do?',
            timestamp: '2024-01-15T10:00:00Z',
        },
        {
            author: 'AGENT',
            content: spaceTrim(`
                Treat this as a safety issue. Stop nonessential operation and follow the lockout-tagout procedure in SOP 4.2.

                1. Isolate the power.
                2. Check the bearing temperatures.
                3. Inspect the lubrication.
                4. Record the readings.

                Use the required PPE and keep a safe distance. If the vibration or temperature is outside the stated limits, call the maintenance engineer and log the incident.

                References: Company SOP 4.2 and Pump manual §5.3.
            `),
            timestamp: '2024-01-15T10:01:30Z',
        },
    ],
} satisfies Conversation;
