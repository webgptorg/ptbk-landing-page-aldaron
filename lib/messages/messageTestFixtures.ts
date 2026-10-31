import { PAVOL_MESSAGE_AGENT_ID, type ManagedMessage } from './messageModel';
export const TEST_MESSAGE: ManagedMessage = {
    id: '1fb797b1-0cfa-43f4-bacf-e43f7d65d419', shortcodeLinkId: 42, shortcode: 'prvni-vydani-AbCd1234',
    title: 'První vydání', markdown: 'Ahoj týme,\n\nNejdřív dokončíme registraci a první použití.', context: 'Source decisions. Open question about a later release.',
    introduction: 'Můžeme probrat registraci nebo první použití.', prefix: 'prvni-vydani', domain: 'pavolhejny.cz',
    agentId: PAVOL_MESSAGE_AGENT_ID, createdAt: '2026-10-31T20:00:00Z', updatedAt: '2026-10-31T20:00:00Z', audio: null, audioIsCurrent: false,
};
